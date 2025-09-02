package site.hyukpt.backend_server.team.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import site.hyukpt.backend_server.global.exception.BusinessException;
import site.hyukpt.backend_server.global.exception.GlobalErrorCode;
import site.hyukpt.backend_server.team.dto.TeamConfigRequestDTO;
import site.hyukpt.backend_server.team.dto.TeamConfigResponseDTO;
import site.hyukpt.backend_server.team.dto.TeamMatchResponseDTO;
import site.hyukpt.backend_server.team.exception.TeamErrorCode;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeamService {
    private static final List<String> ALLOWED_POSITION = List.of("top", "jg", "mid", "ad", "sup");
    private static final String COOKIE_NAME = "team_config";
    private final ObjectMapper objectMapper;
    private final Random random = new Random();
    private final ValidateService validateService;

    public TeamConfigResponseDTO saveConfigToCookie(@Valid TeamConfigRequestDTO request, HttpServletResponse response) {

        // request값 검증
        validateService.validateTeamConfigRequest(request);

        // cookie 생성
        String json = request.toJsonOrThrow(objectMapper);
        String encoded = URLEncoder.encode(json, StandardCharsets.UTF_8);

        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, encoded)
                .httpOnly(true)
                .secure(false)  // 로컬 테스트 시 false로 조정필수
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(1))
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        return TeamConfigResponseDTO.builder()
                .status("ok")
                .saved(request)
                .build();
    }


    public TeamMatchResponseDTO matchTeamFromCookie(HttpServletRequest request) {
        // cookie에서 team config 정보 읽기
        TeamConfigRequestDTO config = this.getConfigFromCookie(request);
        List<String> members = config.getMembers();

        // 1. 먼저 팀부터 배정
        Set<String> team1 = new HashSet<>();
        Set<String> team2 = new HashSet<>();

        // 제약조건이 없다면 그냥 5:5로 완전랜덤팀분할
        if (this.hasNoConstraints(config)) {
            log.debug("제약조건이 없는 팀 배정 시작");
            this.assignMembersRandomly(members, team1, team2);
        } else { // 조건이 있다면 조건에 따라 팀분할
            log.debug("제약조건이 있는 팀 배정 시작");
            this.assignTeamsWithConstraints(config, team1, team2);
        }

        // 2. 포지션 배정
        TeamMatchResponseDTO.Result result = this.assignPositions(team1, team2, config.getPreferPositions());

        return TeamMatchResponseDTO.builder()
                .status("ok")
                .result(result)
                .build();
    }


    private boolean hasNoConstraints(TeamConfigRequestDTO config) {
        return config.getConstraints() == null ||
                (ObjectUtils.isEmpty(config.getConstraints().getMustBeSameTeamGroups()) &&
                        ObjectUtils.isEmpty(config.getConstraints().getMustBeDifferentTeamPairs()));
    }

    private void assignMembersRandomly(List<String> members, Set<String> team1, Set<String> team2) {
        Collections.shuffle(members, random);
        log.debug("members shuffle 결과 + {}", members);

        for (int i = 0; i < members.size(); i++) {
            if (i < 5) {
                team1.add(members.get(i));
            } else {
                team2.add(members.get(i));
            }
        }
    }

    private void assignTeamsWithConstraints(TeamConfigRequestDTO config, Set<String> team1, Set<String> team2) {
        List<String> members = config.getMembers();
        Set<String> assignedMembers = new HashSet<>(); // 이미 배정완료된 멤버 확인용

        List<List<String>> sameTeamGroupsInput = config.getConstraints().getMustBeSameTeamGroups();

        //  같은팀이 되어야 하는 애들끼리 입력 조건을 깔끔하게 중복제거하여 정리
        List<Set<String>> sameTeamGroups = mergeSameTeamGroups(sameTeamGroupsInput);
        log.debug("같은팀 조건 정리 결과 sameTeamGroups: {} ", sameTeamGroupsInput);

        // 팀 배정 시작: 다른팀 되어야 하는 애들부터 양쪽에 박기
        List<List<String>> differentTeamPairsInput = config.getConstraints().getMustBeDifferentTeamPairs();

        processDifferentTeamPairs(differentTeamPairsInput,
                sameTeamGroups, team1, team2, assignedMembers);

        // 남은 멤버들 팀 배정하기
        assignRemainingGroupsAndMembers(sameTeamGroups, assignedMembers, members, team1, team2);

        // 팀 최종 검증
        if (team1.size() != 5 || team2.size() != 5) {
            throw BusinessException.builder()
                    .errorCode(TeamErrorCode.TEAM_MATCH_FAILED)
                    .detail("팀 구성 실패: team1=" + team1.size() + "명, team2=" + team2.size() + "명")
                    .build();
        }
    }

    private void processDifferentTeamPairs(List<List<String>> differentTeamPairsInput, List<Set<String>> sameTeamGroups, Set<String> team1, Set<String> team2, Set<String> assignedMembers) {
        if (!ObjectUtils.isEmpty(differentTeamPairsInput)) {
            // 주의: 연관된 같은팀 그룹이 큰 pair부터 배정해야한다. 오류는 노션에 써놓음

            differentTeamPairsInput.sort((pair1, pair2) -> {
                int maxGroup1 = getPairMaxGroupSize(pair1, sameTeamGroups);
                int maxGroup2 = getPairMaxGroupSize(pair2, sameTeamGroups);
                return Integer.compare(maxGroup2, maxGroup1); // 큰 그룹 먼저
            });


            for (List<String> pair : differentTeamPairsInput) {
                String member1 = pair.get(0);
                String member2 = pair.get(1);
                log.debug("pair 처리 시작: {} vs {}", member1, member2);

                // 같은팀 & 다른팀 조건 동시에 중복되는지 모순 체크
                for (Set<String> sameTeamGroup : sameTeamGroups) {
                    if (sameTeamGroup.contains(member1) && sameTeamGroup.contains(member2)) {
                        throw BusinessException.builder()
                                .errorCode(TeamErrorCode.CONFLICTING_CONSTRAINTS)
                                .detail(member1 + " 과 " + member2 + " 가 같은팀이면서 다른팀일 수 없습니다.")
                                .build();
                    }
                }

                // 이미 한명이 배정이 완료된 멤버면 반대쪽에 넣고 끝
                if (team1.contains(member1)) {
                    team2.add(member2);
                } else if (team2.contains(member1)) {
                    team1.add(member2);
                } else if (team1.contains(member2)) {
                    team2.add(member1);
                } else if (team2.contains(member2)) {
                    team1.add(member1);
                } else {
                    int member1GroupSize = getMemberMaxGroupSize(member1, sameTeamGroups);
                    int member2GroupSize = getMemberMaxGroupSize(member2, sameTeamGroups);

                    boolean canMember1GoTeam1 = team1.size() + member1GroupSize <= 5;
                    boolean canMember1GoTeam2 = team2.size() + member1GroupSize <= 5;
                    boolean canMember2GoTeam1 = team1.size() + member2GroupSize <= 5;
                    boolean canMember2GoTeam2 = team2.size() + member2GroupSize <= 5;

                    log.debug("member1GroupSize = {}, member2GroupSize = {}", member1GroupSize, member2GroupSize);
                    log.debug("canMember1GoTeam1 = {}, canMember1GoTeam2 = {}, canMember2GoTeam1 = {}, canMember2GoTeam2 = {}", canMember1GoTeam1, canMember1GoTeam2, canMember2GoTeam1, canMember2GoTeam2);
                    if (!canMember1GoTeam1 || !canMember2GoTeam2) {
                        // member1은 team2만 가능
                        team2.add(member1);
                        team1.add(member2);
                        log.debug("강제 배정: {} -> team2, {} -> team1", member1, member2);
                    } else if (!canMember1GoTeam2 || !canMember2GoTeam1) {
                        // member1은 team2만 가능
                        team1.add(member1);
                        team2.add(member2);
                        log.debug("강제 배정: {} -> team1, {} -> team2", member1, member2);
                    } else {
                        // 둘 다 양쪽 다 갈 수 있으면 랜덤
                        if (random.nextBoolean()) {
                            team1.add(member1);
                            team2.add(member2);
                            log.debug("랜덤 배정: {} -> team1, {} -> team2", member1, member2);
                        } else {
                            team2.add(member1);
                            team1.add(member2);
                            log.debug("랜덤 배정: {} -> team2, {} -> team1", member1, member2);
                        }
                    }
                }

                // 같은팀이 되어야하는 그룹멤버 같이 배정
                log.debug("pair별 같은팀 그룹 처리 시작");
                for (Set<String> sameTeamGroup : sameTeamGroups) {
                    if (sameTeamGroup.contains(member1)) {
                        if (team1.contains(member1)) {
                            team1.addAll(sameTeamGroup);
                            log.debug("배정 결과: team1에 {} 멤버와 같은팀 그룹 {} 추가", member1, sameTeamGroup);
                        } else {
                            team2.addAll(sameTeamGroup);
                            log.debug("배정 결과: team2에 {} 멤버와 같은팀 그룹 {} 추가", member1, sameTeamGroup);
                        }
                    }
                    if (sameTeamGroup.contains(member2)) {
                        if (team1.contains(member2)) {
                            team1.addAll(sameTeamGroup);
                            log.debug("배정 결과: team1에 {} 멤버와 같은팀 그룹 {} 추가", member2, sameTeamGroup);
                        } else {
                            team2.addAll(sameTeamGroup);
                            log.debug("배정 결과: team2에 {} 멤버와 같은팀 그룹 {} 추가", member2, sameTeamGroup);
                        }
                    }

                    if (team1.size() >= 6) {
                        throw BusinessException.builder()
                                .errorCode(TeamErrorCode.TEAM_MATCH_FAILED)
                                .detail(team1 + " 의 그룹구성 불가. 5명 초과.")
                                .build();
                    }
                    if (team2.size() >= 6) {
                        throw BusinessException.builder()
                                .errorCode(TeamErrorCode.TEAM_MATCH_FAILED)
                                .detail(team2 + " 의 그룹구성 불가. 5명 초과.")
                                .build();
                    }
                }

                assignedMembers.addAll(team1);
                assignedMembers.addAll(team2);
                log.debug("현재 배정된 멤버들: {}", assignedMembers);
            }
        }
    }

    private int getPairMaxGroupSize(List<String> pair, List<Set<String>> sameTeamGroups) {
        int maxSize = 1; // 기본값 (그룹에 속하지 않은 경우)

        for (String member : pair) {
            for (Set<String> group : sameTeamGroups) {
                if (group.contains(member) && group.size() > maxSize) {
                    maxSize = group.size();
                }
            }
        }

        return maxSize;
    }

    private int getMemberMaxGroupSize(String member, List<Set<String>> sameTeamGroups) {
        int maxSize = 1; // 기본값 (그룹에 속하지 않은 경우)

        for (Set<String> group : sameTeamGroups) {
            if (group.contains(member) && group.size() > maxSize) {
                maxSize = group.size();
            }
        }

        return maxSize;
    }

    private List<Set<String>> mergeSameTeamGroups(List<List<String>> sameTeamGroupsInput) {
        List<Set<String>> sameTeamGroups = new ArrayList<>();

        // 같은팀 조건이 있다면
        if (!ObjectUtils.isEmpty(sameTeamGroupsInput)) {
            // 첫원소는 그냥 대입
            sameTeamGroups.add(new HashSet<>(sameTeamGroupsInput.getFirst()));

            for (int i = 1; i < sameTeamGroupsInput.size(); i++) {
                List<String> group = sameTeamGroupsInput.get(i);
                boolean isMerged = false;

                out:
                for (Set<String> groupSet : sameTeamGroups) {
                    for (String member : group) {
                        if (groupSet.contains(member)) {
                            groupSet.addAll(group);
                            isMerged = true;

                            if (groupSet.size() >= 6) {
                                throw BusinessException.builder()
                                        .errorCode(TeamErrorCode.CONFLICTING_CONSTRAINTS)
                                        .detail(groupSet + " 의 그룹구성 불가. 5명 초과. 같은팀 조건 확인 필요")
                                        .build();
                            }
                            break out;
                        }
                    }
                }

                // 기존 그룹과 합쳐지지 않는다면 새 그룹 추가
                if (!isMerged) {
                    sameTeamGroups.add(new HashSet<>(group));
                }
            }
        }

        return sameTeamGroups;
    }

    private void assignRemainingGroupsAndMembers(List<Set<String>> sameTeamGroups, Set<String> assignedMembers, List<String> members, Set<String> team1, Set<String> team2) {
        // 같은팀 그룹들부터 먼저 배정
        log.debug("===[같은팀 그룹들 랜덤 배정 시작]===");
        for (Set<String> sameTeamGroup : sameTeamGroups) {
            log.debug("{} 그룹 팀배정 시작", sameTeamGroup);
            // 이미 위에서 배정된 그룹이라면 스킵
            boolean isAlreadyAssigned = false;
            for (String member : sameTeamGroup) {
                if (assignedMembers.contains(member)) {
                    isAlreadyAssigned = true;
                    log.debug("isAlreadyAssigned: {} 그룹 팀배정 스킵", sameTeamGroup);
                    break;
                }
            }

            if (!isAlreadyAssigned) {
                boolean canGoToTeam1 = team1.size() + sameTeamGroup.size() <= 5;
                boolean canGoToTeam2 = team2.size() + sameTeamGroup.size() <= 5;

                if (canGoToTeam1 && canGoToTeam2) {
                    // 둘 다 가능하면 랜덤 선택
                    log.debug("team1, team2 둘다 배정 가능");
                    if (random.nextBoolean()) {
                        team1.addAll(sameTeamGroup);
                        log.debug("배정 결과: team1에 그룹 {} 추가", sameTeamGroup);
                    } else {
                        team2.addAll(sameTeamGroup);
                        log.debug("배정 결과: team2에 그룹 {} 추가", sameTeamGroup);
                    }
                } else if (canGoToTeam1) {
                    log.debug("team1만 배정 가능");
                    team1.addAll(sameTeamGroup);
                    log.debug("배정 결과: team1에 그룹 {} 추가", sameTeamGroup);
                } else if (canGoToTeam2) {
                    log.debug("team2만 배정 가능");
                    team2.addAll(sameTeamGroup);
                    log.debug("배정 결과: team2에 그룹 {} 추가", sameTeamGroup);
                } else {
                    // 둘 다 불가능
                    throw BusinessException.builder()
                            .errorCode(TeamErrorCode.TEAM_MATCH_FAILED)
                            .detail(sameTeamGroup + " 을 배정할 수 없습니다. 팀 크기 초과")
                            .build();
                }
                assignedMembers.addAll(sameTeamGroup);
            }
        }

        // 나머지 개별 멤버들 랜덤 배정
        log.debug("===[나머지 개별 멤버들 랜덤 배정 시작]===");
        for (String member : members) {
            if (!assignedMembers.contains(member)) {
                if (team1.size() < 5 && team2.size() < 5) {
                    log.debug("team1, team2 둘다 배정 가능");
                    if (random.nextBoolean()) {
                        team1.add(member);
                        log.debug("배정 결과: {} -> team1", member);
                    } else {
                        team2.add(member);
                        log.debug("배정 결과: {} -> team2", member);
                    }
                } else if (team1.size() < 5) {
                    log.debug("team1만 배정 가능");
                    team1.add(member);
                    log.debug("배정 결과: {} -> team1", member);
                } else if (team2.size() < 5) {
                    log.debug("team2만 배정 가능");
                    team2.add(member);
                    log.debug("배정 결과: {} -> team2", member);
                } else {
                    // 둘 다 꽉 참
                    throw BusinessException.builder()
                            .errorCode(TeamErrorCode.TEAM_MATCH_FAILED)
                            .detail("[team1] : " + team1 + "[team2] : " + team2 + " 모든 팀이 가득 참")
                            .build();
                }
            }
        }
    }

    private TeamMatchResponseDTO.Result assignPositions(Set<String> team1, Set<String> team2, List<TeamConfigRequestDTO.PreferPositions> preferPositions) {
        // 빠른 검색을 위해 Map 으로 변환
        Map<String, List<String>> memberPreferences = new HashMap<>();
        if (!ObjectUtils.isEmpty(preferPositions)) {
            for (TeamConfigRequestDTO.PreferPositions pref : preferPositions) {
                memberPreferences.put(pref.getName(), pref.getPrefer());
            }
        }

        // prefer가 없는 멤버들은 모든 포지션 가능함을 의미
        for (String member : team1) {
            if (!memberPreferences.containsKey(member)) {
                memberPreferences.put(member, ALLOWED_POSITION);
            }
        }
        for (String member : team2) {
            if (!memberPreferences.containsKey(member)) {
                memberPreferences.put(member, ALLOWED_POSITION);
            }
        }

        Map<String, String> assignResult = new HashMap<>();

        // team1 포지션 배정
        assignTeamPositions(team1, memberPreferences, assignResult, "1");

        // team2 포지션 배정
        assignTeamPositions(team2, memberPreferences, assignResult, "2");

        return TeamMatchResponseDTO.Result.builder()
                .top1(assignResult.get("top1"))
                .jg1(assignResult.get("jg1"))
                .mid1(assignResult.get("mid1"))
                .ad1(assignResult.get("ad1"))
                .sup1(assignResult.get("sup1"))
                .top2(assignResult.get("top2"))
                .jg2(assignResult.get("jg2"))
                .mid2(assignResult.get("mid2"))
                .ad2(assignResult.get("ad2"))
                .sup2(assignResult.get("sup2"))
                .build();
    }

    private void assignTeamPositions(Set<String> team, Map<String, List<String>> memberPreferences, Map<String, String> result, String teamNumber) {
        List<String> teamMembers = new ArrayList<>(team);
        List<String> positions = new ArrayList<>(ALLOWED_POSITION);
        Set<String> assignedMembers = new HashSet<>();

        // 포지션별로 배정 가능한 멤버들을 저장
        Map<String, List<String>> positionCandidates = new HashMap<>();
        for (String position : ALLOWED_POSITION) {
            positionCandidates.put(position, new ArrayList<>());

            for (String member : teamMembers) {
                List<String> preferences = memberPreferences.get(member);
                if (preferences != null && preferences.contains(position)) {
                    positionCandidates.get(position).add(member);
                }
            }
        }

        // 선택지가 적은 포지션부터 우선 배정
        positions.sort(Comparator.comparingInt(pos -> positionCandidates.get(pos).size()));

        // 5개 포지션 순서대로 배정할 것
        for (String position : positions) {
            List<String> candidates = positionCandidates.get(position);
            // 이미 배정된 멤버들 제외
            candidates.removeAll(assignedMembers);

            if (candidates.isEmpty()) {
                throw BusinessException.builder()
                        .errorCode(TeamErrorCode.POSITION_ASSIGNMENT_FAILED)
                        .detail("팀" + teamNumber + "의 " + position + " 포지션에 배정할 수 있는 멤버가 없습니다.")
                        .build();
            }

            // 해당 포지션에 올 후보자 중 랜덤 선택
            String selectedMember = candidates.get(random.nextInt(candidates.size()));
            result.put(position + teamNumber, selectedMember);
            assignedMembers.add(selectedMember);
        }

        // 모든 멤버가 배정되었는지 확인
        if (assignedMembers.size() != team.size()) {
            throw BusinessException.builder()
                    .errorCode(TeamErrorCode.POSITION_ASSIGNMENT_FAILED)
                    .detail("팀" + teamNumber + " 포지션 배정 실패: " + assignedMembers.size() + "/" + team.size() + "명 배정됨")
                    .build();
        }
    }

    private TeamConfigRequestDTO getConfigFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            throw BusinessException.builder()
                    .errorCode(TeamErrorCode.COOKIE_NOT_FOUND)
                    .build();
        }

        String configValue = null;
        for (Cookie cookie : cookies) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                configValue = cookie.getValue();
                break;
            }
        }

        if (configValue == null) {
            throw BusinessException.builder()
                    .errorCode(TeamErrorCode.TEAM_CONFIG_COOKIE_NOT_FOUND)
                    .build();
        }

        try {
            String decoded = URLDecoder.decode(configValue, StandardCharsets.UTF_8);
            return objectMapper.readValue(decoded, TeamConfigRequestDTO.class);
        } catch (Exception e) {
            throw BusinessException.builder()
                    .errorCode(GlobalErrorCode.INTERNAL_SERVER_ERROR)
                    .detail("쿠키 파싱 중 오류가 발생했습니다: " + e.getMessage())
                    .build();
        }
    }

}
