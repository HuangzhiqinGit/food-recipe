package com.foodrecipe.config;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONReader;
import com.alibaba.fastjson2.JSONWriter;
import com.alibaba.fastjson2.support.config.FastJsonConfig;
import com.alibaba.fastjson2.support.spring6.http.converter.FastJsonHttpMessageConverter;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

/**
 * Fastjson2 配置
 * 配置 LocalDateTime 和 LocalDate 的序列化格式
 */
@Configuration
public class FastjsonConfig implements WebMvcConfigurer {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        FastJsonHttpMessageConverter converter = new FastJsonHttpMessageConverter();
        
        FastJsonConfig config = new FastJsonConfig();
        config.setCharset(StandardCharsets.UTF_8);
        
        // 配置日期时间格式
        config.setDateFormat("yyyy-MM-dd HH:mm:ss");
        
        // 配置序列化特性
        config.setWriterFeatures(
            JSONWriter.Feature.WriteLongAsString,  // Long 转为 String，避免前端精度丢失
            JSONWriter.Feature.WriteMapNullValue,   // 输出 null 值
            JSONWriter.Feature.PrettyFormat         // 格式化输出（开发环境）
        );
        
        // 配置反序列化特性
        config.setReaderFeatures(
            JSONReader.Feature.FieldBased,          // 基于字段反序列化
            JSONReader.Feature.SupportSmartMatch    // 支持驼峰和下划线自动匹配
        );
        
        converter.setFastJsonConfig(config);
        converter.setDefaultCharset(StandardCharsets.UTF_8);
        converter.setSupportedMediaTypes(Collections.singletonList(MediaType.APPLICATION_JSON));
        
        // 将 Fastjson 添加到转换器列表首位
        converters.add(0, converter);
    }
}
