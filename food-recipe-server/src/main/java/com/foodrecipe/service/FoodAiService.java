package com.foodrecipe.service;

import com.foodrecipe.dto.Result;
import com.foodrecipe.util.AiUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FoodAiService {

    private final OssService ossService;
    private final AiUtil aiUtil;

    @Value("${aliyun.oss.domain:}")
    private String ossDomain;

    /**
     * AI识别食材图片
     * 1. 上传图片到OSS
     * 2. 调用AI识别食材信息
     * 3. 返回识别结果和图片URL
     */
    public Result<Map<String, Object>> recognizeFood(MultipartFile file) {
        try {
            // 1. 上传图片到OSS
            Result<String> uploadResult = ossService.uploadFile(file, "foods");
            if (uploadResult.getCode() != 200) {
                return Result.error("图片上传失败: " + uploadResult.getMessage());
            }
            
            String ossPath = uploadResult.getData();
            log.info("图片上传成功, path: {}", ossPath);
            
            // 2. 调用AI识别
            Map<String, Object> aiResult = aiUtil.recognizeFood(file);
            
            // 3. 组装返回结果
            Map<String, Object> result = new HashMap<>();
            result.put("name", aiResult.getOrDefault("name", ""));
            result.put("category", aiResult.getOrDefault("category", "other"));
            result.put("location", aiResult.getOrDefault("location", "冰箱冷藏"));
            result.put("imageUrl", ossPath);
            
            log.info("AI识别结果: {}", result);
            return Result.success(result);
            
        } catch (Exception e) {
            log.error("AI识别食材失败", e);
            return Result.error(500, "识别失败: " + e.getMessage());
        }
    }
}