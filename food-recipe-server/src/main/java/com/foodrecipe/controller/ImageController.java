package com.foodrecipe.controller;

import com.foodrecipe.dto.Result;
import com.foodrecipe.service.OssService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/image")
@RequiredArgsConstructor
public class ImageController {

    private final OssService ossService;

    /**
     * 获取图片访问URL（带签名）
     * @param url 原始OSS URL
     * @return 带签名的临时URL
     */
    @GetMapping("/url")
    public Result<String> getImageUrl(@RequestParam("url") String url) {
        log.info("获取图片签名URL: {}", url);
        
        if (url == null || url.isEmpty()) {
            return Result.success("");
        }
        
        // 如果URL已经是完整的签名URL，直接返回
        if (url.contains("?") && url.contains("Signature=")) {
            return Result.success(url);
        }
        
        // 生成新的签名URL
        return ossService.generateSignedUrl(url);
    }

    /**
     * 批量获取图片访问URL（带签名）
     * @param request 包含URL列表的请求
     * @return 签名URL列表
     */
    @PostMapping("/urls")
    public Result<List<String>> getImageUrls(@RequestBody Map<String, List<String>> request) {
        List<String> urls = request.get("urls");
        log.info("批量获取图片签名URL, 数量: {}", urls != null ? urls.size() : 0);
        
        if (urls == null || urls.isEmpty()) {
            return Result.success(urls);
        }
        
        List<String> signedUrls = ossService.generateSignedUrls(urls);
        return Result.success(signedUrls);
    }
}
