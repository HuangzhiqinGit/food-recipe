package com.foodrecipe.controller;

import com.foodrecipe.dto.Result;
import com.foodrecipe.service.OssService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

@Slf4j
@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
public class UploadController {

    private final OssService ossService;

    // 允许的图片类型
    private static final Set<String> ALLOWED_CONTENT_TYPES = new HashSet<>(Arrays.asList(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp"
    ));

    // 最大文件大小 10MB
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    /**
     * 上传图片 - 优化错误处理
     */
    @PostMapping("/image")
    public Result<String> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "food") String type) {
        
        log.info("上传图片请求, type: {}, fileName: {}, size: {}", 
            type, file.getOriginalFilename(), file.getSize());
        
        // 1. 参数校验 - 文件是否为空
        if (file == null || file.isEmpty()) {
            log.warn("上传失败：文件为空");
            return Result.error(400, "请选择要上传的图片");
        }

        // 2. 文件大小校验
        if (file.getSize() > MAX_FILE_SIZE) {
            log.warn("上传失败：文件过大，size={}", file.getSize());
            return Result.error(413, "文件大小不能超过10MB");
        }

        // 3. 文件类型校验
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            log.warn("上传失败：不支持的文件类型，contentType={}", contentType);
            return Result.error(400, "仅支持 JPG、PNG、GIF、WebP 格式的图片");
        }

        // 4. OSS 配置检查
        if (!ossService.isConfigured()) {
            log.error("上传失败：OSS 未配置");
            return Result.error(503, "文件存储服务未配置，请联系管理员");
        }

        // 5. 执行上传
        try {
            // 根据类型选择文件夹
            String folder = "recipe".equals(type) ? "recipes" : "foods";
            Result<String> result = ossService.uploadFile(file, folder);
            
            if (result.getCode() == 200) {
                // 生成带签名的完整URL
                String filePath = result.getData();
                Result<String> signedUrlResult = ossService.generateSignedUrl(filePath);
                log.info("图片上传成功, url={}", signedUrlResult.getData());
                return signedUrlResult;
            } else {
                log.warn("图片上传失败: {}", result.getMessage());
                return result;
            }
            
        } catch (Exception e) {
            log.error("图片上传发生异常", e);
            return Result.error(500, "服务器繁忙，请稍后重试");
        }
    }

    /**
     * 检查上传服务状态
     */
    @GetMapping("/status")
    public Result<Map<String, Object>> checkStatus() {
        boolean configured = ossService.isConfigured();
        Map<String, Object> data = new HashMap<>();
        data.put("configured", configured);
        data.put("maxFileSize", MAX_FILE_SIZE);
        data.put("allowedTypes", ALLOWED_CONTENT_TYPES);
        return Result.success(data);
    }
}
