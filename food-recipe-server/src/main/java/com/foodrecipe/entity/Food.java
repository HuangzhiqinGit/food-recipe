package com.foodrecipe.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("foods")
public class Food {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    private String name;

    private String category;

    private java.math.BigDecimal quantity;

    private String unit;

    @TableField("image_url")
    private String imageUrl;

    @TableField("creator_id")
    private Long creatorId;

    @TableField("creator_name")
    private String creatorName;

    private String location;

    @TableField("expire_date")
    private LocalDate expireDate;

    private Integer status;

    @TableField("is_finished")
    private Integer isFinished;

    @TableField("finished_at")
    private LocalDateTime finishedAt;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    // 非数据库字段
    @TableField(exist = false)
    private String categoryName;

    @TableField(exist = false)
    private String statusText;
}
