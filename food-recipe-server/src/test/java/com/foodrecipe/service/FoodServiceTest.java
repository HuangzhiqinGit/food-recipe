package com.foodrecipe.service;

import com.foodrecipe.entity.Food;
import com.foodrecipe.mapper.FoodMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
public class FoodServiceTest {

    @Autowired
    private FoodService foodService;

    @MockBean
    private FoodMapper foodMapper;

    @Test
    public void testCalculateStatus_Fresh() {
        // 测试新鲜状态（保质期 > 3天）
        LocalDate expireDate = LocalDate.now().plusDays(5);
        Integer status = foodService.calculateStatus(expireDate);
        assertEquals(0, status);
    }

    @Test
    public void testCalculateStatus_Expiring() {
        // 测试临期状态（保质期 1-3天）
        LocalDate expireDate = LocalDate.now().plusDays(2);
        Integer status = foodService.calculateStatus(expireDate);
        assertEquals(1, status);
    }

    @Test
    public void testCalculateStatus_Expired() {
        // 测试过期状态（保质期 < 1天）
        LocalDate expireDate = LocalDate.now().minusDays(1);
        Integer status = foodService.calculateStatus(expireDate);
        assertEquals(2, status);
    }

    @Test
    public void testGetCategoryName() {
        assertEquals("蔬菜", foodService.getCategoryName("vegetable"));
        assertEquals("肉类", foodService.getCategoryName("meat"));
        assertEquals("海鲜", foodService.getCategoryName("seafood"));
        assertEquals("其他", foodService.getCategoryName("unknown"));
    }

    @Test
    public void testGetStatusText() {
        assertEquals("新鲜", foodService.getStatusText(0));
        assertEquals("临期", foodService.getStatusText(1));
        assertEquals("已过期", foodService.getStatusText(2));
    }
}
