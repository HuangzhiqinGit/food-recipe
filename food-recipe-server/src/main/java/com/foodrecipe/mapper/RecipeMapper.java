package com.foodrecipe.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.foodrecipe.entity.Recipe;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RecipeMapper extends BaseMapper<Recipe> {

    @Select("SELECT r.* FROM recipes r " +
            "INNER JOIN favorites f ON r.id = f.recipe_id " +
            "WHERE f.user_id = #{userId} ORDER BY f.created_at DESC")
    List<Recipe> selectFavoritesByUserId(Long userId);

    @Select("SELECT * FROM recipes WHERE is_preset = 1 ORDER BY view_count DESC LIMIT #{limit}")
    List<Recipe> selectPresetRecipes(@Param("limit") Integer limit);

    @Select("SELECT COUNT(*) FROM favorites WHERE user_id = #{userId} AND recipe_id = #{recipeId}")
    Integer checkFavorite(@Param("userId") Long userId, @Param("recipeId") Long recipeId);
}
