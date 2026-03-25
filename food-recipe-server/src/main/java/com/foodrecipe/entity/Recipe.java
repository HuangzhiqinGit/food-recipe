package com.foodrecipe.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("recipes")
public class Recipe {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String type;

    private String duration;

    private String image;

    @TableField("images")
    private String images; // JSON数组字符串

    private String ingredients;

    private String steps;

    private String tips;

    @TableField("is_preset")
    private Integer isPreset;

    @TableField("user_id")
    private Long userId;

    @TableField("view_count")
    private Integer viewCount;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    // 非数据库字段
    @TableField(exist = false)
    private String typeName;

    @TableField(exist = false)
    private String durationName;

    @TableField(exist = false)
    private Integer matchRate;

    @TableField(exist = false)
    private Boolean isFavorite;
}
