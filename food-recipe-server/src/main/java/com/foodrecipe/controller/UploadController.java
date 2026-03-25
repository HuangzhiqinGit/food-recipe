package com.foodrecipe.controller;

import com.foodrecipe.dto.Result;
import com.foodrecipe.service.OssService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
public class UploadController {

    private final OssService ossService;

    /**
     * 上传图片
     */
    @PostMapping("/image")
    public Result<String> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "food") String type) {
        log.info("上传图片请求, type: {}, fileName: {}", type, file.getOriginalFilename());
        
        // 根据类型选择文件夹
        String folder = "food".equals(type) ? "foods" : "recipes";
        return ossService.uploadFile(file, folder);
    }
}
