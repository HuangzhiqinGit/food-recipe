# 家庭食材&菜谱管理小程序

> 一款帮助家庭管理食材库存、智能推荐菜谱、生成购物清单的微信小程序

---

## 项目概述

### 功能特性
- **食材库存管理**: 轻松记录食材，自动提醒临期，减少浪费
- **智能菜谱推荐**: 根据现有食材智能推荐可做的菜
- **便捷购物清单**: 从菜谱一键添加缺失食材，采购不遗漏

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 微信小程序原生框架 (WXML/WXSS/JS) |
| 后端 | Java 17 + Spring Boot 3.2 + MyBatis Plus |
| 数据库 | MySQL 8.0 |
| 缓存 | Redis (可选) |
| 文件存储 | 阿里云OSS (可选) |
| 部署 | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## 项目结构

```
food-recipe-miniapp/          # 小程序前端
├── pages/                    # 页面
│   ├── home/                 # 首页
│   ├── food/                 # 食材模块
│   ├── recipe/               # 菜谱模块
│   └── shopping/             # 购物清单模块
├── components/               # 公共组件
├── utils/                    # 工具函数
├── services/                 # 业务服务
└── assets/                   # 静态资源

food-recipe-server/           # Java后端
├── src/main/java/com/foodrecipe/
│   ├── controller/           # 控制器
│   ├── service/              # 业务逻辑
│   ├── mapper/               # 数据访问
│   ├── entity/               # 实体类
│   ├── dto/                  # 数据传输对象
│   ├── util/                 # 工具类
│   ├── config/               # 配置类
│   └── task/                 # 定时任务
├── src/main/resources/
│   ├── application.yml       # 应用配置
│   ├── application-prod.yml  # 生产环境配置
│   └── schema.sql            # 数据库脚本
├── src/test/                 # 测试代码
├── .github/workflows/        # CI/CD配置
├── Dockerfile                # Docker镜像构建
├── docker-compose.yml        # Docker Compose配置
├── deploy.sh                 # 部署脚本
└── pom.xml                   # Maven配置
```

---

## 快速开始

### 1. 本地开发环境

#### 1.1 数据库初始化

```bash
# 登录MySQL
mysql -u root -p

# 执行数据库脚本
source food-recipe-server/src/main/resources/schema.sql
```

#### 1.2 启动后端服务

```bash
cd food-recipe-server

# 修改配置文件
vim src/main/resources/application.yml
# 配置数据库连接、JWT密钥、微信小程序appid/secret

# 编译运行
mvn clean install
mvn spring-boot:run

# 或使用IDEA直接运行 FoodRecipeApplication
```

#### 1.3 启动前端

```bash
# 使用微信开发者工具打开 food-recipe-miniapp 目录
# 修改 app.js 中的 baseUrl 为后端地址

# 在开发者工具中点击"编译"
```

---

## 2. Docker部署

### 2.1 使用Docker Compose一键部署

```bash
cd food-recipe-server

# 设置环境变量
export MYSQL_PASSWORD=your_password
export JWT_SECRET=your_jwt_secret
export WX_APPID=your_wx_appid
export WX_SECRET=your_wx_secret

# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 2.2 手动构建Docker镜像

```bash
cd food-recipe-server

# 构建镜像
docker build -t food-recipe-server:latest .

# 运行容器
docker run -d \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/food_recipe \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  -e JWT_SECRET=your_jwt_secret \
  -e WX_APPID=your_wx_appid \
  -e WX_SECRET=your_wx_secret \
  --name food-recipe-server \
  food-recipe-server:latest
```

---

## 3. 生产环境部署

### 3.1 服务器要求

- Linux服务器（推荐Ubuntu 20.04+）
- Docker 20.10+
- Docker Compose 2.0+
- Nginx（用于反向代理和SSL）

### 3.2 部署步骤

```bash
# 1. 克隆代码
git clone https://github.com/yourusername/food-recipe-miniapp.git
cd food-recipe-miniapp/food-recipe-server

# 2. 执行部署脚本
chmod +x deploy.sh
sudo ./deploy.sh

# 3. 配置Nginx
sudo cp nginx.conf /etc/nginx/sites-available/food-recipe
sudo ln -s /etc/nginx/sites-available/food-recipe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.3 配置SSL证书（Let's Encrypt）

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 4. CI/CD配置

### 4.1 GitHub Actions配置

项目已配置GitHub Actions工作流，位于 `.github/workflows/ci-cd.yml`

**需要配置的Secrets：**

| Secret | 说明 |
|--------|------|
| `DOCKER_USERNAME` | Docker Hub用户名 |
| `DOCKER_PASSWORD` | Docker Hub密码 |
| `SERVER_HOST` | 部署服务器IP |
| `SERVER_USER` | 服务器用户名 |
| `SERVER_SSH_KEY` | SSH私钥 |

### 4.2 自动化流程

1. **Push到main分支**: 自动构建、测试、打包Docker镜像
2. **PR到main分支**: 执行构建和测试
3. **构建成功**: 自动部署到生产服务器

---

## 5. 配置说明

### 5.1 后端配置 (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/food_recipe
    username: root
    password: your_password

jwt:
  secret: your_jwt_secret_key_here_make_it_long_and_secure
  expiration: 86400000  # 24小时

wx:
  appid: your_wx_appid
  secret: your_wx_secret

aliyun:
  oss:
    endpoint: oss-cn-hangzhou.aliyuncs.com
    accessKeyId: your_access_key_id
    accessKeySecret: your_access_key_secret
    bucketName: your_bucket_name
    domain: https://your_bucket_name.oss-cn-hangzhou.aliyuncs.com
```

### 5.2 前端配置 (app.js)

```javascript
globalData: {
  baseUrl: 'https://api.yourdomain.com/api/v1'  // 生产环境API地址
}
```

---

## 6. 测试

### 6.1 运行单元测试

```bash
cd food-recipe-server
mvn test
```

### 6.2 生成测试报告

```bash
mvn test jacoco:report
# 报告位于 target/site/jacoco/index.html
```

### 6.3 运行集成测试

```bash
mvn verify -P integration-test
```

---

## 7. API文档

### 7.1 认证接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/auth/login | POST | 微信登录 |
| /api/v1/auth/validate | GET | 验证token |

### 7.2 食材接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/foods | GET | 获取食材列表 |
| /api/v1/foods | POST | 新增食材 |
| /api/v1/foods/{id} | PUT | 编辑食材 |
| /api/v1/foods/{id} | DELETE | 删除食材 |
| /api/v1/foods/expiring/count | GET | 获取临期数量 |

### 7.3 菜谱接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/recipes | GET | 获取菜谱列表 |
| /api/v1/recipes/{id} | GET | 获取菜谱详情 |
| /api/v1/recipes | POST | 添加菜谱 |
| /api/v1/recipes/{id}/favorite | POST | 收藏/取消收藏 |

### 7.4 购物清单接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/shopping | GET | 获取购物清单 |
| /api/v1/shopping | POST | 添加清单项 |
| /api/v1/shopping/{id}/toggle | PUT | 切换购买状态 |
| /api/v1/shopping/clear | DELETE | 清空清单 |

### 7.5 文件接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/file/upload | POST | 上传图片 |
| /api/v1/file/delete | DELETE | 删除文件 |

---

## 8. 定时任务

| 任务 | 执行时间 | 说明 |
|------|----------|------|
| 食材状态更新 | 每天凌晨2点 | 自动更新食材新鲜/临期/过期状态 |

---

## 9. 开发团队

| 角色 | 职责 |
|------|------|
| 产品经理 | 需求分析、PRD文档、项目协调 |
| 技术经理 | 架构设计、技术选型、代码审查 |
| UI设计师 | 视觉设计、交互设计、设计规范 |
| 前端工程师 | 小程序开发、页面实现、接口对接 |
| 后端工程师 | 服务端开发、数据库设计、API实现 |
| 测试工程师 | 测试用例、功能测试、兼容性测试 |

---

## 10. 许可证

MIT License

---

**项目文档**
- [产品需求文档 (PRD)](docs/家庭食材菜谱小程序_PRD_v1.0.md)
- [技术设计文档](docs/家庭食材菜谱小程序_技术设计_v1.0.md)
- [UI设计规范](docs/家庭食材菜谱小程序_UI设计规范_v1.0.md)
- [测试用例](food-recipe-server/src/test/resources/test-cases.md)
