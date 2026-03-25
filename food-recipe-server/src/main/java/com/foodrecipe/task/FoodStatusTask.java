package com.foodrecipe.task;

import com.foodrecipe.entity.Food;
import com.foodrecipe.mapper.FoodMapper;
import com.foodrecipe.service.FoodService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
public class FoodStatusTask {

    @Autowired
    private FoodMapper foodMapper;

    @Autowired
    private FoodService foodService;

    /**
     * 每天凌晨2点执行，更新所有食材的状态
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void updateFoodStatus() {
        log.info("开始执行食材状态更新任务...");

        try {
            // 获取所有未用完的食材
            List<Food> foods = foodMapper.selectAllActiveFoods();

            int updatedCount = 0;
            for (Food food : foods) {
                if (food.getExpireDate() != null) {
                    Integer newStatus = calculateStatus(food.getExpireDate());
                    if (!newStatus.equals(food.getStatus())) {
                        foodMapper.updateStatus(food.getId(), newStatus);
                        updatedCount++;
                    }
                }
            }

            log.info("食材状态更新任务完成，共更新 {} 条记录", updatedCount);
        } catch (Exception e) {
            log.error("食材状态更新任务执行失败", e);
        }
    }

    /**
     * 计算食材状态
     * 0 - 新鲜（保质期 > 3天）
     * 1 - 临期（保质期 1-3天）
     * 2 - 过期（保质期 < 1天）
     */
    private Integer calculateStatus(LocalDate expireDate) {
        LocalDate today = LocalDate.now();
        long daysLeft = ChronoUnit.DAYS.between(today, expireDate);

        if (daysLeft < 1) return 2;  // 过期
        if (daysLeft <= 3) return 1; // 临期
        return 0; // 新鲜
    }
}
