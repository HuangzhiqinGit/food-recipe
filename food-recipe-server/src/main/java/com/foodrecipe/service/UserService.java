package com.foodrecipe.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.foodrecipe.entity.User;
import com.foodrecipe.mapper.UserMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService extends ServiceImpl<UserMapper, User> {

    public User getByOpenid(String openid) {
        return baseMapper.selectByOpenid(openid);
    }

    public User createOrUpdateUser(String openid, String nickname, String avatarUrl) {
        User user = getByOpenid(openid);
        if (user == null) {
            // 新用户：使用传入的值或默认值
            user = new User();
            user.setOpenid(openid);
            user.setNickname(nickname != null && !nickname.isEmpty() ? nickname : "微信用户");
            user.setAvatarUrl(avatarUrl != null ? avatarUrl : "");
            user.setLastLoginAt(LocalDateTime.now());
            save(user);
        } else {
            // 已存在用户：只更新非空值
            if (nickname != null && !nickname.isEmpty()) {
                user.setNickname(nickname);
            }
            if (avatarUrl != null && !avatarUrl.isEmpty()) {
                user.setAvatarUrl(avatarUrl);
            }
            user.setLastLoginAt(LocalDateTime.now());
            updateById(user);
        }
        return user;
    }
}
