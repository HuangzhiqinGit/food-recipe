package com.foodrecipe.util;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class JwtUtilTest {

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    public void testGenerateAndValidateToken() {
        Long userId = 12345L;

        // 生成token
        String token = jwtUtil.generateToken(userId);
        assertNotNull(token);
        assertTrue(token.length() > 0);

        // 验证token
        assertTrue(jwtUtil.validateToken(token));

        // 获取用户ID
        Long extractedUserId = jwtUtil.getUserIdFromToken(token);
        assertEquals(userId, extractedUserId);
    }

    @Test
    public void testInvalidToken() {
        String invalidToken = "invalid.token.here";
        assertFalse(jwtUtil.validateToken(invalidToken));
        assertNull(jwtUtil.getUserIdFromToken(invalidToken));
    }
}
