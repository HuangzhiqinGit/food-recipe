package com.foodrecipe.controller;

import com.alibaba.fastjson2.JSONObject;
import com.foodrecipe.dto.Result;
import com.foodrecipe.entity.User;
import com.foodrecipe.service.UserService;
import com.foodrecipe.util.JwtUtil;
import com.foodrecipe.util.WxUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private WxUtil wxUtil;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String code = params.get("code");
        if (code == null || code.isEmpty()) {
            return Result.error("code不能为空");
        }

        // 调用微信接口获取openid
        JSONObject wxData = wxUtil.code2Session(code);
        if (wxData == null || wxData.getString("openid") == null) {
            return Result.error("微信登录失败");
        }

        String openid = wxData.getString("openid");
        String nickname = params.getOrDefault("nickname", "微信用户");
        String avatarUrl = params.getOrDefault("avatarUrl", "");

        // 创建或更新用户
        User user = userService.createOrUpdateUser(openid, nickname, avatarUrl);

        // 生成token
        String token = jwtUtil.generateToken(user.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userInfo", user);

        return Result.success(result);
    }

    @GetMapping("/validate")
    public Result<User> validateToken(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Long userId = jwtUtil.getUserIdFromToken(token);

        if (userId == null) {
            return Result.error(401, "token无效");
        }

        User user = userService.getById(userId);
        if (user == null) {
            return Result.error(401, "用户不存在");
        }

        return Result.success(user);
    }
}
