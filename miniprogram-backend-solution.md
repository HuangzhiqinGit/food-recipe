# 小程序后端开发技术实现方案

## 目录
1. [服务端架构设计](#1-服务端架构设计)
2. [技术选型推荐](#2-技术选型推荐)
3. [数据库设计](#3-数据库设计)
4. [API接口文档](#4-api接口文档)
5. [认证授权方案](#5-认证授权方案)
6. [核心代码示例](#6-核心代码示例)
7. [安全方案](#7-安全方案)
8. [部署方案](#8-部署方案)
9. [性能优化](#9-性能优化)

---

## 1. 服务端架构设计

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              客户端层                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  微信小程序  │  │   H5页面    │  │   APP      │  │  管理后台    │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
└─────────┼────────────────┼────────────────┼────────────────┼─────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                          ┌─────────┴─────────┐
                          │    CDN / 静态资源   │
                          └─────────┬─────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                          网关层 (Nginx)                                   │
│  ┌────────────────────────────────┼────────────────────────────────┐   │
│  │  - 负载均衡  - SSL终端  - 静态缓存  - 限流防护  - 日志记录        │   │
│  └────────────────────────────────┼────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                          应用服务层                                        │
│  ┌────────────────────────────────┼────────────────────────────────┐   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │   │
│  │  │用户服务 │  │订单服务 │  │商品服务 │  │支付服务 │  │...     │ │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └───┬────┘ │   │
│  │       └────────────┴────────────┴────────────┴───────────┘      │   │
│  │                         统一API网关                              │   │
│  └────────────────────────────────┼────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                          数据存储层                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   MySQL     │  │   Redis     │  │   MongoDB   │  │    OSS      │     │
│  │  (主从架构)  │  │  (缓存集群)  │  │  (文档存储)  │  │ (文件存储)   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 服务分层设计

采用经典的三层架构模式：

```
┌─────────────────────────────────────────────────────────────┐
│                      Controller 层                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 职责：接收请求、参数校验、调用Service、返回响应            ││
│  │ 特点：无业务逻辑，只做请求转发和数据转换                  ││
│  └─────────────────────────────────────────────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                      Service 层                              │
│  ┌─────────────────────────┼───────────────────────────────┐│
│  │ 职责：业务逻辑处理、事务管理、数据编排                    ││
│  │ 特点：核心业务逻辑，可调用多个DAO组合业务                 ││
│  └─────────────────────────┼───────────────────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                        DAO 层                                │
│  ┌─────────────────────────┼───────────────────────────────┐│
│  │ 职责：数据访问、SQL执行、ORM映射                          ││
│  │ 特点：只负责数据CRUD，不包含业务逻辑                      ││
│  └─────────────────────────┼───────────────────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                      数据存储层                               │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 微服务 vs 单体架构分析

| 维度 | 单体架构 | 微服务架构 |
|------|----------|------------|
| **适用场景** | 中小型项目、团队规模小、快速迭代 | 大型项目、多团队协作、高并发 |
| **开发效率** | 高，代码集中，调试方便 | 中，需要服务治理和接口协调 |
| **部署复杂度** | 低，单包部署 | 高，需要容器化和编排 |
| **扩展性** | 垂直扩展为主 | 水平扩展，按需扩缩容 |
| **运维成本** | 低 | 高，需要专业运维团队 |
| **技术栈** | 统一 | 可异构 |
| **故障隔离** | 差，单点故障影响全局 | 好，服务隔离 |

**推荐方案**：
- **初创/中小型项目**：采用单体架构 + 模块化设计，预留拆分接口
- **大型/高并发项目**：采用微服务架构，使用 Docker + K8s 部署

---

## 2. 技术选型推荐

### 2.1 Node.js 技术栈

#### 方案一：Express + TypeScript

```
技术组合：
├── 框架：Express.js 4.x
├── 语言：TypeScript 5.x
├── ORM：Prisma / TypeORM
├── 缓存：ioredis
├── 验证：Joi / Zod
├── 日志：Winston
├── 测试：Jest
└── 部署：PM2
```

**优点**：轻量、灵活、社区成熟
**缺点**：需要自行组装中间件，架构规范性依赖团队

#### 方案二：NestJS（推荐）

```
技术组合：
├── 框架：NestJS 10.x
├── 语言：TypeScript 5.x
├── ORM：TypeORM / Prisma
├── 缓存：@nestjs/cache-manager + Redis
├── 验证：class-validator + class-transformer
├── 配置：@nestjs/config
├── 日志：内置 + Winston
├── 测试：Jest (内置)
├── API文档：Swagger (内置)
└── 部署：Docker + PM2
```

**优点**：
- 企业级架构，内置依赖注入、模块化、AOP
- 与 Angular 类似的装饰器语法，学习曲线平缓
- 内置 Swagger 文档生成
- 完善的生态和最佳实践

### 2.2 Java 技术栈（Spring Boot）

```
技术组合：
├── 框架：Spring Boot 3.x
├── 语言：Java 17 / 21 (LTS)
├── ORM：MyBatis-Plus / Spring Data JPA
├── 缓存：Spring Cache + Redis
├── 安全：Spring Security + JWT
├── 验证：Hibernate Validator
├── 配置：Spring Boot Configuration
├── 日志：SLF4J + Logback
├── API文档：SpringDoc OpenAPI
├── 测试：JUnit 5 + Mockito
└── 部署：Docker + Kubernetes
```

**优点**：
- 企业级首选，生态最完善
- 性能优秀，适合高并发场景
- 人才储备充足，招聘容易

### 2.3 数据库选型

| 类型 | 技术 | 用途 | 版本建议 |
|------|------|------|----------|
| 关系型数据库 | MySQL 8.0 | 主数据库，存储业务数据 | 8.0.33+ |
| 缓存数据库 | Redis 7.x | 会话缓存、热点数据、限流 | 7.0+ |
| 文档数据库 | MongoDB | 日志、非结构化数据（可选） | 6.0+ |

### 2.4 云服务推荐

| 服务类型 | 推荐方案 | 说明 |
|----------|----------|------|
| 云服务器 | 阿里云 ECS / 腾讯云 CVM | 2核4G起步，建议4核8G |
| 数据库 | 阿里云 RDS / 腾讯云 TDSQL | MySQL 8.0，开启自动备份 |
| 缓存 | 阿里云 Redis / 腾讯云 CRS | 主从架构，建议4GB起步 |
| 对象存储 | 阿里云 OSS / 腾讯云 COS | 文件、图片存储 |
| CDN | 阿里云 CDN / 腾讯云 CDN | 静态资源加速 |
| 容器服务 | 阿里云 ACK / 腾讯云 TKE | K8s 托管服务 |

---

## 3. 数据库设计

### 3.1 数据库命名规范

```sql
-- 数据库命名：项目名_环境
miniprogram_prod
miniprogram_test
miniprogram_dev

-- 表命名：模块名_表名，全小写，下划线分隔
mp_user              -- 用户表
mp_user_profile      -- 用户详情表
mp_order             -- 订单表
mp_order_item        -- 订单明细表
mp_product           -- 商品表
mp_config            -- 配置表

-- 字段命名：全小写，下划线分隔
user_id, created_at, updated_at, is_deleted

-- 索引命名：
-- 主键：pk_表名
-- 唯一索引：uk_表名_字段名
-- 普通索引：idx_表名_字段名
```

### 3.2 用户表设计

```sql
-- 用户基础表
CREATE TABLE `mp_user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `openid` varchar(64) NOT NULL COMMENT '微信openid',
  `unionid` varchar(64) DEFAULT NULL COMMENT '微信unionid',
  `nickname` varchar(64) DEFAULT NULL COMMENT '昵称',
  `avatar_url` varchar(500) DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `gender` tinyint DEFAULT '0' COMMENT '性别：0未知 1男 2女',
  `country` varchar(50) DEFAULT NULL COMMENT '国家',
  `province` varchar(50) DEFAULT NULL COMMENT '省份',
  `city` varchar(50) DEFAULT NULL COMMENT '城市',
  `language` varchar(20) DEFAULT NULL COMMENT '语言',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：0禁用 1正常',
  `last_login_at` datetime DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除：0否 1是',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_unionid` (`unionid`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 用户详情表（扩展信息）
CREATE TABLE `mp_user_profile` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `real_name` varchar(50) DEFAULT NULL COMMENT '真实姓名',
  `id_card` varchar(18) DEFAULT NULL COMMENT '身份证号',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `address` varchar(500) DEFAULT NULL COMMENT '详细地址',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_id_card` (`id_card`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户详情表';
```

### 3.3 订单/业务表设计（通用模板）

```sql
-- 订单主表
CREATE TABLE `mp_order` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_no` varchar(32) NOT NULL COMMENT '订单编号',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `order_status` tinyint NOT NULL DEFAULT '0' COMMENT '订单状态：0待支付 1已支付 2处理中 3已完成 4已取消',
  `pay_status` tinyint NOT NULL DEFAULT '0' COMMENT '支付状态：0未支付 1已支付 2已退款',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额',
  `pay_amount` decimal(10,2) NOT NULL COMMENT '实际支付金额',
  `discount_amount` decimal(10,2) DEFAULT '0.00' COMMENT '优惠金额',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `pay_type` tinyint DEFAULT NULL COMMENT '支付方式：1微信支付 2支付宝',
  `pay_transaction_id` varchar(64) DEFAULT NULL COMMENT '第三方支付流水号',
  `remark` varchar(500) DEFAULT NULL COMMENT '订单备注',
  `cancel_reason` varchar(200) DEFAULT NULL COMMENT '取消原因',
  `cancel_time` datetime DEFAULT NULL COMMENT '取消时间',
  `finish_time` datetime DEFAULT NULL COMMENT '完成时间',
  `expire_time` datetime NOT NULL COMMENT '订单过期时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_status` (`order_status`),
  KEY `idx_pay_status` (`pay_status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 订单明细表
CREATE TABLE `mp_order_item` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL COMMENT '订单ID',
  `product_id` bigint unsigned NOT NULL COMMENT '商品ID',
  `product_name` varchar(200) NOT NULL COMMENT '商品名称',
  `product_image` varchar(500) DEFAULT NULL COMMENT '商品图片',
  `product_price` decimal(10,2) NOT NULL COMMENT '商品单价',
  `quantity` int unsigned NOT NULL COMMENT '购买数量',
  `total_amount` decimal(10,2) NOT NULL COMMENT '小计金额',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';
```

### 3.4 配置表设计

```sql
-- 系统配置表
CREATE TABLE `mp_config` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text COMMENT '配置值',
  `description` varchar(200) DEFAULT NULL COMMENT '配置说明',
  `config_type` tinyint NOT NULL DEFAULT '1' COMMENT '配置类型：1字符串 2JSON 3数字',
  `is_system` tinyint NOT NULL DEFAULT '0' COMMENT '是否系统配置：0否 1是',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 插入示例配置
INSERT INTO `mp_config` (`config_key`, `config_value`, `description`, `config_type`) VALUES
('app.name', '小程序名称', '小程序显示名称', 1),
('app.logo', 'https://example.com/logo.png', '小程序Logo', 1),
('order.auto_cancel_minutes', '30', '订单自动取消时间（分钟）', 3),
('order.auto_confirm_days', '7', '订单自动确认收货时间（天）', 3),
('wx.appid', 'wx1234567890', '微信小程序AppID', 1),
('wx.pay.mch_id', '1234567890', '微信支付商户号', 1);
```

### 3.5 索引设计原则

```sql
-- 1. 主键索引：每个表必须有自增主键
PRIMARY KEY (`id`)

-- 2. 唯一索引：业务唯一字段
UNIQUE KEY `uk_openid` (`openid`)
UNIQUE KEY `uk_order_no` (`order_no`)

-- 3. 普通索引：常用查询条件
KEY `idx_user_id` (`user_id`)
KEY `idx_status` (`status`)
KEY `idx_created_at` (`created_at`)

-- 4. 复合索引：多条件查询
KEY `idx_user_status` (`user_id`, `status`)
KEY `idx_status_created` (`order_status`, `created_at`)

-- 5. 前缀索引：长文本字段
KEY `idx_nickname` (`nickname`(10))
```

---

## 4. API接口文档

### 4.1 接口设计规范

#### URL设计规范

```
基础URL: https://api.example.com/v1

资源路径规则：
GET    /users              # 获取用户列表
GET    /users/:id          # 获取单个用户
POST   /users              # 创建用户
PUT    /users/:id          # 更新用户（全量）
PATCH  /users/:id          # 更新用户（部分）
DELETE /users/:id          # 删除用户

动作接口规则：
POST   /users/:id/follow   # 关注用户
POST   /orders/:id/cancel  # 取消订单
POST   /orders/:id/pay     # 支付订单
```

#### HTTP状态码规范

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功，无返回内容 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或Token过期 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复创建）|
| 422 | Unprocessable | 业务逻辑错误 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Error | 服务器内部错误 |

### 4.2 统一响应格式

```typescript
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "nickname": "张三",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "timestamp": 1704067200000,
  "requestId": "req_abc123xyz"
}

// 列表响应（分页）
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "timestamp": 1704067200000
}

// 错误响应
{
  "code": 400001,
  "message": "参数校验失败",
  "data": {
    "errors": [
      { "field": "phone", "message": "手机号格式不正确" }
    ]
  },
  "timestamp": 1704067200000
}
```

### 4.3 用户模块接口

#### 4.3.1 微信登录

```yaml
POST /auth/login/wechat

Description: 微信小程序登录

Request:
  Content-Type: application/json
  Body:
    code: string          # 微信登录临时凭证 (required)
    encryptedData: string # 加密数据（获取手机号时使用）
    iv: string            # 加密算法的初始向量
    userInfo:
      nickName: string
      avatarUrl: string
      gender: number
      country: string
      province: string
      city: string

Response: 200
  data:
    token: string         # JWT Token
    refreshToken: string  # 刷新Token
    expiresIn: number     # Token有效期（秒）
    userInfo:
      id: number
      nickname: string
      avatarUrl: string
      phone: string
```

#### 4.3.2 获取用户信息

```yaml
GET /users/me

Description: 获取当前登录用户信息

Headers:
  Authorization: Bearer {token}

Response: 200
  data:
    id: number
    nickname: string
    avatarUrl: string
    phone: string
    gender: number
    country: string
    province: string
    city: string
```

#### 4.3.3 更新用户信息

```yaml
PUT /users/me

Description: 更新当前用户信息

Headers:
  Authorization: Bearer {token}

Request:
  Body:
    nickname: string      # 昵称
    avatarUrl: string     # 头像
    gender: number        # 性别
    birthday: string      # 生日 (YYYY-MM-DD)

Response: 200
  data:
    id: number
    nickname: string
    ...
```

#### 4.3.4 获取手机号

```yaml
POST /users/phone

Description: 获取用户手机号（需要用户授权）

Headers:
  Authorization: Bearer {token}

Request:
  Body:
    code: string          # 获取手机号的临时凭证

Response: 200
  data:
    phone: string
```

### 4.4 业务模块接口模板（以订单为例）

#### 4.4.1 创建订单

```yaml
POST /orders

Description: 创建订单

Headers:
  Authorization: Bearer {token}

Request:
  Body:
    items:
      - productId: number
        quantity: number
    addressId: number
    remark: string
    couponId: number      # 可选

Response: 201
  data:
    orderId: number
    orderNo: string
    payAmount: number
    expireTime: string
```

#### 4.4.2 获取订单列表

```yaml
GET /orders

Description: 获取当前用户订单列表

Headers:
  Authorization: Bearer {token}

Query:
  status: number          # 订单状态筛选（可选）
  page: number            # 页码，默认1
  pageSize: number        # 每页数量，默认20

Response: 200
  data:
    list:
      - id: number
        orderNo: string
        orderStatus: number
        totalAmount: number
        items:
          - productName: string
            productImage: string
            quantity: number
    pagination:
      page: 1
      pageSize: 20
      total: 100
```

#### 4.4.3 获取订单详情

```yaml
GET /orders/:id

Description: 获取订单详情

Headers:
  Authorization: Bearer {token}

Response: 200
  data:
    id: number
    orderNo: string
    orderStatus: number
    payStatus: number
    totalAmount: number
    payAmount: number
    items: [...]
    address: {...}
    timeline: [...]
```

#### 4.4.4 取消订单

```yaml
POST /orders/:id/cancel

Description: 取消订单

Headers:
  Authorization: Bearer {token}

Request:
  Body:
    reason: string        # 取消原因

Response: 200
  data:
    success: true
```

### 4.5 接口版本管理

```
# 方案一：URL路径版本
/api/v1/users
/api/v2/users

# 方案二：Header版本
GET /api/users
Headers:
  X-API-Version: v1

# 方案三：Accept Header
GET /api/users
Headers:
  Accept: application/vnd.api.v1+json

推荐方案一（URL路径），清晰直观，便于缓存和文档管理
```

---

## 5. 认证授权方案

### 5.1 微信小程序登录流程

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   小程序端   │                    │   服务端     │                    │   微信服务器  │
└──────┬──────┘                    └──────┬──────┘                    └──────┬──────┘
       │                                   │                                   │
       │  1. wx.login() 获取 code          │                                   │
       │ ─────────────────────────────────>│                                   │
       │                                   │                                   │
       │  2. 发送 code 到服务端             │                                   │
       │ ─────────────────────────────────>│                                   │
       │                                   │                                   │
       │                                   │  3. 调用 code2session               │
       │                                   │  POST https://api.weixin.qq.com/  │
       │                                   │  sns/jscode2session               │
       │                                   │ ─────────────────────────────────>│
       │                                   │                                   │
       │                                   │  4. 返回 openid + session_key       │
       │                                   │ <─────────────────────────────────│
       │                                   │                                   │
       │                                   │  5. 生成 JWT Token                 │
       │                                   │  6. 存储用户信息                   │
       │                                   │                                   │
       │  7. 返回 Token 给小程序            │                                   │
       │ <─────────────────────────────────│                                   │
       │                                   │                                   │
       │  8. 后续请求携带 Token             │                                   │
       │  Authorization: Bearer {token}    │                                   │
       │ ─────────────────────────────────>│                                   │
       │                                   │                                   │
       │  9. 返回业务数据                   │                                   │
       │ <─────────────────────────────────│                                   │
       │                                   │                                   │
```

### 5.2 JWT Token设计

```typescript
// Token 结构
interface JWTPayload {
  // 标准声明
  iss: string;           // 签发者
  sub: string;           // 主题（用户ID）
  aud: string;           // 受众
  exp: number;           // 过期时间
  nbf: number;           // 生效时间
  iat: number;           // 签发时间
  jti: string;           // JWT ID
  
  // 自定义声明
  userId: number;        // 用户ID
  openid: string;        // 微信openid
  version: number;       // Token版本（用于强制失效）
  type: 'access' | 'refresh';  // Token类型
}

// Token 配置
const JWT_CONFIG = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,      // 独立的密钥
    expiresIn: '2h',                             // 2小时有效期
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',                             // 7天有效期
  }
};
```

### 5.3 接口鉴权中间件（NestJS示例）

```typescript
// auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      
      // 检查Token版本（支持强制登出）
      const user = await this.getUserFromCache(payload.userId);
      if (user.tokenVersion !== payload.version) {
        throw new UnauthorizedException('令牌已失效');
      }
      
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('无效的认证令牌');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

// 使用装饰器
// @Controller('users')
// @UseGuards(AuthGuard)
// export class UserController {}
```

---

## 6. 核心代码示例

### 6.1 项目结构（NestJS）

```
src/
├── main.ts                    # 应用入口
├── app.module.ts              # 根模块
├── config/                    # 配置文件
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── wx.config.ts
├── common/                    # 公共模块
│   ├── decorators/            # 自定义装饰器
│   ├── filters/               # 异常过滤器
│   ├── guards/                # 守卫
│   ├── interceptors/          # 拦截器
│   ├── pipes/                 # 管道
│   └── utils/                 # 工具函数
├── modules/                   # 业务模块
│   ├── auth/                  # 认证模块
│   ├── user/                  # 用户模块
│   ├── order/                 # 订单模块
│   └── product/               # 商品模块
├── shared/                    # 共享服务
│   ├── prisma/                # Prisma服务
│   ├── redis/                 # Redis服务
│   └── logger/                # 日志服务
└── types/                     # 类型定义
```

### 6.2 微信登录接口实现

```typescript
// auth.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma/prisma.service';
import { RedisService } from '../shared/redis/redis.service';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

interface WxSessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private httpService: HttpService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * 微信小程序登录
   */
  async wechatLogin(code: string, userInfo?: any) {
    // 1. 调用微信接口获取 openid 和 session_key
    const wxData = await this.getWxSession(code);
    
    if (wxData.errcode) {
      throw new HttpException(
        `微信登录失败: ${wxData.errmsg}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. 查询或创建用户
    let user = await this.prisma.mpUser.findUnique({
      where: { openid: wxData.openid },
    });

    if (!user) {
      // 新用户注册
      user = await this.prisma.mpUser.create({
        data: {
          openid: wxData.openid,
          unionid: wxData.unionid,
          nickname: userInfo?.nickName || null,
          avatarUrl: userInfo?.avatarUrl || null,
          gender: userInfo?.gender || 0,
          country: userInfo?.country || null,
          province: userInfo?.province || null,
          city: userInfo?.city || null,
          language: userInfo?.language || null,
          lastLoginAt: new Date(),
        },
      });
    } else {
      // 更新登录时间和用户信息
      user = await this.prisma.mpUser.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          ...(userInfo?.nickName && { nickname: userInfo.nickName }),
          ...(userInfo?.avatarUrl && { avatarUrl: userInfo.avatarUrl }),
        },
      });
    }

    // 3. 生成 Token
    const tokens = await this.generateTokens(user);

    // 4. 缓存 session_key（用于数据解密）
    await this.redis.set(
      `session_key:${user.id}`,
      wxData.session_key,
      7200, // 2小时
    );

    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 7200,
      userInfo: this.sanitizeUser(user),
    };
  }

  /**
   * 获取微信 session
   */
  private async getWxSession(code: string): Promise<WxSessionResponse> {
    const appid = process.env.WX_APPID;
    const secret = process.env.WX_SECRET;
    const url = `https://api.weixin.qq.com/sns/jscode2session`;

    const { data } = await firstValueFrom(
      this.httpService.get(url, {
        params: {
          appid,
          secret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      }),
    );

    return data;
  }

  /**
   * 生成 Token
   */
  private async generateTokens(user: any) {
    const payload = {
      userId: user.id,
      openid: user.openid,
      version: Date.now(), // 用于Token失效控制
      type: 'access',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '2h',
      }),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type !== 'refresh') {
        throw new HttpException('无效的刷新令牌', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.prisma.mpUser.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.status === 0) {
        throw new HttpException('用户不存在或已被禁用', HttpStatus.UNAUTHORIZED);
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new HttpException('刷新令牌已过期', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * 解密微信加密数据
   */
  async decryptData(userId: number, encryptedData: string, iv: string) {
    const sessionKey = await this.redis.get(`session_key:${userId}`);
    
    if (!sessionKey) {
      throw new HttpException('会话已过期，请重新登录', HttpStatus.UNAUTHORIZED);
    }

    const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      Buffer.from(sessionKey, 'base64'),
      Buffer.from(iv, 'base64'),
    );
    
    let decoded = decipher.update(encryptedData, 'base64', 'utf8');
    decoded += decipher.final('utf8');

    return JSON.parse(decoded);
  }

  /**
   * 脱敏用户信息
   */
  private sanitizeUser(user: any) {
    const { openid, unionid, ...safeUser } = user;
    return safeUser;
  }
}
```

### 6.3 统一异常处理

```typescript
// http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 500000;
    let errors = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      
      message = exceptionResponse.message || exception.message;
      code = this.getErrorCode(status);
      
      if (exceptionResponse.errors) {
        errors = exceptionResponse.errors;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 记录错误日志
    this.logger.error({
      requestId: request['requestId'],
      path: request.url,
      method: request.method,
      status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json({
      code,
      message,
      data: errors ? { errors } : null,
      timestamp: Date.now(),
      requestId: request['requestId'],
      path: request.url,
    });
  }

  private getErrorCode(status: number): number {
    const codeMap: Record<number, number> = {
      [HttpStatus.BAD_REQUEST]: 400000,
      [HttpStatus.UNAUTHORIZED]: 401000,
      [HttpStatus.FORBIDDEN]: 403000,
      [HttpStatus.NOT_FOUND]: 404000,
      [HttpStatus.CONFLICT]: 409000,
      [HttpStatus.UNPROCESSABLE_ENTITY]: 422000,
      [HttpStatus.TOO_MANY_REQUESTS]: 429000,
      [HttpStatus.INTERNAL_SERVER_ERROR]: 500000,
    };
    return codeMap[status] || 500000;
  }
}

// 自定义业务异常
// business.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    code: number = 422000,
    status: number = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super({ message, code }, status);
  }
}

// 使用示例
// throw new BusinessException('订单已过期，无法支付', 422001);
```

### 6.4 数据库操作示例（Prisma）

```typescript
// user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户信息
   */
  async findById(id: number) {
    const user = await this.prisma.mpUser.findUnique({
      where: { id, isDeleted: 0 },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.sanitizeUser(user);
  }

  /**
   * 更新用户信息
   */
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.mpUser.update({
      where: { id },
      data: {
        nickname: dto.nickname,
        avatarUrl: dto.avatarUrl,
        gender: dto.gender,
      },
    });

    return this.sanitizeUser(user);
  }

  /**
   * 获取用户列表（分页）
   */
  async findAll(query: { page: number; pageSize: number; keyword?: string }) {
    const { page = 1, pageSize = 20, keyword } = query;
    const skip = (page - 1) * pageSize;

    const where: any = { isDeleted: 0 };
    if (keyword) {
      where.OR = [
        { nickname: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.mpUser.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nickname: true,
          avatarUrl: true,
          phone: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.mpUser.count({ where }),
    ]);

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 软删除用户
   */
  async remove(id: number) {
    await this.prisma.mpUser.update({
      where: { id },
      data: { isDeleted: 1 },
    });
  }

  private sanitizeUser(user: any) {
    const { openid, unionid, ...safeUser } = user;
    return safeUser;
  }
}
```

### 6.5 缓存使用示例（Redis）

```typescript
// redis.service.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB) || 0,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * 设置哈希缓存
   */
  async hset(key: string, field: string, value: any): Promise<void> {
    await this.redis.hset(key, field, JSON.stringify(value));
  }

  /**
   * 获取哈希缓存
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await this.redis.hget(key, field);
    return value ? JSON.parse(value) : null;
  }

  /**
   * 设置分布式锁
   */
  async lock(key: string, ttl: number = 10): Promise<string | null> {
    const token = `${Date.now()}-${Math.random()}`;
    const result = await this.redis.set(key, token, 'EX', ttl, 'NX');
    return result === 'OK' ? token : null;
  }

  /**
   * 释放分布式锁
   */
  async unlock(key: string, token: string): Promise<void> {
    const current = await this.redis.get(key);
    if (current === token) {
      await this.redis.del(key);
    }
  }

  /**
   * 递增计数器
   */
  async incr(key: string): Promise<number> {
    return await this.redis.incr(key);
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }
}

// 缓存装饰器示例
// cache.decorator.ts
import { RedisService } from './redis.service';

export function Cacheable(key: string, ttl: number = 300) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const redis: RedisService = this.redisService;
      const cacheKey = `${key}:${args.join(':')}`;

      // 尝试从缓存获取
      const cached = await redis.get(cacheKey);
      if (cached) {
        return cached;
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args);

      // 写入缓存
      await redis.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

// 使用示例
// @Cacheable('product', 600)
// async getProductById(id: number) {
//   return this.prisma.product.findUnique({ where: { id } });
// }
```

### 6.6 文件上传接口

```typescript
// upload.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from '../common/guards/auth.guard';
import { OssService } from '../shared/oss/oss.service';

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private ossService: OssService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        // 只允许图片类型
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('只支持 jpg/png/gif/webp 格式的图片'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    // 上传到OSS
    const result = await this.ossService.uploadFile(
      file.path,
      `images/${Date.now()}/${file.filename}`,
    );

    return {
      url: result.url,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
          const uniqueName = `avatar-${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException('只支持 jpg/png/webp 格式的图片'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const userId = req['user'].userId;
    const result = await this.ossService.uploadFile(
      file.path,
      `avatars/${userId}/${file.filename}`,
    );

    // 更新用户头像
    await this.userService.updateAvatar(userId, result.url);

    return {
      url: result.url,
    };
  }
}

// OSS服务
// oss.service.ts
import { Injectable } from '@nestjs/common';
import * as OSS from 'ali-oss';
import * as fs from 'fs';

@Injectable()
export class OssService {
  private client: OSS;

  constructor() {
    this.client = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    });
  }

  async uploadFile(localPath: string, ossPath: string) {
    try {
      const result = await this.client.put(ossPath, localPath);
      
      // 删除临时文件
      fs.unlinkSync(localPath);

      return {
        url: result.url,
        name: result.name,
      };
    } catch (error) {
      // 清理临时文件
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      throw error;
    }
  }

  async deleteFile(ossPath: string) {
    await this.client.delete(ossPath);
  }

  async generateSignedUrl(ossPath: string, expires: number = 3600) {
    return this.client.signatureUrl(ossPath, {
      expires,
      method: 'GET',
    });
  }
}
```

---

## 7. 安全方案

### 7.1 接口签名验证

```typescript
// signature.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class SignatureMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    const nonce = req.headers['x-nonce'] as string;

    if (!signature || !timestamp || !nonce) {
      throw new UnauthorizedException('缺少签名参数');
    }

    // 检查时间戳（防止重放攻击）
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    if (Math.abs(now - requestTime) > 5 * 60 * 1000) { // 5分钟有效期
      throw new UnauthorizedException('请求已过期');
    }

    // 验证签名
    const secret = process.env.API_SECRET;
    const method = req.method.toUpperCase();
    const path = req.path;
    const body = JSON.stringify(req.body || {});
    
    const signString = `${method}&${path}&${timestamp}&${nonce}&${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signString)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('签名验证失败');
    }

    next();
  }
}

// 签名生成工具（小程序端）
/*
function generateSignature(method, path, data, secret) {
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(2);
  const body = JSON.stringify(data || {});
  
  const signString = `${method.toUpperCase()}&${path}&${timestamp}&${nonce}&${body}`;
  const signature = CryptoJS.HmacSHA256(signString, secret).toString();
  
  return {
    'X-Signature': signature,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
  };
}
*/
```

### 7.2 防重放攻击

```typescript
// replay-protection.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RedisService } from '../shared/redis/redis.service';

@Injectable()
export class ReplayProtectionGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const nonce = request.headers['x-nonce'];

    if (!nonce) {
      return true; // 如果没有nonce，跳过检查
    }

    // 检查nonce是否已存在
    const exists = await this.redis.get(`nonce:${nonce}`);
    if (exists) {
      throw new ForbiddenException('重复的请求');
    }

    // 存储nonce，设置过期时间（5分钟）
    await this.redis.set(`nonce:${nonce}`, '1', 300);

    return true;
  }
}
```

### 7.3 敏感数据加密

```typescript
// crypto.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    // 从环境变量获取密钥，或使用32字节随机密钥
    this.key = Buffer.from(
      process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
      'hex',
    );
  }

  /**
   * 加密数据
   */
  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * 解密数据
   */
  decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex'),
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * 哈希密码
   */
  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * 验证密码
   */
  verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return hash === verifyHash;
  }

  /**
   * 脱敏手机号
   */
  maskPhone(phone: string): string {
    if (!phone || phone.length !== 11) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  /**
   * 脱敏身份证号
   */
  maskIdCard(idCard: string): string {
    if (!idCard || idCard.length !== 18) return idCard;
    return idCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2');
  }
}
```

### 7.4 SQL注入防护

```typescript
// 使用Prisma ORM自动防护
// 所有查询都使用参数化查询，自动转义特殊字符

// ✅ 正确做法 - 使用参数化查询
const user = await prisma.user.findUnique({
  where: { id: userId }, // 参数会被自动转义
});

const users = await prisma.user.findMany({
  where: {
    nickname: {
      contains: keyword, // 自动转义
    },
  },
});

// ❌ 错误做法 - 直接拼接SQL
// const query = `SELECT * FROM users WHERE name = '${userInput}'`;

// 输入验证管道
// validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException('参数验证失败');
    }
  }
}

// 使用示例
// @Post()
// @UsePipes(new ZodValidationPipe(createUserSchema))
// create(@Body() dto: CreateUserDto) {}
```

---

## 8. 部署方案

### 8.1 服务器配置建议

| 环境 | 配置 | 数量 | 说明 |
|------|------|------|------|
| 开发环境 | 2核4G | 1台 | 单机部署 |
| 测试环境 | 2核4G | 2台 | 双机热备 |
| 生产环境 | 4核8G | 2+台 | 负载均衡 |

**系统要求**：
- OS: Ubuntu 22.04 LTS / CentOS 8
- Node.js: 18.x LTS / Java 17 LTS
- MySQL: 8.0+
- Redis: 7.0+
- Nginx: 1.24+

### 8.2 Docker部署配置

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建
RUN npm run build

# 生产镜像
FROM node:18-alpine

WORKDIR /app

# 安装PM2
RUN npm install -g pm2

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/ecosystem.config.js ./

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'miniprogram-api',
    script: './dist/main.js',
    instances: 'max',        // 根据CPU核心数启动进程
    exec_mode: 'cluster',    // 集群模式
    max_memory_restart: '1G', // 内存超过1G自动重启
    env: {
      NODE_ENV: 'production',
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    merge_logs: true,
    log_type: 'json',
    // 自动重启配置
    autorestart: true,
    min_uptime: '10s',
    max_restarts: 10,
    // 健康检查
    health_check_grace_period: 30000,
    // 监听文件变化（开发环境）
    watch: false,
  }],
};
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    container_name: miniprogram-api
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://user:password@mysql:3306/miniprogram
      - REDIS_URL=redis://redis:6379
      - WX_APPID=${WX_APPID}
      - WX_SECRET=${WX_SECRET}
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - mysql
      - redis
    networks:
      - app-network
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads

  mysql:
    image: mysql:8.0
    container_name: miniprogram-mysql
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=miniprogram
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    command: --default-authentication-plugin=mysql_native_password

  redis:
    image: redis:7-alpine
    container_name: miniprogram-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}

  nginx:
    image: nginx:alpine
    container_name: miniprogram-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./static:/usr/share/nginx/html
    depends_on:
      - app
    networks:
      - app-network

volumes:
  mysql-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

### 8.3 Nginx反向代理配置

```nginx
# nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript 
               application/rss+xml application/atom+xml image/svg+xml;

    # 限流配置
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    # 上游服务器
    upstream api_servers {
        least_conn;
        server app:3000 max_fails=3 fail_timeout=30s;
        # 可以添加更多实例
        # server app2:3000 max_fails=3 fail_timeout=30s;
    }

    # HTTP -> HTTPS 重定向
    server {
        listen 80;
        server_name api.example.com;
        
        location /.well-known/acme-challenge/ {
            root /usr/share/nginx/html;
        }
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS 服务
    server {
        listen 443 ssl http2;
        server_name api.example.com;

        # SSL证书
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;

        # 安全响应头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # 静态资源
        location /static/ {
            alias /usr/share/nginx/html/static/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # 上传文件
        location /uploads/ {
            alias /app/uploads/;
            expires 7d;
            add_header Cache-Control "public";
        }

        # API代理
        location /api/ {
            # 限流
            limit_req zone=api burst=20 nodelay;
            limit_conn addr 10;

            proxy_pass http://api_servers/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }

        # 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 8.4 日志收集方案

```typescript
// logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: {
        service: 'miniprogram-api',
        environment: process.env.NODE_ENV,
      },
      transports: [
        // 控制台输出
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        // 按天轮转的日志文件
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        // 错误日志单独存储
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}

// 请求日志中间件
// request-logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger } from './logger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private logger: CustomLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    req['requestId'] = requestId;
    
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      this.logger.log({
        requestId,
        method: req.method,
        path: req.path,
        query: req.query,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('user-agent'),
        ip: req.ip,
        userId: req['user']?.userId,
      }, 'HTTP Request');
    });

    next();
  }
}
```

---

## 9. 性能优化

### 9.1 数据库优化

```sql
-- 1. 索引优化
-- 为高频查询字段创建索引
CREATE INDEX idx_user_phone ON mp_user(phone);
CREATE INDEX idx_order_user_status ON mp_order(user_id, order_status);

-- 复合索引遵循最左前缀原则
CREATE INDEX idx_order_created_status ON mp_order(created_at, order_status);

-- 2. 查询优化
-- 使用EXPLAIN分析查询
EXPLAIN SELECT * FROM mp_order WHERE user_id = 1 AND order_status = 1;

-- 避免SELECT *，只查询需要的字段
SELECT id, order_no, total_amount FROM mp_order WHERE user_id = 1;

-- 使用覆盖索引
CREATE INDEX idx_order_cover ON mp_order(user_id, order_status, order_no, total_amount);

-- 3. 分页优化（深分页问题）
-- 传统分页（大数据量时性能差）
SELECT * FROM mp_order ORDER BY id DESC LIMIT 1000000, 20;

-- 优化方案：使用游标分页
SELECT * FROM mp_order WHERE id < 1000000 ORDER BY id DESC LIMIT 20;

-- 4. 分表策略
-- 按用户ID取模分表
-- mp_order_0, mp_order_1, mp_order_2, mp_order_3
-- 根据 user_id % 4 决定使用哪张表
```

### 9.2 缓存策略

```typescript
// cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class CacheService {
  constructor(private redis: RedisService) {}

  /**
   * 缓存穿透防护 - 布隆过滤器
   */
  async getWithBloomFilter<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl: number; emptyTtl: number },
  ): Promise<T | null> {
    // 1. 检查布隆过滤器
    const mayExist = await this.checkBloomFilter(key);
    if (!mayExist) {
      return null;
    }

    // 2. 查询缓存
    let data = await this.redis.get<T>(key);
    
    if (data !== null) {
      return data;
    }

    // 3. 查询数据库
    data = await fetcher();

    if (data) {
      // 缓存有效数据
      await this.redis.set(key, data, options.ttl);
    } else {
      // 缓存空值，防止缓存穿透
      await this.redis.set(key, 'NULL', options.emptyTtl);
    }

    return data;
  }

  /**
   * 缓存击穿防护 - 互斥锁
   */
  async getWithMutex<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl: number; lockTimeout: number },
  ): Promise<T | null> {
    // 1. 查询缓存
    const cached = await this.redis.get<T>(key);
    if (cached) {
      return cached;
    }

    // 2. 获取分布式锁
    const lockKey = `lock:${key}`;
    const lockToken = await this.redis.lock(lockKey, options.lockTimeout);

    if (!lockToken) {
      // 未获取到锁，等待后重试
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getWithMutex(key, fetcher, options);
    }

    try {
      // 双重检查
      const cached = await this.redis.get<T>(key);
      if (cached) {
        return cached;
      }

      // 查询数据库
      const data = await fetcher();
      if (data) {
        await this.redis.set(key, data, options.ttl);
      }

      return data;
    } finally {
      // 释放锁
      await this.redis.unlock(lockKey, lockToken);
    }
  }

  /**
   * 缓存雪崩防护 - 随机过期时间
   */
  async setWithRandomExpire<T>(
    key: string,
    value: T,
    baseTtl: number,
    variance: number = 300, // 5分钟随机范围
  ): Promise<void> {
    const randomTtl = baseTtl + Math.floor(Math.random() * variance);
    await this.redis.set(key, value, randomTtl);
  }

  private async checkBloomFilter(key: string): Promise<boolean> {
    // 简化的布隆过滤器实现
    // 实际项目中可以使用Redis Bloom模块
    return true;
  }
}

// 多级缓存示例
// multi-level-cache.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class MultiLevelCacheService {
  // L1: 本地内存缓存（Node-cache）
  private localCache: Map<string, any> = new Map();
  
  // L2: Redis缓存
  constructor(private redis: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    // 1. 查询本地缓存
    const local = this.localCache.get(key);
    if (local !== undefined) {
      return local;
    }

    // 2. 查询Redis
    const redis = await this.redis.get<T>(key);
    if (redis !== null) {
      // 回填本地缓存
      this.localCache.set(key, redis);
      return redis;
    }

    return null;
  }

  async set<T>(key: string, value: T, options: {
    localTtl: number;  // 本地缓存TTL（秒）
    redisTtl: number;  // Redis缓存TTL（秒）
  }): Promise<void> {
    // 写入本地缓存
    this.localCache.set(key, value);
    setTimeout(() => this.localCache.delete(key), options.localTtl * 1000);

    // 写入Redis
    await this.redis.set(key, value, options.redisTtl);
  }
}
```

### 9.3 接口限流

```typescript
// rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from './redis.service';

interface RateLimitOptions {
  windowMs: number;      // 时间窗口（毫秒）
  maxRequests: number;   // 最大请求数
  keyPrefix?: string;    // Redis key前缀
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const options: RateLimitOptions = this.getRateLimitOptions(context);
    
    // 生成限流key（用户ID + IP + 接口路径）
    const userId = request['user']?.userId || 'anonymous';
    const ip = request.ip;
    const path = request.route?.path || request.path;
    const key = `${options.keyPrefix || 'rate_limit'}:${userId}:${ip}:${path}`;

    // 使用滑动窗口限流
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // 移除窗口外的请求记录
    await this.redis.zremrangebyscore(key, 0, windowStart);
    
    // 获取当前窗口内的请求数
    const currentCount = await this.redis.zcard(key);

    if (currentCount >= options.maxRequests) {
      throw new HttpException(
        {
          code: 429000,
          message: '请求过于频繁，请稍后重试',
          data: {
            retryAfter: Math.ceil(options.windowMs / 1000),
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 记录本次请求
    await this.redis.zadd(key, now, `${now}-${Math.random()}`);
    await this.redis.expire(key, Math.ceil(options.windowMs / 1000));

    // 设置响应头
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', options.maxRequests);
    response.setHeader('X-RateLimit-Remaining', options.maxRequests - currentCount - 1);

    return true;
  }

  private getRateLimitOptions(context: ExecutionContext): RateLimitOptions {
    // 可以从装饰器获取配置
    // 这里使用默认配置
    return {
      windowMs: 60 * 1000,  // 1分钟
      maxRequests: 100,     // 100次请求
      keyPrefix: 'api',
    };
  }
}

// 限流装饰器
// rate-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const RateLimit = (config: RateLimitConfig) => 
  SetMetadata(RATE_LIMIT_KEY, config);

// 使用示例
// @Controller('orders')
// export class OrderController {
//   @Post()
//   @RateLimit({ windowMs: 60000, maxRequests: 10 })
//   createOrder() {}
// }
```

---

## 附录：环境变量配置模板

```bash
# .env.example

# 应用配置
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# 数据库配置
DATABASE_URL=mysql://user:password@localhost:3306/miniprogram
DATABASE_POOL_SIZE=10

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 微信小程序配置
WX_APPID=your_appid_here
WX_SECRET=your_secret_here
WX_MCH_ID=your_mch_id_here
WX_PAY_KEY=your_pay_key_here

# JWT配置
JWT_ACCESS_SECRET=your_access_secret_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars

# 加密配置
ENCRYPTION_KEY=your_encryption_key_here_32_bytes
API_SECRET=your_api_signature_secret

# OSS配置
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your_access_key
OSS_ACCESS_KEY_SECRET=your_access_secret
OSS_BUCKET=your_bucket_name
OSS_DOMAIN=https://your-bucket.oss-cn-hangzhou.aliyuncs.com

# 邮件配置（可选）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
```

---

## 总结

本方案提供了一套完整的小程序后端开发技术实现方案，涵盖了：

1. **架构设计**：三层架构 + 微服务/单体可选
2. **技术选型**：推荐 NestJS（Node.js）或 Spring Boot（Java）
3. **数据库设计**：用户表、订单表、配置表等标准模板
4. **API设计**：RESTful规范 + 统一响应格式
5. **认证授权**：微信登录 + JWT Token
6. **安全方案**：签名验证、防重放、数据加密、SQL注入防护
7. **部署方案**：Docker + Nginx + PM2
8. **性能优化**：数据库优化、多级缓存、接口限流

根据实际业务需求，可以选择合适的技术栈和架构方案进行开发。
