package com.foodrecipe.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.foodrecipe.entity.Food;
import com.foodrecipe.mapper.FoodMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodService extends ServiceImpl<FoodMapper, Food> {

    private final OssService ossService;

    public List<Food> getFoodList(Long userId, String category, String keyword) {
        LambdaQueryWrapper<Food> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Food::getUserId, userId)
               .eq(Food::getIsFinished, 0)
               .orderByDesc(Food::getCreatedAt);

        if (category != null && !category.isEmpty() && !"all".equals(category)) {
            wrapper.eq(Food::getCategory, category);
        }

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Food::getName, keyword);
        }

        List<Food> list = list(wrapper);

        // 计算状态并处理图片URL
        for (Food food : list) {
            food.setStatus(calculateStatus(food.getExpireDate()));
            food.setStatusText(getStatusText(food.getStatus()));
            food.setCategoryName(getCategoryName(food.getCategory()));
            // 生成图片签名URL（60分钟有效期）
            if (food.getImageUrl() != null && !food.getImageUrl().isEmpty()) {
                food.setImageUrl(ossService.generateImageUrl(food.getImageUrl(), 60));
            }
        }

        return list;
    }

    public Integer getExpiringCount(Long userId) {
        return baseMapper.countExpiringByUserId(userId);
    }

    public Integer calculateStatus(LocalDate expireDate) {
        if (expireDate == null) return 0;

        LocalDate today = LocalDate.now();
        long daysLeft = ChronoUnit.DAYS.between(today, expireDate);

        if (daysLeft < 1) return 2;  // 过期
        if (daysLeft <= 3) return 1; // 临期
        return 0; // 新鲜
    }

    public String getStatusText(Integer status) {
        switch (status) {
            case 0: return "新鲜";
            case 1: return "临期";
            case 2: return "已过期";
            default: return "新鲜";
        }
    }

    public String getCategoryName(String category) {
        switch (category) {
            case "vegetable": return "蔬菜";
            case "meat": return "肉类";
            case "seafood": return "海鲜";
            case "egg": return "蛋奶";
            case "staple": return "主食";
            case "seasoning": return "调料";
            case "drink": return "酒水";
            default: return "其他";
        }
    }

    public void markAsFinished(Long id) {
        Food food = getById(id);
        if (food != null) {
            food.setIsFinished(1);
            updateById(food);
        }
    }

    /**
     * 按状态筛选食材
     * status: fresh(新鲜), expiring(临期), expired(已过期)
     */
    public List<Food> filterByStatus(Long userId, String status, String category) {
        LambdaQueryWrapper<Food> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Food::getUserId, userId)
               .eq(Food::getIsFinished, 0)
               .orderByAsc(Food::getExpireDate);

        if (category != null && !category.isEmpty() && !"all".equals(category)) {
            wrapper.eq(Food::getCategory, category);
        }

        List<Food> list = list(wrapper);

        // 计算状态并筛选，同时处理图片URL
        LocalDate today = LocalDate.now();
        return list.stream()
            .filter(food -> {
                int foodStatus = calculateStatus(food.getExpireDate());
                food.setStatus(foodStatus);
                food.setStatusText(getStatusText(foodStatus));
                food.setCategoryName(getCategoryName(food.getCategory()));
                
                // 生成图片签名URL
                if (food.getImageUrl() != null && !food.getImageUrl().isEmpty()) {
                    food.setImageUrl(ossService.generateImageUrl(food.getImageUrl(), 60));
                }
                
                switch (status) {
                    case "fresh": return foodStatus == 0;
                    case "expiring": return foodStatus == 1;
                    case "expired": return foodStatus == 2;
                    default: return true;
                }
            })
            .toList();
    }
    
    /**
     * 获取食材详情（处理图片URL）
     */
    public Food getFoodDetail(Long id) {
        Food food = getById(id);
        if (food != null) {
            food.setStatus(calculateStatus(food.getExpireDate()));
            food.setStatusText(getStatusText(food.getStatus()));
            food.setCategoryName(getCategoryName(food.getCategory()));
            // 生成图片签名URL
            if (food.getImageUrl() != null && !food.getImageUrl().isEmpty()) {
                food.setImageUrl(ossService.generateImageUrl(food.getImageUrl(), 60));
            }
        }
        return food;
    }
}
