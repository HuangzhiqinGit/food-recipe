package com.foodrecipe.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("shopping_history")
public class ShoppingHistory {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("total_items")
    private Integer totalItems;

    @TableField("total_amount")
    private java.math.BigDecimal totalAmount;

    private String items; // JSON格式存储商品明细

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
