package site.hyukpt.backend_server.team.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import site.hyukpt.backend_server.global.exception.BusinessException;
import site.hyukpt.backend_server.global.exception.GlobalErrorCode;
import site.hyukpt.backend_server.team.dto.TeamConfigRequestDTO;
import site.hyukpt.backend_server.team.dto.TeamConfigResponseDTO;
import site.hyukpt.backend_server.team.exception.TeamErrorCode;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TeamService {
    private static final Set<String> ALLOWED_POSITION = Set.of("top", "jg", "mid", "ad", "sup");
    private static final String COOKIE_NAME = "team_config";
    private final ObjectMapper objectMapper;

    public TeamConfigResponseDTO saveConfigToCookie(@Valid TeamConfigRequestDTO request, HttpServletResponse response) {
        /*
            request값 검증
         */
        List<String> members = request.getMembers();

        Set<String> memberSet = new HashSet<>(members);

        // members 중복이름 방지
        if(memberSet.size() != 10) {
            Set<String> memberSetTemp = new HashSet<>();
            for(String name : members) {
                if(!memberSetTemp.add(name)) {
                    throw BusinessException.builder()
                            .errorCode(TeamErrorCode.DUPLICATE_MEMBER_NAME)
                            .detail("중복된 이름이 존재합니다. name = " + name)
                            .build();
                }
            }

        }

        if(request.getConstraints() != null) {
            List<List<String>> mustBeSameTeamGroups = request.getConstraints().getMustBeSameTeamGroups();
            List<List<String>> mustBeDifferentTeamPairs = request.getConstraints().getMustBeDifferentTeamPairs();

            if (mustBeSameTeamGroups != null && !mustBeSameTeamGroups.isEmpty()) {
                validateSameTeamGroups(mustBeSameTeamGroups, memberSet);
            }

            if(mustBeDifferentTeamPairs != null && !mustBeDifferentTeamPairs.isEmpty()) {
                validateDifferentTeamPairs(mustBeDifferentTeamPairs, memberSet);
            }
        }

        List<TeamConfigRequestDTO.PreferPositions> preferPositions = request.getPreferPositions();

        if (preferPositions != null && !preferPositions.isEmpty()) {
            validatePreferPositions(preferPositions, memberSet);
        }

        // cookie 생성
        String json = toJsonOrThrow(request);
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

    // java객체 -> json 문자열로 직렬화
    private String toJsonOrThrow(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw BusinessException.builder()
                    .errorCode(GlobalErrorCode.INTERNAL_SERVER_ERROR)
                    .customMessage("설정을 직렬화하는 중 오류가 발생했습니다.")
                    .detail(e.getOriginalMessage())
                    .build();
        }
    }

    private void validatePreferPositions(List<TeamConfigRequestDTO.PreferPositions> preferPositions, Set<String> memberSet) {
        for(int i=0; i<preferPositions.size(); i++){
            TeamConfigRequestDTO.PreferPositions preferPosition = preferPositions.get(i);
            String name = preferPosition.getName();
            List<String> prefer = preferPosition.getPrefer();

            if(!memberSet.contains(name)) {
                throw BusinessException.builder()
                        .errorCode(TeamErrorCode.NAME_NOT_IN_MEMBERS)
                        .detail(i + " 번째 preferPosition의 " + name + "이라는 이름이 members에 존재하지 않습니다.")
                        .build();
            }

            if(prefer == null || prefer.isEmpty() || prefer.size() > 5) {
                throw BusinessException.builder()
                        .errorCode(TeamErrorCode.INVALID_PREFER_SIZE)
                        .detail(i + " 번째 preferPosition의 개수가 잘못되었습니다. size = " + prefer.size())
                        .build();
            }

            for (String pre : prefer) {
                if (!TeamService.ALLOWED_POSITION.contains(pre)) {
                    throw BusinessException.builder()
                            .errorCode(TeamErrorCode.INVALID_POSITION_NAME)
                            .detail(i + " 번째 preferPosition의 position name이 올바르지 않습니다. prefer=" + pre)
                            .build();
                }
            }

        }
    }

    private void validateDifferentTeamPairs(List<List<String>> mustBeDifferentTeamPairs, Set<String> memberSet) {

        for(int i=0; i<mustBeDifferentTeamPairs.size(); i++) {
            List<String> pair = mustBeDifferentTeamPairs.get(i);

            if(pair == null || pair.size() != 2) {
                throw BusinessException.builder()
                        .errorCode(TeamErrorCode.INVALID_PAIR_SIZE)
                        .detail("[mustBeDifferentTeamPairs]: " + i + " 번째 pair의 size = " +  (pair == null ? "null" : pair.size()) + "로 조건에 맞지 않습니다.")
                        .build();
            }

            for(String name : pair) {
                if(!memberSet.contains(name)) {
                    throw BusinessException.builder()
                            .errorCode(TeamErrorCode.NAME_NOT_IN_MEMBERS)
                            .detail("[mustBeDifferentTeamPairs]: " + i + " 번째 pair의 " + name + "이라는 이름이 members에 존재하지 않습니다.")
                            .build();
                }
            }

            String p1 = pair.get(0);
            String p2 = pair.get(1);

            if (p1.equals(p2)) {
                throw BusinessException.builder()
                        .errorCode(TeamErrorCode.DUPLICATE_MEMBER_NAME)
                        .detail("[mustBeDifferentTeamPairs]: " + i + " 번째 pair에 중복된 이름이 존재합니다. name = " + p1)
                        .build();
            }

        }
    }

    private void validateSameTeamGroups(List<List<String>> mustBeSameTeamGroups, Set<String> memberSet) {

        for(int i=0; i<mustBeSameTeamGroups.size(); i++) {
            List<String> group = mustBeSameTeamGroups.get(i);

            if(group == null || group.size() < 2 || group.size() > 5) {
                throw BusinessException.builder()
                        .errorCode(TeamErrorCode.INVALID_SAME_GROUP_SIZE)
                        .detail("[mustBeSameTeamGroups]: " + i + " 번째 group의 size = " +  (group == null ? "null" : group.size()) + "로 조건에 맞지 않습니다.")
                        .build();
            }

            Set<String> groupSet = new HashSet<>();

            for(String name : group) {
                if (!memberSet.contains(name)) {
                    throw BusinessException.builder()
                            .errorCode(TeamErrorCode.NAME_NOT_IN_MEMBERS)
                            .detail("[mustBeSameTeamGroups]: " i + " 번째 group의 " + name + "이라는 이름이 members에 존재하지 않습니다.")
                            .build();
                }

                if(!groupSet.add(name)) {
                    throw BusinessException.builder()
                            .errorCode(TeamErrorCode.DUPLICATE_MEMBER_NAME)
                            .detail("[mustBeSameTeamGroups]: " i + " 번째 group에 중복된 이름이 존재합니다. name = " + name)
                            .build();
                }
            }

        }
    }
}
