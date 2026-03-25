package com.foodrecipe.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.foodrecipe.entity.Food;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

public interface FoodMapper extends BaseMapper<Food> {

    @Select("SELECT COUNT(*) FROM foods WHERE user_id = #{userId} AND status IN (1, 2) AND is_finished = 0")
    Integer countExpiringByUserId(Long userId);

    @Select("SELECT * FROM foods WHERE user_id = #{userId} AND is_finished = 0 ORDER BY created_at DESC")
    List<Food> selectActiveByUserId(Long userId);

    @Update("UPDATE foods SET status = #{status} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    @Select("SELECT * FROM foods WHERE is_finished = 0 AND expire_date IS NOT NULL")
    List<Food> selectAllActiveFoods();
}
