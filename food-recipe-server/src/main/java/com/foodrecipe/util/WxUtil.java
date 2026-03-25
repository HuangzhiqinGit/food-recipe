package com.foodrecipe.util;

import com.alibaba.fastjson2.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class WxUtil {

    @Value("${wx.appid}")
    private String appid;

    @Value("${wx.secret}")
    private String secret;

    private final RestTemplate restTemplate = new RestTemplate();

    public JSONObject code2Session(String code) {
        String url = String.format(
            "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
            appid, secret, code
        );

        try {
            String response = restTemplate.getForObject(url, String.class);
            return JSONObject.parseObject(response);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
