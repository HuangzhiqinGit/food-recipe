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
    public Result<Map<String, Object>> scanFood(@RequestParam("file") MultipartFile file) {
        log.info("AI识别食材请求, fileName: {}, size: {}", 
            file.getOriginalFilename(), file.getSize());
        
        if (file == null || file.isEmpty()) {
            return Result.error(400, "请上传图片");
        }
        
        try {
            return foodAiService.recognizeFood(file);
        } catch (Exception e) {
            log.error("AI识别食材异常", e);
            return Result.error(500, "服务器内部错误: " + e.getMessage());
        }
    }
}