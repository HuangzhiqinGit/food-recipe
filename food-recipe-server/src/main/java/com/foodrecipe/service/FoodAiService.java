package com.foodrecipe.service;

import com.foodrecipe.dto.Result;
import com.foodrecipe.util.AiUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class FoodAiService {

    @Autowired
    private OssService ossService;

    @Autowired
    private AiUtil aiUtil;

    @Value("${aliyun.oss.domain:}")
    private String ossDomain;

    /**
     * AI识别食材图片
     * 1. 上传图片到OSS
     * 2. 调用AI识别食材信息
     * 3. 返回识别结果和图片URL
     */
    public Result<Map<String, Object>> recognizeFood(MultipartFile file) {
        log.info("====== FoodAiService.recognizeFood ======");
        log.info("fileName: {}, size: {}, contentType: {}", 
            file.getOriginalFilename(), file.getSize(), file.getContentType());
        
        try {
            // 1. 上传图片到OSS
            log.info("步骤1: 上传图片到OSS...");
            Result<String> uploadResult = ossService.uploadFile(file, "foods");
            log.info("上传结果: code={}, message={}", uploadResult.getCode(), uploadResult.getMessage());
            
            if (uploadResult.getCode() != 200) {
                log.error("图片上传失败: {}", uploadResult.getMessage());
                return Result.error("图片上传失败: " + uploadResult.getMessage());
            }
            
            String ossPath = uploadResult.getData();
            log.info("图片上传成功, path: {}", ossPath);
            
            // 2. 调用AI识别
            log.info("步骤2: 调用AI识别...");
            Map<String, Object> aiResult = aiUtil.recognizeFood(file);
            log.info("AI识别结果: {}", aiResult);
            
            // 3. 组装返回结果
            log.info("步骤3: 组装返回结果...");
            Map<String, Object> result = new HashMap<>();
            result.put("name", aiResult.getOrDefault("name", ""));
            result.put("category", aiResult.getOrDefault("category", "other"));
            result.put("location", aiResult.getOrDefault("location", "冰箱冷藏"));
            // 拼接完整图片URL
            String fullImageUrl = ossDomain.endsWith("/") ? ossDomain + ossPath : ossDomain + "/" + ossPath;
            result.put("imageUrl", fullImageUrl);
            
            log.info("最终返回结果: {}", result);
            return Result.success(result);
            
        } catch (Exception e) {
            log.error("AI识别食材失败", e);
            return Result.error(500, "识别失败: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }
}