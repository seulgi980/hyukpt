package site.hyukpt.backend_server.team.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import site.hyukpt.backend_server.global.exception.BusinessException;
import site.hyukpt.backend_server.team.dto.TeamConfigRequestDTO;
import site.hyukpt.backend_server.team.exception.TeamErrorCode;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ValidateService {

    private static final List<String> ALLOWED_POSITION = List.of("top", "jg", "mid", "ad", "sup");

    public void validateTeamConfigRequest(TeamConfigRequestDTO request) {

        Set<String> memberSet = this.validateMembers(request.getMembers());
        if (request.getConstraints() != null) {
            this.validateSameTeamGroups(request.getConstraints().getMustBeSameTeamGroups(), memberSet);
            this.validateDifferentTeamPairs(request.getConstraints().getMustBeDifferentTeamPairs(), memberSet);
        }
        this.validatePreferPositions(request.getPreferPositions(), memberSet);

    }

    private Set<String> validateMembers(List<String> members) {

        if (ObjectUtils.isEmpty(members)) {
            throw BusinessException.builder()
                    .errorCode(TeamErrorCode.INVALID_MEMBER_SIZE)
                    .detail("[members]: ")
                    .detail("[members]: " + "members의 size = " + (members == null ? "0" : members.size()) + "로 조건에 맞지 않습니다.")
                    .build();
        }

        Set<String> memberSet = new HashSet<>(members);
        if (memberSet.size() != 10) {
            Set<String> memberSetTemp = new HashSet<>();
            for (String name : members) {
                if (!memberSetTemp.add(name)) {
                    throw BusinessException.builder()
                            .errorCode(TeamErrorCode.DUPLICATE_MEMBER_NAME)
                            .detail("중복된 이름이 존재합니다. name = " + name)
                            .build();
                }
            }
        }
        return memberSet;

    }

    private void validatePreferPositions(List<TeamConfigRequestDTO.PreferPositions> preferPositions, Set<String> memberSet) {

        if (ObjectUtils.isEmpty(preferPositions)) {
            return;
        }

        for (int i = 0; i < preferPositions.size(); i++) {
            TeamConfigRequestDTO.PreferPositions preferPosition = preferPositions.get(i);
            String name = preferPosition.getName();
            List<String> prefer = preferPosition.getPrefer();

            if (!memberSet.contains(name)) {
                throw BusinessException.builder()
                        .errorCode(TeamErrorCode.NAME_NOT_IN_MEMBERS)
                        .detail(i + " 번째 preferPosition의 " + name + "이라는 이름이 members에 존재하지 않습니다.")
                        .build();
            }

            if (prefer == null || prefer.size() > 5) {
                throw BusinessException.builder()
                        .errorCode(TeamErrorCode.INVALID_PREFER_SIZE)
                        .detail(i + " 번째 preferPosition의 개수가 잘못되었습니다. size = " + (prefer == null ? 0 : prefer.size()))
                        .build();
            }

            for (String pre : prefer) {
                if (!ALLOWED_POSITION.contains(pre)) {
                    throw BusinessException.builder()
                            .errorCode(TeamErrorCode.INVALID_POSITION_NAME)
                            .detail(i + " 번째 preferPosition의 position name이 올바르지 않습니다. prefer=" + pre)
                            .build();
                }
            }
        }

    }

    private void validateDifferentTeamPairs(List<List<String>> mustBeDifferentTeamPairs, Set<String> memberSet) {

        if (ObjectUtils.isEmpty(mustBeDifferentTeamPairs)) {
            return;
        }

        for (int i = 0; i < mustBeDifferentTeamPairs.size(); i++) {
            List<String> pair = mustBeDifferentTeamPairs.get(i);

            if (pair == null || pair.size() != 2) {
                throw BusinessException.builder()
                        .errorCode(TeamErrorCode.INVALID_PAIR_SIZE)
                        .detail("[mustBeDifferentTeamPairs]: " + i + " 번째 pair의 size = " + (pair == null ? 0 : pair.size()) + "로 조건에 맞지 않습니다.")
                        .build();
            }

            for (String name : pair) {
                if (!memberSet.contains(name)) {
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

        if (ObjectUtils.isEmpty(mustBeSameTeamGroups)) {
            return;
        }

        for (int i = 0; i < mustBeSameTeamGroups.size(); i++) {
            List<String> group = mustBeSameTeamGroups.get(i);

            if (group == null || group.size() < 2 || group.size() > 5) {
                throw BusinessException.builder()
                        .errorCode(TeamErrorCode.INVALID_SAME_TEAM_GROUPS_SIZE)
                        .detail("[mustBeSameTeamGroups]: " + i + " 번째 group의 size = " + (group == null ? "0" : group.size()) + "로 조건에 맞지 않습니다.")
                        .build();
            }

            Set<String> groupSet = new HashSet<>();

            for (String name : group) {
                if (!memberSet.contains(name)) {
                    throw BusinessException.builder()
                            .errorCode(TeamErrorCode.NAME_NOT_IN_MEMBERS)
                            .detail("[mustBeSameTeamGroups]: " + i + " 번째 group의 " + name + "이라는 이름이 members에 존재하지 않습니다.")
                            .build();
                }

                if (!groupSet.add(name)) {
                    throw BusinessException.builder()
                            .errorCode(TeamErrorCode.DUPLICATE_MEMBER_NAME)
                            .detail("[mustBeSameTeamGroups]: " + i + " 번째 group에 중복된 이름이 존재합니다. name = " + name)
                            .build();
                }
            }
        }

    }
}
