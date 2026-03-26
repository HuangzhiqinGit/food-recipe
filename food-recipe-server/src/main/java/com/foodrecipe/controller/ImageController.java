package com.foodrecipe.controller;

import com.foodrecipe.dto.Result;
import com.foodrecipe.service.OssService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 图片处理Controller
 * 用于获取图片的签名URL（私有bucket）
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/image")
@RequiredArgsConstructor
public class ImageController {

    private final OssService ossService;

    /**
     * 获取单张图片的签名URL
     * @param url 图片存储路径（如 foods/xxx.jpg）
     * @return 带签名的临时访问URL
     */
    @GetMapping("/url")
    public Result<String> getSignedUrl(@RequestParam String url) {
        log.debug("获取图片签名URL: {}", url);
        
        if (url == null || url.isEmpty()) {
            return Result.success("");
        }
        
        // 如果已经是完整URL，直接返回
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return Result.success(url);
        }
        
        return ossService.generateSignedUrl(url);
    }

    /**
     * 批量获取图片的签名URL
     * @param request 包含urls列表
     * @return 签名URL列表
     */
    @PostMapping("/urls")
    public Result<List<String>> getSignedUrls(@RequestBody Map<String, List<String>> request) {
        List<String> urls = request.get("urls");
        log.debug("批量获取图片签名URL, count: {}", urls != null ? urls.size() : 0);
        
        if (urls == null || urls.isEmpty()) {
            return Result.success(new ArrayList<>());
        }
        
        List<String> signedUrls = new ArrayList<>();
        for (String url : urls) {
            if (url == null || url.isEmpty()) {
                signedUrls.add("");
                continue;
            }
            
            // 如果已经是完整URL，直接返回
            if (url.startsWith("http://") || url.startsWith("https://")) {
                signedUrls.add(url);
                continue;
            }
            
            Result<String> result = ossService.generateSignedUrl(url);
            signedUrls.add(result.getData());
        }
        
        return Result.success(signedUrls);
    }
}
