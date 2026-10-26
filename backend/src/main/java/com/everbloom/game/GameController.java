package com.everbloom.game;

import com.everbloom.common.api.ApiException;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import static com.everbloom.game.GameModels.*;

@RestController
@RequestMapping("/api/game")
public class GameController {
    private final GameService game;
    private final ObjectMapper json;
    public GameController(GameService game, ObjectMapper json) { this.game = game; this.json = json; }
    @GetMapping Snapshot load(Authentication authentication) { return game.load(owner(authentication)); }
    @PutMapping("/character") ProfileResult profile(Authentication authentication, @RequestBody JsonNode body) {
        return game.updateCharacter(owner(authentication), GameValidation.profile(body));
    }
    @PostMapping("/activities") ActivityResult record(Authentication authentication, @RequestBody JsonNode body) {
        return game.record(owner(authentication), GameValidation.activity(body));
    }
    @PostMapping("/bosses/{bossId}/fight") BossModels.FightResult fight(Authentication authentication,
            @PathVariable String bossId, @RequestBody JsonNode body) {
        return game.fight(owner(authentication), GameValidation.fight(bossId, body));
    }
    @GetMapping("/journey") JsonNode journey(Authentication authentication) { return json.valueToTree(game.journey(owner(authentication))); }
    @PutMapping("/journey") Journey journey(Authentication authentication, @RequestBody JsonNode body) {
        return game.saveJourney(owner(authentication), GameValidation.journey(body));
    }
    private UUID owner(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) throw unauthenticated();
        try { return UUID.fromString(authentication.getName()); }
        catch (IllegalArgumentException error) { throw unauthenticated(); }
    }
    private ApiException unauthenticated() { return new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Bitte melde dich an."); }
}
