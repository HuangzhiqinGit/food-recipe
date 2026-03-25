package com.foodrecipe.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("shopping_items")
public class ShoppingItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("food_name")
    private String foodName;

    private String quantity;

    // 新增字段
    private String category; // 分类

    private Integer status; // 0-未购买 1-已购买 2-已入库

    @TableField("storage_location")
    private String storageLocation; // 存放位置

    @TableField("expire_date")
    private LocalDate expireDate; // 过期日期

    @TableField("purchased_at")
    private LocalDateTime purchasedAt; // 购买时间

    @TableField("archived_at")
    private LocalDateTime archivedAt; // 归档时间

    @TableField("is_purchased")
    private Integer isPurchased;

    @TableField("from_recipe_id")
    private Long fromRecipeId;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
