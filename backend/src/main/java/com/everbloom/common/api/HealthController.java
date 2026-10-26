package com.everbloom.common.api;

import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    private final JdbcTemplate jdbc;
    public HealthController(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @GetMapping("/api/health")
    Map<String, String> health() {
        jdbc.queryForObject("select 1", Integer.class);
        return Map.of("status", "UP");
    }
}
