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
            user = new User();
            user.setOpenid(openid);
            user.setNickname(nickname);
            user.setAvatarUrl(avatarUrl);
            user.setLastLoginAt(LocalDateTime.now());
            save(user);
        } else {
            user.setNickname(nickname);
            user.setAvatarUrl(avatarUrl);
            user.setLastLoginAt(LocalDateTime.now());
            updateById(user);
        }
        return user;
    }
}
