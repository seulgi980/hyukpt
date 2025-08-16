package site.hyukpt.backend_server.global.exception;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    private final String detail;         // Enum 메시지에 더해서 예외 관련 추가 정보 전달하고 싶을 때
    private final String customMessage;  // 우리의 고정된 예외 message를 대체하고 싶을 때

    @Override
    public String getMessage() {
        return (customMessage != null && !customMessage.isBlank() ?
                customMessage : errorCode.getMessage());
    }
}
