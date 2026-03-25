package com.foodrecipe.controller;

import com.foodrecipe.dto.Result;
import com.foodrecipe.entity.Food;
import com.foodrecipe.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class FoodControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JwtUtil jwtUtil;

    private String token;
    private HttpHeaders headers;

    @BeforeEach
    public void setup() {
        // 生成测试token
        token = jwtUtil.generateToken(1L);
        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.setContentType(MediaType.APPLICATION_JSON);
    }

    @Test
    public void testGetFoodList() {
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Result> response = restTemplate.exchange(
            "/api/v1/foods",
            HttpMethod.GET,
            entity,
            Result.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(200, response.getBody().getCode());
    }

    @Test
    public void testAddFood() {
        Map<String, Object> food = new HashMap<>();
        food.put("name", "测试食材");
        food.put("category", "vegetable");
        food.put("quantity", 5);
        food.put("unit", "个");
        food.put("location", "冰箱冷藏");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(food, headers);
        ResponseEntity<Result> response = restTemplate.exchange(
            "/api/v1/foods",
            HttpMethod.POST,
            entity,
            Result.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(200, response.getBody().getCode());
    }
}
