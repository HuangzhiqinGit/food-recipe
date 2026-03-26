package com.foodrecipe.controller;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.foodrecipe.dto.BatchStockDTO;
import com.foodrecipe.dto.Result;
import com.foodrecipe.entity.Recipe;
import com.foodrecipe.entity.ShoppingHistory;
import com.foodrecipe.entity.ShoppingItem;
import com.foodrecipe.service.RecipeService;
import com.foodrecipe.service.ShoppingHistoryService;
import com.foodrecipe.service.ShoppingItemService;
import com.foodrecipe.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/shopping")
public class ShoppingController {

    @Autowired
    private ShoppingItemService shoppingItemService;

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private ShoppingHistoryService shoppingHistoryService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getCurrentUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.getUserIdFromToken(token);
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestHeader("Authorization") String authHeader) {
        Long userId = getCurrentUserId(authHeader);
        List<ShoppingItem> list = shoppingItemService.getShoppingList(userId);

        int purchasedCount = (int) list.stream()
                .filter(item -> item.getIsPurchased() == 1)
                .count();

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("totalCount", list.size());
        result.put("purchasedCount", purchasedCount);

        return Result.success(result);
    }

    @PostMapping
    public Result<ShoppingItem> add(@RequestHeader("Authorization") String authHeader,
                                     @RequestBody ShoppingItem item) {
        Long userId = getCurrentUserId(authHeader);
        item.setUserId(userId);
        item.setIsPurchased(0);
        // 如果分类为空，默认设为"其他"
        if (item.getCategory() == null || item.getCategory().trim().isEmpty()) {
            item.setCategory("其他");
        }
        shoppingItemService.save(item);
        return Result.success(item);
    }

    @PutMapping("/{id}/toggle")
    public Result<Void> togglePurchased(@PathVariable Long id) {
        shoppingItemService.togglePurchased(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        shoppingItemService.removeById(id);
        return Result.success();
    }

    @DeleteMapping("/clear")
    public Result<Void> clear(@RequestHeader("Authorization") String authHeader) {
        Long userId = getCurrentUserId(authHeader);
        shoppingItemService.clearByUserId(userId);
        return Result.success();
    }

    @PostMapping("/from-recipe/{recipeId}")
    public Result<Void> addFromRecipe(@RequestHeader("Authorization") String authHeader,
                                       @PathVariable Long recipeId) {
        Long userId = getCurrentUserId(authHeader);
        Recipe recipe = recipeService.getById(recipeId);

        if (recipe == null) {
            return Result.error("菜谱不存在");
        }

        // 解析食材
        JSONArray ingredients = JSON.parseArray(recipe.getIngredients());

        for (int i = 0; i < ingredients.size(); i++) {
            JSONObject ingredient = ingredients.getJSONObject(i);
            String name = ingredient.getString("name");
            Boolean hasStock = ingredient.getBoolean("hasStock");

            // 只添加缺失的食材
            if (Boolean.FALSE.equals(hasStock)) {
                // 检查是否已存在
                ShoppingItem existing = shoppingItemService.findByUserAndName(userId, name);
                if (existing == null) {
                    ShoppingItem item = new ShoppingItem();
                    item.setUserId(userId);
                    item.setFoodName(name);
                    item.setQuantity(ingredient.getString("quantity") + ingredient.getString("unit"));
                    // 从食材中获取分类，如果没有则默认"其他"
                    String category = ingredient.getString("category");
                    item.setCategory(category != null && !category.trim().isEmpty() ? category : "其他");
                    item.setFromRecipeId(recipeId);
                    item.setIsPurchased(0);
                    shoppingItemService.save(item);
                }
            }
        }

        return Result.success();
    }

    /**
     * 批量入库 - 将已购买的食材添加到库存
     */
    @PostMapping("/batch-stock")
    public Result<Map<String, Object>> batchStock(@RequestHeader("Authorization") String authHeader,
                                                   @RequestBody BatchStockDTO dto) {
        Long userId = getCurrentUserId(authHeader);
        Map<String, Object> result = shoppingItemService.batchStock(userId, dto);
        return Result.success(result);
    }

    /**
     * 获取购物历史
     */
    @GetMapping("/history")
    public Result<List<ShoppingHistory>> getHistory(@RequestHeader("Authorization") String authHeader) {
        Long userId = getCurrentUserId(authHeader);
        List<ShoppingHistory> list = shoppingHistoryService.getHistoryByUserId(userId);
        return Result.success(list);
    }

    /**
     * 从历史清单再次购买
     */
    @PostMapping("/repurchase/{historyId}")
    public Result<Void> repurchase(@RequestHeader("Authorization") String authHeader,
                                    @PathVariable Long historyId) {
        Long userId = getCurrentUserId(authHeader);
        shoppingHistoryService.repurchase(userId, historyId);
        return Result.success();
    }
}
