package com.foodrecipe.controller;

import com.foodrecipe.dto.Result;
import com.foodrecipe.entity.Food;
import com.foodrecipe.entity.User;
import com.foodrecipe.service.FoodService;
import com.foodrecipe.service.UserService;
import com.foodrecipe.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/foods")
public class FoodController {

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
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {

        Long userId = getCurrentUserId(authHeader);
        List<Food> list = foodService.getFoodList(userId, category, keyword);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("expiringCount", foodService.getExpiringCount(userId));

        return Result.success(result);
    }

    @GetMapping("/expiring/count")
    public Result<Integer> getExpiringCount(@RequestHeader("Authorization") String authHeader) {
        Long userId = getCurrentUserId(authHeader);
        return Result.success(foodService.getExpiringCount(userId));
    }

    @GetMapping("/{id}")
    public Result<Food> detail(@PathVariable Long id) {
        Food food = foodService.getFoodDetail(id);
        return Result.success(food);
    }

    @PostMapping
    public Result<Food> add(@RequestHeader("Authorization") String authHeader,
                            @RequestBody Food food) {
        Long userId = getCurrentUserId(authHeader);
        food.setUserId(userId);
        food.setStatus(0);
        food.setIsFinished(0);
        foodService.save(food);
        return Result.success(food);
    }

    @PutMapping("/{id}")
    public Result<Food> update(@PathVariable Long id, @RequestBody Food food) {
        food.setId(id);
        foodService.updateById(food);
        return Result.success(food);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        foodService.removeById(id);
        return Result.success();
    }

    @PostMapping("/{id}/finish")
    public Result<Void> finish(@PathVariable Long id) {
        foodService.markAsFinished(id);
        return Result.success();
    }

    /**
     * 按状态筛选食材
     * status: fresh(新鲜), expiring(临期), expired(已过期)
     */
    @GetMapping("/filter")
    public Result<List<Food>> filter(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("status") String status,
            @RequestParam(required = false) String category) {

        Long userId = getCurrentUserId(authHeader);
        List<Food> list = foodService.filterByStatus(userId, status, category);
        return Result.success(list);
    }
}
