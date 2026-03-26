package com.foodrecipe.controller;

import com.foodrecipe.dto.Result;
import com.foodrecipe.entity.User;
import com.foodrecipe.service.OssService;
import com.foodrecipe.service.UserService;
import com.foodrecipe.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OssService ossService;

    /**
     * 更新用户信息
     */
    @PutMapping("/update")
    public Result<User> updateUserInfo(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> params) {
        
        String token = authHeader.replace("Bearer ", "");
        Long userId = jwtUtil.getUserIdFromToken(token);

        if (userId == null) {
            return Result.error(401, "token无效");
        }

        User user = userService.getById(userId);
        if (user == null) {
            return Result.error(401, "用户不存在");
        }

        // 更新用户信息
        String avatarUrl = params.get("avatarUrl");
        String nickname = params.get("nickname");
        
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        if (nickname != null) {
            user.setNickname(nickname);
        }
        
        userService.updateById(user);
        
        // 返回时处理 avatarUrl 为带签名的完整 URL
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            Result<String> signedUrlResult = ossService.generateSignedUrl(user.getAvatarUrl());
            if (signedUrlResult.getCode() == 200) {
                user.setAvatarUrl(signedUrlResult.getData());
            }
        }
        
        return Result.success(user);
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/info")
    public Result<User> getUserInfo(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Long userId = jwtUtil.getUserIdFromToken(token);

        if (userId == null) {
            return Result.error(401, "token无效");
        }

        User user = userService.getById(userId);
        if (user == null) {
            return Result.error(401, "用户不存在");
        }

        // 返回时处理 avatarUrl 为带签名的完整 URL
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            Result<String> signedUrlResult = ossService.generateSignedUrl(user.getAvatarUrl());
            if (signedUrlResult.getCode() == 200) {
                user.setAvatarUrl(signedUrlResult.getData());
            }
        }

        return Result.success(user);
    }
}