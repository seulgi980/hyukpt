package site.hyukpt.backend_server.global.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    // 직접 정의한 BusinessException에 대한 예외처리
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponseDTO> handleBusiness(BusinessException e) {
        return ResponseEntity.status(e.getErrorCode().getHttpStatus())
                .body(ErrorResponseDTO.of(e.getErrorCode(), e.getCustomMessage(), e.getDetail()));
    }

    // 예상치 못한 오류 마지막 안전망
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleUnexpected(Exception e) {
        return ResponseEntity
                .status(GlobalErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
                .body(ErrorResponseDTO.of(GlobalErrorCode.INTERNAL_SERVER_ERROR, null, null));
    }

    // handleUnexpected에 ResponseStatusException이 씹히지 않도록 잡아주기
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponseDTO> handleResponseStatusException(ResponseStatusException e){
        ErrorCode ec = mapStatus(e.getStatusCode());

        String message = (e.getReason() != null && !e.getReason().isBlank())
                ? e.getReason()
                : ec.getMessage();

        return ResponseEntity.status(ec.getHttpStatus())
                .body(ErrorResponseDTO.of(ec, message, null));
    }

    /*
        Spring에 존재하는 예외들 처리
    */

    // handleExceptionInternal 오버라이딩해서 spring기본예외들 우리형식으로 출력되도록 함
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, @Nullable Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        ErrorCode ec = mapStatus(statusCode);
        String message = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage()
                : ec.getMessage();

        return ResponseEntity.status(ec.getHttpStatus())
                .body(ErrorResponseDTO.of(ec, message, null));
    }

    private ErrorCode mapStatus(HttpStatusCode status) {
        int code = status.value();
        switch (code) {
            case 400: return GlobalErrorCode.BAD_REQUEST;
            case 401: return GlobalErrorCode.UNAUTHORIZED_REQUEST;
            case 403: return GlobalErrorCode.FORBIDDEN_ACCESS;
            case 404: return GlobalErrorCode.NOT_FOUND;
            case 405: return GlobalErrorCode.METHOD_NOT_ALLOWED;
            default:  return GlobalErrorCode.INTERNAL_SERVER_ERROR;
        }
    }

    // MethodArgumentNotValidException 출력형태 커스텀
    // 부모의 @ExceptionHandler(MethodArgumentNotValidException) 과 충돌나기때문에 overriding
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        StringBuilder sb = new StringBuilder();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            sb.append(error.getField())
                    .append(": ")
                    .append(error.getDefaultMessage())
                    .append("; ");
        });

        return ResponseEntity.status(GlobalErrorCode.BAD_REQUEST.getHttpStatus())
                .body(ErrorResponseDTO.of(GlobalErrorCode.BAD_REQUEST, sb.toString(), null));
    }

    // ConstraintViolationException 출력형태 커스텀
    // JSON BODY 검증이 아니라 @RequestParam, @PathVariable 검증할 때 발생하는 예외
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleConstraintViolationException(ConstraintViolationException e) {
        StringBuilder sb = new StringBuilder();
        e.getConstraintViolations().forEach( v -> {
            sb.append(v.getPropertyPath())
                    .append(": ")
                    .append(v.getMessage())
                    .append("; ");
        });

        return ResponseEntity.status(GlobalErrorCode.BAD_REQUEST.getHttpStatus())
                .body(ErrorResponseDTO.of(GlobalErrorCode.BAD_REQUEST, sb.toString(), null));
    }

}
