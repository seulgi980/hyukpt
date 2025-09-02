package site.hyukpt.backend_server.team.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import site.hyukpt.backend_server.global.exception.BusinessException;
import site.hyukpt.backend_server.global.exception.GlobalErrorCode;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
public class TeamConfigRequestDTO {
    @Size(min = 10, max = 10, message = "members length must be 10.")
    private List<String> members;

    private Constraints constraints;

    @Valid
    private List<PreferPositions> preferPositions;

    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @ToString
    @Getter
    public static class Constraints {
        private List<List<String>> mustBeSameTeamGroups;
        private List<List<String>> mustBeDifferentTeamPairs;
    }

    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @ToString
    @Getter
    public static class PreferPositions {
        private String name;

        @NotNull
        private List<String> prefer;
    }

    // java객체 -> json 문자열로 직렬화
    @JsonIgnore
    public String toJsonOrThrow(ObjectMapper objectMapper) {
        try {
            return objectMapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            throw BusinessException.builder()
                    .errorCode(GlobalErrorCode.INTERNAL_SERVER_ERROR)
                    .customMessage("설정을 직렬화하는 중 오류가 발생했습니다.")
                    .detail(e.getOriginalMessage())
                    .build();
        }
    }
}


