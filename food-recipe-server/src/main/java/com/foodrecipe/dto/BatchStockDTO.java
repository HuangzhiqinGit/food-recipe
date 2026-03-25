package com.foodrecipe.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class BatchStockDTO {
    private List<Long> itemIds; // 购物清单项ID列表
    private String storageLocation; // 存放位置
    private LocalDate expireDate; // 过期日期
}
