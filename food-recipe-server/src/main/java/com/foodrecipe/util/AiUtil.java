package com.foodrecipe.util;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class AiUtil {

    @Value("${moonshot.api.key:}")
    private String apiKey;

    @Value("${moonshot.api.url:https://api.moonshot.cn/v1/chat/completions}")
    private String apiUrl;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * AI识别食材图片
     * 使用Moonshot AI (Kimi) Vision API
     */
    public Map<String, Object> recognizeFood(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();

        // 如果未配置API Key，返回默认数据
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("Moonshot API Key 未配置，使用默认识别结果");
            result.put("name", "未知食材");
            result.put("category", "other");
            result.put("location", "冰箱冷藏");
            return result;
        }

        try {
            // 将图片转为Base64
            byte[] imageBytes = file.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            String mimeType = file.getContentType();

            // 构建请求体
            JSONObject requestBody = new JSONObject();
            requestBody.put("model", "moonshot-v1-8k-vision-preview");

            JSONArray messages = new JSONArray();
            JSONObject message = new JSONObject();
            message.put("role", "user");

            JSONArray content = new JSONArray();

            // 图片内容
            JSONObject imageContent = new JSONObject();
            imageContent.put("type", "image_url");
            JSONObject imageUrl = new JSONObject();
            imageUrl.put("url", "data:" + mimeType + ";base64," + base64Image);
            imageContent.put("image_url", imageUrl);
            content.add(imageContent);

            // 文本提示
            JSONObject textContent = new JSONObject();
            textContent.put("type", "text");
            textContent.put("text", "请识别这张图片中的食材。返回JSON格式：{\"name\": \"食材名称\", \"category\": \"分类\", \"location\": \"存放位置\"}。分类可选值：vegetable(蔬菜), meat(肉类), seafood(海鲜), egg(蛋奶), staple(主食), seasoning(调料), drink(酒水), other(其他)。存放位置可选值：冰箱冷藏、冰箱冷冻、常温。只返回JSON，不要其他内容。");
            content.add(textContent);

            message.put("content", content);
            messages.add(message);
            requestBody.put("messages", messages);

            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<String> entity = new HttpEntity<>(requestBody.toJSONString(), headers);

            log.info("调用Moonshot AI识别食材...");
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            // 解析响应
            JSONObject responseBody = JSON.parseObject(response.getBody());
            JSONArray choices = responseBody.getJSONArray("choices");

            if (choices != null && !choices.isEmpty()) {
                JSONObject choice = choices.getJSONObject(0);
                JSONObject aiMessage = choice.getJSONObject("message");
                String aiContent = aiMessage.getString("content");

                log.info("AI返回内容: {}", aiContent);

                // 提取JSON
                JSONObject aiResult = extractJson(aiContent);
                if (aiResult != null) {
                    result.put("name", aiResult.getString("name"));
                    result.put("category", aiResult.getString("category"));
                    result.put("location", aiResult.getString("location"));
                } else {
                    // 解析失败，使用默认值
                    result.put("name", "未知食材");
                    result.put("category", "other");
                    result.put("location", "冰箱冷藏");
                }
            }

        } catch (Exception e) {
            log.error("调用AI识别失败", e);
            // 返回默认值
            result.put("name", "未知食材");
            result.put("category", "other");
            result.put("location", "冰箱冷藏");
        }

        return result;
    }

    /**
     * 从AI返回的文本中提取JSON
     */
    private JSONObject extractJson(String text) {
        try {
            // 尝试直接解析
            return JSON.parseObject(text);
        } catch (Exception e) {
            // 尝试从Markdown代码块中提取
            if (text.contains("```json")) {
                int start = text.indexOf("```json") + 7;
                int end = text.indexOf("```", start);
                if (end > start) {
                    String jsonStr = text.substring(start, end).trim();
                    return JSON.parseObject(jsonStr);
                }
            }
            // 尝试从普通代码块中提取
            if (text.contains("```")) {
                int start = text.indexOf("```") + 3;
                int end = text.indexOf("```", start);
                if (end > start) {
                    String jsonStr = text.substring(start, end).trim();
                    return JSON.parseObject(jsonStr);
                }
            }
        }
        return null;
    }
}