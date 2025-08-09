package site.hyukpt.backend_server.global.exception;

import org.springframework.http.HttpStatus;

public interface ErrorCode {
    HttpStatus getHttpStatus();
    String getMessage();
    String getCode(); // 도메인별 에러 구분하기 위한 코드
}
