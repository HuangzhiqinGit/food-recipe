package com.foodrecipe.controller;

import com.foodrecipe.dto.CookDTO;
import com.foodrecipe.dto.Result;
import com.foodrecipe.entity.Recipe;
import com.foodrecipe.service.FoodService;
import com.foodrecipe.service.RecipeService;
import com.foodrecipe.service.ShoppingItemService;
import com.foodrecipe.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/recipes")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private ShoppingItemService shoppingItemService;

    @Autowired
    private FoodService foodService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getCurrentUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.getUserIdFromToken(token);
    }

    @GetMapping
    public Result<Map<String, Object>> list(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String duration,
            @RequestParam(required = false) Boolean match,
            @RequestParam(required = false) Boolean isFavorite) {

        Long userId = getCurrentUserId(authHeader);
        List<Recipe> list = recipeService.getRecipeList(userId, type, duration, match, isFavorite);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);

        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<Recipe> detail(@RequestHeader("Authorization") String authHeader,
                                  @PathVariable Long id) {
        Long userId = getCurrentUserId(authHeader);
        Recipe recipe = recipeService.getRecipeDetail(id, userId);
        return Result.success(recipe);
    }

    @PostMapping
    public Result<Recipe> add(@RequestHeader("Authorization") String authHeader,
                              @RequestBody Recipe recipe) {
        Long userId = getCurrentUserId(authHeader);
        recipe.setUserId(userId);
        recipe.setIsPreset(0);
        recipe.setViewCount(0);
        recipeService.save(recipe);
        return Result.success(recipe);
    }

    @PostMapping("/{id}/favorite")
    public Result<Boolean> toggleFavorite(@RequestHeader("Authorization") String authHeader,
                                          @PathVariable Long id) {
        Long userId = getCurrentUserId(authHeader);
        recipeService.toggleFavorite(userId, id);
        return Result.success(recipeService.checkFavorite(userId, id));
    }

    @GetMapping("/favorites")
    public Result<Map<String, Object>> getFavorites(@RequestHeader("Authorization") String authHeader) {
        Long userId = getCurrentUserId(authHeader);
        List<Recipe> list = recipeService.getRecipeList(userId, null, null, false, true);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);

        return Result.success(result);
    }

    /**
     * 烹饪扣减库存
     */
    @PostMapping("/{id}/cook")
    public Result<Map<String, Object>> cook(@RequestHeader("Authorization") String authHeader,
                                             @PathVariable Long id,
                                             @RequestBody CookDTO dto) {
        Long userId = getCurrentUserId(authHeader);
        Map<String, Object> result = recipeService.cook(userId, id, dto);
        return Result.success(result);
    }
}
