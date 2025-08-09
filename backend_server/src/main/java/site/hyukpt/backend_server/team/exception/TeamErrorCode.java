package site.hyukpt.backend_server.team.exception;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import site.hyukpt.backend_server.global.exception.ErrorCode;

@AllArgsConstructor
public enum TeamErrorCode implements ErrorCode {

    INVALID_MEMBER_COUNT("Team-1", HttpStatus.BAD_REQUEST, "멤버 수는 정확히 10명이어야 합니다."),
    INVALID_PAIR_SIZE("Team-2", HttpStatus.BAD_REQUEST, "mustBeDifferentTeamPairs는 각 쌍이 2명이어야 합니다."),
    INVALID_SAME_GROUP_SIZE("Team-3",HttpStatus.BAD_REQUEST, "mustBeSameTeamGroups는 각 그룹이 2~5명이어야 합니다."),
    NAME_NOT_IN_MEMBERS("Team-4",HttpStatus.BAD_REQUEST, "constraints에 등장하는 이름은 members에 존재해야 합니다.");

    private final String code;
    private final HttpStatus httpStatus;
    private final String message;


    @Override public String getCode() {
        return code;
    }

    @Override
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    @Override
    public String getMessage() {
        return message;
    }


}
