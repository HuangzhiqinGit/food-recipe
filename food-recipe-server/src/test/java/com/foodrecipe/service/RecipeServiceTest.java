package com.foodrecipe.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class RecipeServiceTest {

    @Autowired
    private RecipeService recipeService;

    @Test
    public void testGetTypeName() {
        assertEquals("全素", recipeService.getTypeName("vegetarian"));
        assertEquals("半荤", recipeService.getTypeName("semi_meat"));
        assertEquals("全荤", recipeService.getTypeName("meat"));
        assertEquals("其他", recipeService.getTypeName("unknown"));
    }

    @Test
    public void testGetDurationName() {
        assertEquals("10分钟", recipeService.getDurationName("10min"));
        assertEquals("15分钟", recipeService.getDurationName("15min"));
        assertEquals("20分钟", recipeService.getDurationName("20min"));
        assertEquals("30分钟+", recipeService.getDurationName("30min_plus"));
        assertEquals("未知", recipeService.getDurationName("unknown"));
    }
}
