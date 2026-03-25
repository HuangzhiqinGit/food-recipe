package com.foodrecipe.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.foodrecipe.entity.Favorite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface FavoriteMapper extends BaseMapper<Favorite> {

    @Select("SELECT * FROM favorites WHERE user_id = #{userId} AND recipe_id = #{recipeId}")
    Favorite selectByUserAndRecipe(@Param("userId") Long userId, @Param("recipeId") Long recipeId);
}
