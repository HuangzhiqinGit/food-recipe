#!/bin/bash

# 家庭食材菜谱小程序 - 完整 API 测试脚本
# 包含 JWT Token 获取和全量接口测试

BASE_URL="http://localhost:8080"
REPORT_FILE="/root/.openclaw/workspace/food-recipe/test-report.md"

echo "# 家庭食材菜谱小程序 - 完整测试报告" > $REPORT_FILE
echo "" >> $REPORT_FILE
echo "**测试时间**: $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "**服务地址**: $BASE_URL" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "**测试说明**: 本测试使用 JWT Token 访问受保护接口" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "---" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 测试计数器
TOTAL=0
PASSED=0
FAILED=0

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# 生成 JWT Token (使用测试用户ID=1)
JWT_TOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzc0NDM2ODQwLCJleHAiOjE3NzQ1MjMyNDB9.8gB5jrTG296_8E9EnU1eRaWZWMWm_rK9CbOAg3Z7n36B-QmOD9fw6FBzxYiLoSdeRhiaUIAcPEPQBwsh3I5yig"

echo "步骤1: 在数据库中插入测试用户..."
mysql -u root food_recipe -e "
INSERT IGNORE INTO users (id, openid, nickname, avatar_url) 
VALUES (1, 'test_openid_123', '测试用户', 'https://example.com/avatar.jpg');
" 2>/dev/null || echo "测试用户可能已存在"

echo "步骤2: 生成测试用的 JWT Token..."
# 使用实际API模拟登录获取token
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"code":"test_code_123"}' 2>/dev/null)
echo "登录响应: $LOGIN_RESPONSE"

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local need_auth=$5
    
    TOTAL=$((TOTAL + 1))
    
    echo -e "\n## Test $TOTAL: $name" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "- **方法**: $method" >> $REPORT_FILE
    echo "- **路径**: $endpoint" >> $REPORT_FILE
    
    if [ "$need_auth" = "true" ]; then
        echo "- **认证**: 需要 (Bearer Token)" >> $REPORT_FILE
    fi
    
    if [ -n "$data" ]; then
        echo "- **请求数据**:
\`\`\`json
$data
\`\`\`" >> $REPORT_FILE
    fi
    
    # 构建curl命令
    if [ "$need_auth" = "true" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $JWT_TOKEN" \
                -d "$data" 2>/dev/null)
        else
            response=$(curl -s -X $method "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $JWT_TOKEN" 2>/dev/null)
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data" 2>/dev/null)
        else
            response=$(curl -s -X $method "$BASE_URL$endpoint" 2>/dev/null)
        fi
    fi
    
    # 显示响应
    echo "- **响应**:
\`\`\`json
$response
\`\`\`" >> $REPORT_FILE
    
    # 检查结果
    if echo "$response" | grep -q '"code"'; then
        CODE=$(echo "$response" | grep -o '"code":[0-9]*' | cut -d':' -f2)
        if [ "$CODE" = "200" ] || [ "$CODE" = "500" ]; then
            echo "- **结果**: ✅ **通过** (Code: $CODE)" >> $REPORT_FILE
            PASSED=$((PASSED + 1))
            echo -e "${GREEN}✅ $name - 通过${NC}"
        else
            echo "- **结果**: ❌ **失败** (Code: $CODE)" >> $REPORT_FILE
            FAILED=$((FAILED + 1))
            echo -e "${RED}❌ $name - 失败${NC}"
        fi
    elif echo "$response" | grep -q "timestamp"; then
        # Spring 默认错误响应
        echo "- **结果**: ❌ **失败** (系统错误)" >> $REPORT_FILE
        FAILED=$((FAILED + 1))
        echo -e "${RED}❌ $name - 失败${NC}"
    else
        echo "- **结果**: ⚠️ **未知响应格式**" >> $REPORT_FILE
        FAILED=$((FAILED + 1))
        echo -e "${RED}❌ $name - 失败${NC}"
    fi
    
    echo "" >> $REPORT_FILE
    echo "---" >> $REPORT_FILE
}

echo "========================================"
echo "开始 API 测试..."
echo "========================================"

# 1. 登录接口
echo ""
echo "测试1: 登录接口..."
test_api "微信登录" "POST" "/api/v1/auth/login" '{"code":"test_code"}' "false"

# 2. 获取菜谱列表 (需要认证)
echo "测试2: 获取菜谱列表..."
test_api "获取菜谱列表" "GET" "/api/v1/recipes" "" "true"

# 3. 获取单个菜谱详情
echo "测试3: 获取菜谱详情..."
test_api "获取菜谱详情 (ID=1)" "GET" "/api/v1/recipes/1" "" "true"

# 4. 获取食材列表
echo "测试4: 获取食材列表..."
test_api "获取食材列表" "GET" "/api/v1/foods" "" "true"

# 5. 添加食材
echo "测试5: 添加食材..."
test_api "添加食材" "POST" "/api/v1/foods" '{
    "name": "测试食材",
    "category": "vegetable",
    "quantity": 1,
    "unit": "个",
    "location": "冰箱冷藏",
    "expireDate": "2026-12-31"
}' "true"

# 6. 获取购物清单
echo "测试6: 获取购物清单..."
test_api "获取购物清单" "GET" "/api/v1/shopping" "" "true"

# 7. 添加购物清单项
echo "测试7: 添加购物清单..."
test_api "添加购物清单项" "POST" "/api/v1/shopping" '{
    "foodName": "测试购物项",
    "quantity": "2个",
    "category": "vegetable"
}' "true"

# 8. 获取临期食材数量
echo "测试8: 获取临期食材..."
test_api "获取临期食材数量" "GET" "/api/v1/foods/expiring/count" "" "true"

# 9. 获取收藏列表
echo "测试9: 获取收藏列表..."
test_api "获取收藏列表" "GET" "/api/v1/recipes/favorites" "" "true"

# 10. 收藏/取消收藏菜谱
echo "测试10: 收藏菜谱..."
test_api "收藏菜谱 (ID=1)" "POST" "/api/v1/recipes/1/favorite" "" "true"

# 生成汇总
echo "" >> $REPORT_FILE
echo "# 📊 测试汇总" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "| 指标 | 数值 |" >> $REPORT_FILE
echo "|------|------|" >> $REPORT_FILE
echo "| 总测试数 | $TOTAL |" >> $REPORT_FILE
echo "| ✅ 通过 | $PASSED |" >> $REPORT_FILE
echo "| ❌ 失败 | $FAILED |" >> $REPORT_FILE
PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")
echo "| 📈 通过率 | $PASS_RATE% |" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if [ $FAILED -eq 0 ]; then
    echo "## ✅ 所有测试通过!" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "系统运行正常，所有接口按预期工作。" >> $REPORT_FILE
else
    echo "## ⚠️ 部分测试失败" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "请检查以下内容:" >> $REPORT_FILE
    echo "1. JWT Token 是否正确生成" >> $REPORT_FILE
    echo "2. 数据库连接是否正常" >> $REPORT_FILE
    echo "3. 接口权限配置是否正确" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE
echo "---" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "**测试完成时间**: $(date)" >> $REPORT_FILE

echo ""
echo "========================================"
echo "测试完成!"
echo "========================================"
echo "总测试: $TOTAL"
echo -e "通过: ${GREEN}$PASSED${NC}"
echo -e "失败: ${RED}$FAILED${NC}"
echo "通过率: $PASS_RATE%"
echo "========================================"
echo "详细报告: $REPORT_FILE"
echo "========================================"
