package site.hyukpt.backend_server.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class ErrorResponseDTO {
    private final int statusCode;
    private final String error;
    private final String code;
    private final String message;
    private final LocalDateTime timestamp;

    // AllArgsConstructor

    public static ErrorResponseDTO of(ErrorCode errorCode) {
        return new ErrorResponseDTO(
                errorCode.getHttpStatus().value(),
                errorCode.getHttpStatus().name(),
                errorCode.getCode(),
                errorCode.getMessage(),
                LocalDateTime.now()
        );
    }

    public static ErrorResponseDTO of(ErrorCode errorCode, String customMessage) {
        return new ErrorResponseDTO(
                errorCode.getHttpStatus().value(),
                errorCode.getHttpStatus().name(),
                errorCode.getCode(),
                (customMessage != null ? customMessage : errorCode.getMessage()),
                LocalDateTime.now()
        );
    }
}
