package site.hyukpt.backend_server.team.dto;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
public class TeamMatchResponseDTO {
    private String status;
    private Result result;

    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @ToString
    @Getter
    public static class Result {
        private String top1;
        private String jg1;
        private String mid1;
        private String ad1;
        private String sup1;
        private String top2;
        private String jg2;
        private String mid2;
        private String ad2;
        private String sup2;

    }
}
