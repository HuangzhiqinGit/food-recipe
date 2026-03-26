package com.foodrecipe.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.foodrecipe.dto.BatchStockDTO;
import com.foodrecipe.entity.Food;
import com.foodrecipe.entity.ShoppingItem;
import com.foodrecipe.mapper.ShoppingItemMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShoppingItemService extends ServiceImpl<ShoppingItemMapper, ShoppingItem> {

    private final FoodService foodService;

    public List<ShoppingItem> getShoppingList(Long userId) {
        LambdaQueryWrapper<ShoppingItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ShoppingItem::getUserId, userId)
               .orderByDesc(ShoppingItem::getCreatedAt);
        return list(wrapper);
    }

    public void togglePurchased(Long id) {
        ShoppingItem item = getById(id);
        if (item != null) {
            item.setIsPurchased(item.getIsPurchased() == 0 ? 1 : 0);
            updateById(item);
        }
    }

    public void clearByUserId(Long userId) {
        LambdaQueryWrapper<ShoppingItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ShoppingItem::getUserId, userId);
        remove(wrapper);
    }

    public ShoppingItem findByUserAndName(Long userId, String foodName) {
        LambdaQueryWrapper<ShoppingItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ShoppingItem::getUserId, userId)
               .eq(ShoppingItem::getFoodName, foodName);
        return getOne(wrapper);
    }

    /**
     * 批量入库 - 将已购买的食材添加到库存
     */
    @Transactional
    public Map<String, Object> batchStock(Long userId, BatchStockDTO dto) {
        int successCount = 0;
        int failCount = 0;

        for (Long itemId : dto.getItemIds()) {
            try {
                ShoppingItem item = getById(itemId);
                if (item == null || !item.getUserId().equals(userId)) {
                    failCount++;
                    continue;
                }

                // 解析数量和单位
                String quantityStr = item.getQuantity() != null ? item.getQuantity() : "";
                java.math.BigDecimal quantity = new java.math.BigDecimal("0");
                String unit = "";
                
                if (!quantityStr.isEmpty()) {
                    try {
                        String numPart = quantityStr.replaceAll("[^0-9.]", "");
                        if (!numPart.isEmpty()) {
                            quantity = new java.math.BigDecimal(numPart);
                        }
                        unit = quantityStr.replaceAll("[0-9.]", "").trim();
                    } catch (Exception e) {
                        // 解析失败则使用默认值
                        quantity = new java.math.BigDecimal("1");
                        unit = quantityStr;
                    }
                } else {
                    quantity = new java.math.BigDecimal("1");
                }

                // 创建食材
                Food food = new Food();
                food.setUserId(userId);
                food.setName(item.getFoodName());
                food.setCategory(item.getCategory() != null && !item.getCategory().trim().isEmpty() ? item.getCategory() : "other");
                food.setQuantity(quantity);
                food.setUnit(unit.isEmpty() ? "个" : unit);
                food.setLocation(dto.getStorageLocation());
                food.setExpireDate(dto.getExpireDate());
                food.setStatus(0);
                food.setIsFinished(0);

                foodService.save(food);

                // 更新购物项状态为已入库
                item.setStatus(2);
                item.setArchivedAt(LocalDateTime.now());
                updateById(item);

                successCount++;
            } catch (Exception e) {
                failCount++;
                System.err.println("入库失败 itemId=" + itemId + ": " + e.getMessage());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        return result;
    }
}
