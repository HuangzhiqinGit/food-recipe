package com.foodrecipe.dto;

import lombok.Data;
import java.util.Map;

@Data
public class CookDTO {
    private Map<Long, Integer> adjustments; // 食材ID -> 扣减数量
}
