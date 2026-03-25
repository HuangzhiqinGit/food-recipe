# 构建阶段 - 使用国内镜像
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# 复制pom.xml和源代码
COPY pom.xml .
COPY src ./src

# 使用阿里云Maven镜像加速构建
RUN mkdir -p /root/.m2 && \
    echo '<?xml version="1.0" encoding="UTF-8"?><settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd"><mirrors><mirror><id>aliyunmaven</id><name>阿里云公共仓库</name><url>https://maven.aliyun.com/repository/public</url><mirrorOf>central</mirrorOf></mirror></mirrors></settings>' > /root/.m2/settings.xml

# 构建项目
RUN mvn clean package -DskipTests

# 运行阶段 - 使用国内镜像
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 复制构建好的jar包
COPY --from=builder /app/target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 设置时区
ENV TZ=Asia/Shanghai

# 启动应用
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
