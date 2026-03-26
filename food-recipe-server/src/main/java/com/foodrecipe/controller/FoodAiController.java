package com.foodrecipe.controller;

import com.foodrecipe.dto.Result;
import com.foodrecipe.service.FoodAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/food")
@RequiredArgsConstructor
public class FoodAiController {

    private final FoodAiService foodAiService;

    /**
     * AI识别食材图片
     * 上传图片，AI识别出食材名称、分类、存放位置
     */
    @PostMapping("/scan")
    public Result<Map<String, Object>> scanFood(@RequestParam("file") MultipartFile file) {
        log.info("AI识别食材请求, fileName: {}, size: {}", 
            file.getOriginalFilename(), file.getSize());
        
        if (file.isEmpty()) {
            return Result.error(400, "请上传图片");
        }
        
        return foodAiService.recognizeFood(file);
    }
}