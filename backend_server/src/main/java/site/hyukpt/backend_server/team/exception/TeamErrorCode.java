package site.hyukpt.backend_server.team.exception;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import site.hyukpt.backend_server.global.exception.ErrorCode;

@AllArgsConstructor
public enum TeamErrorCode implements ErrorCode {

    DUPLICATE_MEMBER_NAME("Team-1", HttpStatus.BAD_REQUEST, "중복 이름이 있습니다."),
    INVALID_PAIR_SIZE("Team-2", HttpStatus.BAD_REQUEST, "mustBeDifferentTeamPairs는 각 쌍이 2명이어야 합니다."),
    INVALID_SAME_GROUP_SIZE("Team-3",HttpStatus.BAD_REQUEST, "mustBeSameTeamGroups는 각 그룹이 2~5명이어야 합니다."),
    NAME_NOT_IN_MEMBERS("Team-4",HttpStatus.BAD_REQUEST, "members에 없는 이름이 포함되어 있습니다."),
    INVALID_POSITION_NAME("Team-5", HttpStatus.BAD_REQUEST, "올바르지 않은 position 이름입니다."),
    INVALID_PREFER_SIZE("Team-6", HttpStatus.BAD_REQUEST, "prefer position은 1~5개를 선택하여야 합니다.");

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
