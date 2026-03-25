package com.foodrecipe.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.foodrecipe.entity.ShoppingHistory;
import com.foodrecipe.entity.ShoppingItem;
import com.foodrecipe.mapper.ShoppingHistoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShoppingHistoryService extends ServiceImpl<ShoppingHistoryMapper, ShoppingHistory> {

    private final ShoppingItemService shoppingItemService;

    /**
     * 获取用户的购物历史
     */
    public List<ShoppingHistory> getHistoryByUserId(Long userId) {
        LambdaQueryWrapper<ShoppingHistory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ShoppingHistory::getUserId, userId)
               .orderByDesc(ShoppingHistory::getCreatedAt);
        return list(wrapper);
    }

    /**
     * 从历史清单再次购买
     */
    @Transactional
    public void repurchase(Long userId, Long historyId) {
        ShoppingHistory history = getById(historyId);
        if (history == null || !history.getUserId().equals(userId)) {
            throw new RuntimeException("历史记录不存在");
        }

        // 解析历史记录中的商品
        List<ShoppingItem> items = parseItems(history.getItems());
        
        // 添加到购物清单
        for (ShoppingItem item : items) {
            ShoppingItem newItem = new ShoppingItem();
            newItem.setUserId(userId);
            newItem.setFoodName(item.getFoodName());
            newItem.setQuantity(item.getQuantity());
            newItem.setCategory(item.getCategory());
            newItem.setStatus(0);
            shoppingItemService.save(newItem);
        }
    }

    private List<ShoppingItem> parseItems(String itemsJson) {
        // 解析JSON
        return com.alibaba.fastjson2.JSON.parseArray(itemsJson, ShoppingItem.class);
    }
}
