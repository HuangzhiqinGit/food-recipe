package com.foodrecipe.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.foodrecipe.dto.CookDTO;
import com.foodrecipe.entity.Favorite;
import com.foodrecipe.entity.Food;
import com.foodrecipe.entity.Recipe;
import com.foodrecipe.mapper.FavoriteMapper;
import com.foodrecipe.mapper.RecipeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecipeService extends ServiceImpl<RecipeMapper, Recipe> {

    @Autowired
    private FavoriteMapper favoriteMapper;

    @Autowired
    private FoodService foodService;

    public List<Recipe> getRecipeList(Long userId, String type, String duration, 
                                       Boolean match, Boolean isFavorite) {
        List<Recipe> list;

        if (Boolean.TRUE.equals(isFavorite)) {
            list = baseMapper.selectFavoritesByUserId(userId);
        } else {
            LambdaQueryWrapper<Recipe> wrapper = new LambdaQueryWrapper<>();

            if (type != null && !type.isEmpty() && !"all".equals(type)) {
                wrapper.eq(Recipe::getType, type);
            }

            if (duration != null && !duration.isEmpty() && !"all".equals(duration)) {
                wrapper.eq(Recipe::getDuration, duration);
            }

            wrapper.orderByDesc(Recipe::getViewCount);
            list = list(wrapper);
        }

        // 补充信息
        for (Recipe recipe : list) {
            recipe.setTypeName(getTypeName(recipe.getType()));
            recipe.setDurationName(getDurationName(recipe.getDuration()));
            recipe.setIsFavorite(checkFavorite(userId, recipe.getId()));
        }

        // 按库存匹配
        if (Boolean.TRUE.equals(match)) {
            list = matchWithInventory(userId, list);
        }

        return list;
    }

    public List<Recipe> matchWithInventory(Long userId, List<Recipe> recipes) {
        // 获取用户食材
        List<Food> userFoods = foodService.getFoodList(userId, null, null);
        List<String> userFoodNames = userFoods.stream()
                .map(Food::getName)
                .collect(Collectors.toList());

        List<Recipe> matchedRecipes = new ArrayList<>();

        for (Recipe recipe : recipes) {
            JSONArray ingredients = JSON.parseArray(recipe.getIngredients());
            int totalCount = ingredients.size();
            int matchedCount = 0;

            for (int i = 0; i < ingredients.size(); i++) {
                JSONObject ingredient = ingredients.getJSONObject(i);
                String name = ingredient.getString("name");
                if (userFoodNames.contains(name)) {
                    matchedCount++;
                    ingredient.put("hasStock", true);
                } else {
                    ingredient.put("hasStock", false);
                }
            }

            int matchRate = (int) ((matchedCount * 100.0) / totalCount);

            // 只显示匹配度50%以上的
            if (matchRate >= 50) {
                recipe.setMatchRate(matchRate);
                recipe.setIngredients(ingredients.toJSONString());

                // 设置优先级
                int priority = (totalCount <= 3 && matchRate >= 80) ? 2 :
                               (matchRate >= 70) ? 1 : 0;
                recipe.setViewCount(priority); // 临时用viewCount存优先级

                matchedRecipes.add(recipe);
            }
        }

        // 按优先级和匹配度排序
        matchedRecipes.sort((a, b) -> {
            if (b.getViewCount() != a.getViewCount()) {
                return b.getViewCount() - a.getViewCount();
            }
            return b.getMatchRate() - a.getMatchRate();
        });

        return matchedRecipes;
    }

    public Recipe getRecipeDetail(Long id, Long userId) {
        Recipe recipe = getById(id);
        if (recipe != null) {
            recipe.setTypeName(getTypeName(recipe.getType()));
            recipe.setDurationName(getDurationName(recipe.getDuration()));
            recipe.setIsFavorite(checkFavorite(userId, id));

            // 增加浏览次数
            recipe.setViewCount(recipe.getViewCount() + 1);
            updateById(recipe);
        }
        return recipe;
    }

    public Boolean checkFavorite(Long userId, Long recipeId) {
        return baseMapper.checkFavorite(userId, recipeId) > 0;
    }

    public void toggleFavorite(Long userId, Long recipeId) {
        Favorite favorite = favoriteMapper.selectByUserAndRecipe(userId, recipeId);
        if (favorite != null) {
            favoriteMapper.deleteById(favorite.getId());
        } else {
            favorite = new Favorite();
            favorite.setUserId(userId);
            favorite.setRecipeId(recipeId);
            favoriteMapper.insert(favorite);
        }
    }

    public String getTypeName(String type) {
        switch (type) {
            case "vegetarian": return "全素";
            case "semi_meat": return "半荤";
            case "meat": return "全荤";
            default: return "其他";
        }
    }

    public String getDurationName(String duration) {
        switch (duration) {
            case "10min": return "10分钟";
            case "15min": return "15分钟";
            case "20min": return "20分钟";
            case "30min_plus": return "30分钟+";
            default: return "未知";
        }
    }

    /**
     * 烹饪扣减库存
     */
    @Transactional
    public Map<String, Object> cook(Long userId, Long recipeId, CookDTO dto) {
        Recipe recipe = getById(recipeId);
        if (recipe == null) {
            throw new RuntimeException("菜谱不存在");
        }

        List<Map<String, Object>> deducted = new ArrayList<>();
        List<Map<String, Object>> insufficient = new ArrayList<>();

        // 获取用户食材
        List<Food> userFoods = foodService.getFoodList(userId, null, null);

        // 解析菜谱食材
        JSONArray ingredients = JSON.parseArray(recipe.getIngredients());

        for (int i = 0; i < ingredients.size(); i++) {
            JSONObject ingredient = ingredients.getJSONObject(i);
            String name = ingredient.getString("name");
            String quantity = ingredient.getString("quantity");
            String unit = ingredient.getString("unit");

            // 查找用户库存
            Food userFood = userFoods.stream()
                    .filter(f -> f.getName().equals(name))
                    .findFirst()
                    .orElse(null);

            if (userFood == null) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", name);
                item.put("required", quantity + unit);
                item.put("stock", 0);
                insufficient.add(item);
            } else {
                // 解析所需数量
                int requiredQty = parseQuantity(quantity);
                int stockQty = userFood.getQuantity().intValue();

                if (stockQty < requiredQty) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", name);
                    item.put("required", quantity + unit);
                    item.put("stock", stockQty);
                    insufficient.add(item);
                } else {
                    // 扣减库存
                    userFood.setQuantity(new java.math.BigDecimal(stockQty - requiredQty));
                    foodService.updateById(userFood);

                    Map<String, Object> item = new HashMap<>();
                    item.put("name", name);
                    item.put("deducted", requiredQty);
                    item.put("remaining", stockQty - requiredQty);
                    deducted.add(item);
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("deducted", deducted);
        result.put("insufficient", insufficient);
        return result;
    }

    private int parseQuantity(String quantity) {
        try {
            return Integer.parseInt(quantity.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return 0;
        }
    }
}
