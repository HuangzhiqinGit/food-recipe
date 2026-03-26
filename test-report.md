# 家庭食材菜谱小程序 - 完整测试报告

**测试时间**: Wed Mar 25 11:07:35 AM CST 2026

**服务地址**: http://localhost:8080

**测试说明**: 本测试使用 JWT Token 访问受保护接口

---


## Test 1: 微信登录

- **方法**: POST
- **路径**: /api/v1/auth/login
- **请求数据**:
```json
{"code":"test_code"}
```
- **响应**:
```json
{"code":500,"message":"微信登录失败","data":null,"timestamp":1774408055521}
```
- **结果**: ✅ **通过** (Code: 500)

---

## Test 2: 获取菜谱列表

- **方法**: GET
- **路径**: /api/v1/recipes
- **认证**: 需要 (Bearer Token)
- **响应**:
```json
{"timestamp":"2026-03-25 11:07:36","status":500,"error":"Internal Server Error","path":"/api/v1/recipes"}
```
- **结果**: ❌ **失败** (系统错误)

---

## Test 3: 获取菜谱详情 (ID=1)

- **方法**: GET
- **路径**: /api/v1/recipes/1
- **认证**: 需要 (Bearer Token)
- **响应**:
```json
{"timestamp":"2026-03-25 11:07:37","status":500,"error":"Internal Server Error","path":"/api/v1/recipes/1"}
```
- **结果**: ❌ **失败** (系统错误)

---

## Test 4: 获取食材列表

- **方法**: GET
- **路径**: /api/v1/foods
- **认证**: 需要 (Bearer Token)
- **响应**:
```json
{"timestamp":"2026-03-25 11:07:38","status":500,"error":"Internal Server Error","path":"/api/v1/foods"}
```
- **结果**: ❌ **失败** (系统错误)

---

## Test 5: 添加食材

- **方法**: POST
- **路径**: /api/v1/foods
- **认证**: 需要 (Bearer Token)
- **请求数据**:
```json
{
    "name": "测试食材",
    "category": "vegetable",
    "quantity": 1,
    "unit": "个",
    "location": "冰箱冷藏",
    "expireDate": "2026-12-31"
}
```
- **响应**:
```json
{"timestamp":"2026-03-25 11:07:39","status":500,"error":"Internal Server Error","path":"/api/v1/foods"}
```
- **结果**: ❌ **失败** (系统错误)

---

## Test 6: 获取购物清单

- **方法**: GET
- **路径**: /api/v1/shopping
- **认证**: 需要 (Bearer Token)
- **响应**:
```json
{"timestamp":"2026-03-25 11:07:40","status":500,"error":"Internal Server Error","path":"/api/v1/shopping"}
```
- **结果**: ❌ **失败** (系统错误)

---

## Test 7: 添加购物清单项

- **方法**: POST
- **路径**: /api/v1/shopping
- **认证**: 需要 (Bearer Token)
- **请求数据**:
```json
{
    "foodName": "测试购物项",
    "quantity": "2个",
    "category": "vegetable"
}
```
- **响应**:
```json
{"timestamp":"2026-03-25 11:07:41","status":500,"error":"Internal Server Error","path":"/api/v1/shopping"}
```
- **结果**: ❌ **失败** (系统错误)

---

## Test 8: 获取临期食材数量

- **方法**: GET
- **路径**: /api/v1/foods/expiring/count
- **认证**: 需要 (Bearer Token)
- **响应**:
```json
{"timestamp":"2026-03-25 11:07:42","status":500,"error":"Internal Server Error","path":"/api/v1/foods/expiring/count"}
```
- **结果**: ❌ **失败** (系统错误)

---

## Test 9: 获取收藏列表

- **方法**: GET
- **路径**: /api/v1/recipes/favorites
- **认证**: 需要 (Bearer Token)
- **响应**:
```json
{"timestamp":"2026-03-25 11:07:43","status":500,"error":"Internal Server Error","path":"/api/v1/recipes/favorites"}
```
- **结果**: ❌ **失败** (系统错误)

---

## Test 10: 收藏菜谱 (ID=1)

- **方法**: POST
- **路径**: /api/v1/recipes/1/favorite
- **认证**: 需要 (Bearer Token)
- **响应**:
```json
{"timestamp":"2026-03-25 11:07:44","status":500,"error":"Internal Server Error","path":"/api/v1/recipes/1/favorite"}
```
- **结果**: ❌ **失败** (系统错误)

---

# 📊 测试汇总

| 指标 | 数值 |
|------|------|
| 总测试数 | 10 |
| ✅ 通过 | 1 |
| ❌ 失败 | 9 |
| 📈 通过率 | 10.0% |

## ⚠️ 部分测试失败

请检查以下内容:
1. JWT Token 是否正确生成
2. 数据库连接是否正常
3. 接口权限配置是否正确

---

**测试完成时间**: Wed Mar 25 11:07:44 AM CST 2026
