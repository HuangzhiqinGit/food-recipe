package com.foodrecipe.controller;

import com.foodrecipe.dto.Result;
import com.foodrecipe.service.OssService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/file")
public class FileController {

    @Autowired
    private OssService ossService;

    /**
     * 上传图片
     */
    @PostMapping("/upload")
    public Result<String> uploadImage(@RequestParam("file") MultipartFile file,
                                       @RequestParam(defaultValue = "images") String folder) {
        return ossService.uploadFile(file, folder);
    }

    /**
     * 删除文件
     */
    @DeleteMapping("/delete")
    public Result<Void> deleteFile(@RequestParam("url") String fileUrl) {
        return ossService.deleteFile(fileUrl);
    }
}
