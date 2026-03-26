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
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
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
     * 检查OSS是否已配置 - 公共方法
     */
    public boolean isConfigured() {
        return endpoint != null && !endpoint.isEmpty()
                && accessKeyId != null && !accessKeyId.isEmpty()
                && accessKeySecret != null && !accessKeySecret.isEmpty()
                && bucketName != null && !bucketName.isEmpty()
                && domain != null && !domain.isEmpty();
    }

    /**
     * 检查OSS是否已配置（兼容旧方法）
     */
    private boolean isOssConfigured() {
        return isConfigured();
    }

    /**
     * 上传文件到OSS - 返回文件路径而非签名URL
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

            // 返回文件路径（不含签名）
            log.info("文件上传成功，返回路径: {}", newFilename);
            return Result.success(newFilename);

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
     * 生成带签名的URL（从存储的OSS路径）
     */
    public Result<String> generateSignedUrl(String fileUrl) {
        if (!isOssConfigured()) {
            return Result.success(fileUrl);
        }
        
        // 如果URL已经是签名URL，直接返回
        if (fileUrl.contains("?") && fileUrl.contains("Signature=")) {
            return Result.success(fileUrl);
        }
        
        OSS ossClient = null;
        try {
            // 从URL中提取对象名
            String objectName = extractObjectName(fileUrl);
            if (objectName == null || objectName.isEmpty()) {
                log.warn("无法从URL提取对象名: {}", fileUrl);
                return Result.success(fileUrl);
            }
            
            ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
            
            // 生成签名URL（有效期1小时）
            Date expiration = new Date(System.currentTimeMillis() + 3600 * 1000);
            String signedUrl = ossClient.generatePresignedUrl(bucketName, objectName, expiration).toString();
            
            // 强制使用 HTTPS
            if (signedUrl.startsWith("http://")) {
                signedUrl = signedUrl.replace("http://", "https://");
            }
            
            return Result.success(signedUrl);
        } catch (Exception e) {
            log.error("生成签名URL失败: {}", fileUrl, e);
            return Result.success(fileUrl);
        } finally {
            if (ossClient != null) {
                ossClient.shutdown();
            }
        }
    }
    
    /**
     * 批量生成带签名的URL
     */
    public List<String> generateSignedUrls(List<String> fileUrls) {
        if (!isOssConfigured() || fileUrls == null || fileUrls.isEmpty()) {
            return fileUrls;
        }
        
        OSS ossClient = null;
        try {
            ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
            Date expiration = new Date(System.currentTimeMillis() + 3600 * 1000);
            
            List<String> signedUrls = new ArrayList<>();
            for (String fileUrl : fileUrls) {
                if (fileUrl == null || fileUrl.isEmpty()) {
                    signedUrls.add(fileUrl);
                    continue;
                }
                
                // 如果URL已经是签名URL，直接返回
                if (fileUrl.contains("?") && fileUrl.contains("Signature=")) {
                    signedUrls.add(fileUrl);
                    continue;
                }
                
                String objectName = extractObjectName(fileUrl);
                if (objectName != null && !objectName.isEmpty()) {
                    String signedUrl = ossClient.generatePresignedUrl(bucketName, objectName, expiration).toString();
                    // 强制使用 HTTPS
                    if (signedUrl.startsWith("http://")) {
                        signedUrl = signedUrl.replace("http://", "https://");
                    }
                    signedUrls.add(signedUrl);
                } else {
                    signedUrls.add(fileUrl);
                }
            }
            
            return signedUrls;
        } catch (Exception e) {
            log.error("批量生成签名URL失败", e);
            return fileUrls;
        } finally {
            if (ossClient != null) {
                ossClient.shutdown();
            }
        }
    }

    /**
     * 生成图片访问URL（带签名）
     * @param fileUrl 存储的OSS URL
     * @param expireMinutes 有效期（分钟）
     * @return 带签名的临时URL
     */
    public String generateImageUrl(String fileUrl, int expireMinutes) {
        if (!isOssConfigured()) {
            return fileUrl;
        }
        
        // 如果URL已经是签名URL，直接返回
        if (fileUrl.contains("?") && fileUrl.contains("Signature=")) {
            return fileUrl;
        }
        
        OSS ossClient = null;
        try {
            String objectName = extractObjectName(fileUrl);
            if (objectName == null || objectName.isEmpty()) {
                log.warn("无法从URL提取对象名: {}", fileUrl);
                return fileUrl;
            }
            
            ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
            
            // 生成签名URL
            Date expiration = new Date(System.currentTimeMillis() + expireMinutes * 60 * 1000L);
            String signedUrl = ossClient.generatePresignedUrl(bucketName, objectName, expiration).toString();
            
            // 强制使用 HTTPS
            if (signedUrl.startsWith("http://")) {
                signedUrl = signedUrl.replace("http://", "https://");
            }
            
            return signedUrl;
        } catch (Exception e) {
            log.error("生成图片签名URL失败: {}", fileUrl, e);
            return fileUrl;
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

        OSS ossClient = null;
        try {
            // 从URL中提取文件名
            String objectName = extractObjectName(fileUrl);
            
            if (objectName == null || objectName.isEmpty()) {
                return Result.error("无法从URL提取对象名");
            }

            ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
            ossClient.deleteObject(bucketName, objectName);
            
            return Result.success();
        } catch (Exception e) {
            log.error("文件删除失败", e);
            return Result.error("文件删除失败: " + e.getMessage());
        } finally {
            if (ossClient != null) {
                ossClient.shutdown();
            }
        }
    }
    
    /**
     * 从URL中提取对象名（存储路径）
     */
    private String extractObjectName(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return null;
        }
        
        // 如果URL包含?，去掉查询参数部分（签名部分）
        int queryIndex = fileUrl.indexOf("?");
        if (queryIndex > 0) {
            fileUrl = fileUrl.substring(0, queryIndex);
        }
        
        try {
            // 如果URL以http开头，提取路径部分
            if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
                URL url = new URL(fileUrl);
                String path = url.getPath();
                
                // 去掉开头的/
                if (path.startsWith("/")) {
                    path = path.substring(1);
                }
                
                return path;
            }
        } catch (Exception e) {
            log.error("解析URL失败: {}", fileUrl, e);
        }
        
        // 如果不是URL格式，直接返回（可能已经是对象名）
        return fileUrl;
    }
}
