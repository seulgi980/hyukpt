package site.hyukpt.backend_server.team.dto;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Setter
public class TeamConfigResponseDTO {
    private String status;
    private TeamConfigRequestDTO saved;
}
