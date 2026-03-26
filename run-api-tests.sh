#!/bin/bash

# 家庭食材菜谱小程序 - API 测试脚本
# 测试报告生成时间: $(date)

BASE_URL="http://localhost:8080"
REPORT_FILE="/root/.openclaw/workspace/food-recipe/test-report.md"

echo "# 家庭食材菜谱小程序 - API 测试报告" > $REPORT_FILE
echo "" >> $REPORT_FILE
echo "**测试时间**: $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "**服务地址**: $BASE_URL" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "---" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 测试计数器
TOTAL=0
PASSED=0
FAILED=0

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected=$5
    
    TOTAL=$((TOTAL + 1))
    
    echo "## Test $TOTAL: $name" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "- **接口**: $method $endpoint" >> $REPORT_FILE
    
    if [ -n "$data" ]; then
        echo "- **请求数据**: \`$data\`" >> $REPORT_FILE
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" 2>&1)
    fi
    
    echo "- **响应**:" >> $REPORT_FILE
    echo '```json' >> $REPORT_FILE
    echo "$response" | head -20 >> $REPORT_FILE
    echo '```' >> $REPORT_FILE
    
    if echo "$response" | grep -q "$expected"; then
        echo "- **结果**: ✅ **通过**" >> $REPORT_FILE
        PASSED=$((PASSED + 1))
    else
        echo "- **结果**: ❌ **失败** (期望包含: $expected)" >> $REPORT_FILE
        FAILED=$((FAILED + 1))
    fi
    
    echo "" >> $REPORT_FILE
    echo "---" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
}

echo "开始 API 测试..."

# 1. 测试首页/健康检查
echo "测试首页..."
test_api "首页/健康检查" "GET" "/" "" ""

# 2. 获取菜谱列表
echo "测试获取菜谱列表..."
test_api "获取菜谱列表" "GET" "/api/v1/recipes" "" "code"

# 3. 获取单个菜谱详情
echo "测试获取菜谱详情..."
test_api "获取菜谱详情 (ID=1)" "GET" "/api/v1/recipes/1" "" "code"

# 4. 获取食材列表
echo "测试获取食材列表..."
test_api "获取食材列表" "GET" "/api/v1/foods" "" "code"

# 5. 获取购物清单
echo "测试获取购物清单..."
test_api "获取购物清单" "GET" "/api/v1/shopping" "" "code"

# 6. 测试登录 (不带微信code，预期返回错误)
echo "测试登录接口..."
test_api "微信登录 (无code)" "POST" "/api/v1/auth/login" '{}' "code"

# 7. 测试添加食材 (未登录，预期返回401)
echo "测试添加食材..."
test_api "添加食材 (未登录)" "POST" "/api/v1/foods" '{"name":"测试食材","category":"vegetable","quantity":1,"unit":"个"}' "code"

# 8. 获取临期食材数量
echo "测试临期食材..."
test_api "获取临期食材数量" "GET" "/api/v1/foods/expiring/count" "" "code"

# 生成汇总
echo "" >> $REPORT_FILE
echo "# 测试汇总" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "| 指标 | 数值 |" >> $REPORT_FILE
echo "|------|------|" >> $REPORT_FILE
echo "| 总测试数 | $TOTAL |" >> $REPORT_FILE
echo "| 通过 | $PASSED |" >> $REPORT_FILE
echo "| 失败 | $FAILED |" >> $REPORT_FILE
echo "| 通过率 | $(echo "scale=2; $PASSED * 100 / $TOTAL" | bc)% |" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if [ $FAILED -eq 0 ]; then
    echo "## ✅ 所有测试通过!" >> $REPORT_FILE
else
    echo "## ⚠️ 部分测试失败，请检查 API 实现" >> $REPORT_FILE
fi

echo ""
echo "========================================"
echo "测试完成!"
echo "总测试: $TOTAL"
echo "通过: $PASSED"
echo "失败: $FAILED"
echo "报告保存至: $REPORT_FILE"
echo "========================================"
