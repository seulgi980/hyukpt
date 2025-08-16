package site.hyukpt.backend_server.team.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.hyukpt.backend_server.team.dto.TeamConfigRequestDTO;
import site.hyukpt.backend_server.team.dto.TeamConfigResponseDTO;
import site.hyukpt.backend_server.team.service.TeamService;

@RestController
@RequestMapping("/api/team")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;

    @PostMapping("/config")
    public ResponseEntity<TeamConfigResponseDTO> saveTeamConfig(@RequestBody @Valid TeamConfigRequestDTO request, HttpServletResponse response) {
        TeamConfigResponseDTO result = teamService.saveConfigToCookie(request, response);
        return ResponseEntity.ok(result);
    }
}
