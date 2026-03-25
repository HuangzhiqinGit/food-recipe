# 微信小程序优化方案 V2

## 一、首页优化方案

### 当前问题
首页样式与参考设计不符，缺少渐变头部和卡片式布局。

### 参考样式 (test-report.html)
- **头部**: 紫色渐变 `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **卡片**: 白色背景、圆角 20rpx、阴影效果
- **配色**: 主色紫(#667eea)、成功绿(#10b981)、警告橙(#f59e0b)

### 修改方案

#### 1. index.wxml 结构调整
```xml
<view class="container">
  <!-- 渐变头部 -->
  <view class="header">
    <view class="header-content">
      <text class="welcome-text">你好，{{userInfo.nickname || '美食家'}}！</text>
      <text class="welcome-subtext">今天想吃点啥？</text>
    </view>
  </view>

  <!-- 内容区域 - 卡片式 -->
  <view class="content">
    <!-- 临期提醒卡片 -->
    <view class="warning-card" wx:if="{{expiringCount > 0}}" bindtap="goToFoodList">
      <view class="warning-icon-wrap">
        <text class="warning-icon">⚠️</text>
      </view>
      <view class="warning-info">
        <text class="warning-title">临期食材提醒</text>
        <text class="warning-desc">有{{expiringCount}}个食材即将过期</text>
      </view>
      <text class="warning-arrow">›</text>
    </view>

    <view class="safe-card" wx:else>
      <text class="safe-icon">✅</text>
      <text class="safe-text">暂无临期食材，放心做饭～</text>
    </view>

    <!-- 今日菜谱推荐 -->
    <view class="recipe-section">
      <view class="section-header">
        <text class="section-title">今日菜谱推荐</text>
        <text class="refresh-btn" bindtap="refreshRecipes">换一批 ›</text>
      </view>

      <view class="recipe-grid">
        <view class="recipe-card" wx:for="{{recommendRecipes}}" wx:key="id"
              bindtap="goToRecipeDetail" data-id="{{item.id}}">
          <image class="recipe-image" src="{{item.coverImage || item.images[0] || '/assets/images/default-recipe.png'}}" mode="aspectFill"/>
          <view class="recipe-content">
            <text class="recipe-name">{{item.name}}</text>
            <view class="recipe-tags">
              <text class="tag tag-primary">{{item.typeName}}</text>
              <text class="tag tag-accent">{{item.durationName}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</view>
```

#### 2. index.wxss 样式优化
- 添加渐变头部区域 (200rpx 高度)
- 白色内容卡片 (margin-top: -40rpx 实现重叠效果)
- 圆角 24rpx、阴影 `0 4rpx 20rpx rgba(0,0,0,0.08)`
- 标签使用渐变背景

---

## 二、食材页添加按钮优化

### 当前问题
添加按钮样式普通，缺少视觉吸引力。

### 修改方案
将添加按钮改为悬浮 FAB 按钮，与菜谱页保持一致：

#### 1. index.wxml 修改
移除顶部栏的添加按钮，改为底部悬浮按钮：
```xml
<!-- 移除原来的添加按钮 -->
<!-- 在 container 末尾添加 -->
<view class="fab-btn" bindtap="goToAddFood">
  <view class="fab-inner">
    <text class="fab-icon">+</text>
  </view>
</view>
```

#### 2. index.wxss 添加 FAB 样式
```css
.fab-btn {
  position: fixed;
  bottom: 120rpx;
  right: 40rpx;
  width: 112rpx;
  height: 112rpx;
  z-index: 100;
}

.fab-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 40rpx rgba(102, 126, 234, 0.5);
}

.fab-icon {
  color: #fff;
  font-size: 56rpx;
  font-weight: 200;
}
```

---

## 三、我的页面优化方案

### 当前问题
1. 样式与参考设计不符
2. 头像不支持上传
3. 微信登录没有保存昵称和头像

### 修改方案

#### 1. index.wxml 结构调整
```xml
<view class="container">
  <!-- 未登录状态 -->
  <view class="login-section" wx:if="{{!isLogin}}">
    <view class="login-header">
      <text class="login-title">👋 欢迎使用</text>
      <text class="login-desc">登录后可管理食材、收藏菜谱</text>
    </view>
    <view class="login-card">
      <view class="btn-login" bindtap="wxLogin" hover-class="btn-hover">
        <text class="btn-login-icon">🚀</text>
        <text class="btn-login-text">微信一键登录</text>
      </view>
      <text class="login-tip">新用户自动注册</text>
    </view>
  </view>

  <!-- 已登录状态 -->
  <block wx:else>
    <!-- 渐变头部 -->
    <view class="user-header">
      <view class="user-header-content">
        <!-- 头像可点击上传 -->
        <view class="avatar-wrap" bindtap="changeAvatar">
          <image class="user-avatar" src="{{userInfo.avatarUrl || '/assets/images/default-avatar.png'}}" mode="aspectFill"/>
          <view class="avatar-mask">
            <text class="avatar-edit">📷</text>
          </view>
        </view>
        <view class="user-info">
          <text class="user-name">{{userInfo.nickname || '微信用户'}}</text>
          <text class="user-username">@{{userInfo.username || userInfo.nickname || 'user'}}</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content">
      <!-- 数据统计卡片 -->
      <view class="stats-card">
        <view class="stats-item" bindtap="goToFoodList">
          <text class="stats-number">{{stats.foodCount}}</text>
          <text class="stats-label">食材</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item" bindtap="goToRecipeList">
          <text class="stats-number">{{stats.recipeCount}}</text>
          <text class="stats-label">菜谱</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item" bindtap="goToFavorites">
          <text class="stats-number">{{stats.favoriteCount}}</text>
          <text class="stats-label">收藏</text>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="menu-card">
        <view class="menu-item" bindtap="goToFoodList">
          <view class="menu-icon-wrap" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);">
            <text class="menu-icon">🥬</text>
          </view>
          <text class="menu-text">我的食材</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" bindtap="goToRecipeList">
          <view class="menu-icon-wrap" style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);">
            <text class="menu-icon">📖</text>
          </view>
          <text class="menu-text">我的菜谱</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" bindtap="goToFavorites">
          <view class="menu-icon-wrap" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);">
            <text class="menu-icon">⭐</text>
          </view>
          <text class="menu-text">我的收藏</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="menu-card">
        <view class="menu-item" bindtap="goToShoppingList">
          <view class="menu-icon-wrap" style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);">
            <text class="menu-icon">🛒</text>
          </view>
          <text class="menu-text">购物清单</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="menu-card">
        <view class="menu-item" bindtap="showAbout">
          <view class="menu-icon-wrap" style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);">
            <text class="menu-icon">ℹ️</text>
          </view>
          <text class="menu-text">关于我们</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" bindtap="showFeedback">
          <view class="menu-icon-wrap" style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);">
            <text class="menu-icon">💬</text>
          </view>
          <text class="menu-text">意见反馈</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-wrap">
        <text class="logout-text" bindtap="logout">退出登录</text>
      </view>
    </view>
  </block>
</view>
```

#### 2. index.js 功能修改

**头像上传功能：**
```javascript
// 修改头像
changeAvatar() {
  wx.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFiles[0].tempFilePath
      wx.showLoading({ title: '上传中...' })
      
      try {
        const result = await uploadService.uploadImage(tempFilePath, 'avatar')
        if (result.code === 200 && result.data) {
          const newAvatarUrl = result.data.url
          const userInfo = { ...this.data.userInfo, avatarUrl: newAvatarUrl }
          this.setData({ userInfo })
          app.globalData.userInfo = userInfo
          // 调用后端更新
          await this.updateUserInfo({ avatarUrl: newAvatarUrl })
          wx.showToast({ title: '头像更新成功', icon: 'success' })
        }
      } catch (error) {
        wx.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        wx.hideLoading()
      }
    }
  })
}
```

**微信登录保存信息：**
```javascript
// 获取微信用户信息并登录
wxLogin() {
  wx.showLoading({ title: '登录中...', mask: true })
  
  wx.login({
    success: (loginRes) => {
      if (!loginRes.code) {
        wx.hideLoading()
        wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
        return
      }
      
      // 获取微信用户信息
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const wxUserInfo = res.userInfo
          this.doLogin(loginRes.code, wxUserInfo)
        },
        fail: () => {
          // 用户拒绝授权，使用默认信息
          this.doLogin(loginRes.code, { nickName: '微信用户', avatarUrl: '' })
        }
      })
    }
  })
}

// 执行登录
doLogin(code, wxUserInfo) {
  const data = {
    code: code,
    nickname: wxUserInfo.nickName,
    avatarUrl: wxUserInfo.avatarUrl
  }
  
  authService.login(data)
    .then((loginData) => {
      if (loginData.code === 200 && loginData.data.token) {
        app.setLoginStatus(loginData.data.token, loginData.data.userInfo)
        wx.hideLoading()
        wx.showToast({ title: '登录成功', icon: 'success' })
        this.checkLoginStatus()
      }
    })
    .catch((error) => {
      wx.hideLoading()
      wx.showToast({ title: error.message || '登录失败', icon: 'none' })
    })
}
```

---

## 四、修改文件清单

| 文件路径 | 修改类型 | 修改内容 |
|---------|---------|---------|
| `pages/home/index.wxml` | 修改 | 添加渐变头部，卡片式布局 |
| `pages/home/index.wxss` | 修改 | 紫色渐变、卡片阴影、标签样式 |
| `pages/food/list/index.wxml` | 修改 | 移除顶部添加按钮，改为FAB |
| `pages/food/list/index.wxss` | 修改 | 添加FAB悬浮按钮样式 |
| `pages/user/index.wxml` | 修改 | 渐变头部，头像上传，用户名显示 |
| `pages/user/index.wxss` | 修改 | 卡片式菜单，渐变图标背景 |
| `pages/user/index.js` | 修改 | 头像上传，微信登录保存信息 |

---

## 五、设计预览

静态预览页面已生成，包含三个页面的设计效果展示。
