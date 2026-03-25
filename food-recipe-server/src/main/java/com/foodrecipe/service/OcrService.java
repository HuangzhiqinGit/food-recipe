package com.foodrecipe.service;

import com.foodrecipe.dto.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class OcrService {

    @Value("${aliyun.ocr.accessKeyId:}")
    private String accessKeyId;

    @Value("${aliyun.ocr.accessKeySecret:}")
    private String accessKeySecret;

    /**
     * 识别图片中的食材信息
     * 简化版：使用正则表达式识别常见食材名称和日期
     */
    public Result<Map<String, Object>> recognizeFood(String base64Image) {
        log.info("OCR识别请求");
        
        // 简化实现：返回模拟数据
        // 实际项目中应调用阿里云OCR或腾讯云OCR API
        Map<String, Object> result = new HashMap<>();
        result.put("name", "");
        result.put("brand", "");
        result.put("expireDate", "");
        result.put("rawText", "");
        
        return Result.success(result);
    }

    /**
     * 从文本中提取过期日期
     */
    private String extractExpireDate(String text) {
        // 匹配常见日期格式：2024-12-31, 2024/12/31, 2024年12月31日
        Pattern pattern = Pattern.compile("(\\d{4})[-/年](\\d{1,2})[-/月](\\d{1,2})[日]?");
        Matcher matcher = pattern.matcher(text);
        
        if (matcher.find()) {
            return matcher.group(1) + "-" + String.format("%02d", Integer.parseInt(matcher.group(2))) 
                + "-" + String.format("%02d", Integer.parseInt(matcher.group(3)));
        }
        return "";
    }
}
