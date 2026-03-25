package com.foodrecipe.service;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.model.ObjectMetadata;
import com.foodrecipe.dto.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
public class OssService {

    @Value("${aliyun.oss.endpoint:}")
    private String endpoint;

    @Value("${aliyun.oss.accessKeyId:}")
    private String accessKeyId;

    @Value("${aliyun.oss.accessKeySecret:}")
    private String accessKeySecret;

    @Value("${aliyun.oss.bucketName:}")
    private String bucketName;

    @Value("${aliyun.oss.domain:}")
    private String domain;

    /**
     * 检查OSS是否已配置
     */
    private boolean isOssConfigured() {
        return endpoint != null && !endpoint.isEmpty()
                && accessKeyId != null && !accessKeyId.isEmpty()
                && accessKeySecret != null && !accessKeySecret.isEmpty()
                && bucketName != null && !bucketName.isEmpty()
                && domain != null && !domain.isEmpty();
    }

    /**
     * 上传文件到OSS
     */
    public Result<String> uploadFile(MultipartFile file, String folder) {
        // 检查OSS是否配置
        if (!isOssConfigured()) {
            log.warn("OSS未配置，跳过文件上传");
            return Result.error("文件上传功能未启用，请先配置OSS");
        }

        if (file.isEmpty()) {
            return Result.error("文件为空");
        }

        // 获取文件名
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));

        // 生成新文件名
        String newFilename = folder + "/" + UUID.randomUUID().toString().replace("-", "") + suffix;

        OSS ossClient = null;
        try {
            // 创建OSS客户端
            ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);

            // 上传文件
            InputStream inputStream = file.getInputStream();
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());

            ossClient.putObject(bucketName, newFilename, inputStream, metadata);

            // 返回文件URL
            String fileUrl = domain + "/" + newFilename;
            return Result.success(fileUrl);

        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error("文件上传失败: " + e.getMessage());
        } finally {
            if (ossClient != null) {
                ossClient.shutdown();
            }
        }
    }

    /**
     * 删除OSS文件
     */
    public Result<Void> deleteFile(String fileUrl) {
        // 检查OSS是否配置
        if (!isOssConfigured()) {
            log.warn("OSS未配置，跳过文件删除");
            return Result.error("文件删除功能未启用");
        }

        try {
            // 从URL中提取文件名
            String objectName = fileUrl.replace(domain + "/", "");

            OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
            ossClient.deleteObject(bucketName, objectName);
            ossClient.shutdown();

            return Result.success();
        } catch (Exception e) {
            log.error("文件删除失败", e);
            return Result.error("文件删除失败: " + e.getMessage());
        }
    }
}
