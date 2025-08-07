package site.hyukpt.backend_server.team.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Setter
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
    @Setter
    public static class Constraints {
        private List<List<String>> mustBeSameTeamGroups;
        private List<List<String>> mustBeDifferentTeamPairs;
    }

    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @ToString
    @Getter
    @Setter
    public static class PreferPositions {
        private String name;

        @NotNull
        private List<String> prefer;
    }
}


