package site.hyukpt.backend_server.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class ErrorResponseDTO {
    private final int statusCode;
    private final String error;
    private final String code; // 우리 예외를 구분하기 위한 각 도메인별 코드
    private final String message;
    private final String detail; // 고정된 메세지에 더해 보여줄 추가정보
    private final LocalDateTime timestamp;

    // AllArgsConstructor

    // customMessage는 errorCode의 고정된 message 변경하고싶을 때사용
    // detail은 고정된 메세지에 추가정보 더할 때 사용
    public static ErrorResponseDTO of(ErrorCode errorCode, String customMessage, String detail) {
        return new ErrorResponseDTO(
                errorCode.getHttpStatus().value(),
                errorCode.getHttpStatus().name(),
                errorCode.getCode(),
                (customMessage != null && !customMessage.isBlank()
                        ? customMessage
                        : errorCode.getMessage()),
                detail,
                LocalDateTime.now()
        );
    }



}
