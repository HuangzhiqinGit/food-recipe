package com.foodrecipe.controller;

import com.foodrecipe.dto.Result;
import com.foodrecipe.service.FoodAiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/food")
public class FoodAiController {

    @Autowired
    private FoodAiService foodAiService;

    /**
     * AI识别食材图片
     * 上传图片，AI识别出食材名称、分类、存放位置
     */
    @PostMapping("/scan")
    public Result<Map<String, Object>> scanFood(@RequestParam(value = "file", required = false) MultipartFile file) {
        log.info("====== AI识别食材请求 ======");
        log.info("file is null: {}", file == null);
        
        if (file == null) {
            log.error("文件参数为空");
            return Result.error(400, "请上传图片 (file参数为空)");
        }
        
        log.info("fileName: {}, size: {}, contentType: {}", 
            file.getOriginalFilename(), file.getSize(), file.getContentType());
        
        if (file.isEmpty()) {
            log.error("文件内容为空");
            return Result.error(400, "请上传图片 (文件内容为空)");
        }
        
        try {
            Result<Map<String, Object>> result = foodAiService.recognizeFood(file);
            log.info("识别成功");
            return result;
        } catch (Exception e) {
            log.error("AI识别食材异常", e);
            return Result.error(500, "服务器内部错误: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }
}