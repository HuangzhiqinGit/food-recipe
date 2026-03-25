package com.foodrecipe.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.foodrecipe.entity.ShoppingItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ShoppingItemMapper extends BaseMapper<ShoppingItem> {

    @Select("SELECT * FROM shopping_items WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<ShoppingItem> selectByUserId(Long userId);

    @Select("SELECT COUNT(*) FROM shopping_items WHERE user_id = #{userId} AND is_purchased = 0")
    Integer countUnpurchasedByUserId(Long userId);
}
