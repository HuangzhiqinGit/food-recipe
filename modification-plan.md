# 家庭食材菜谱小程序 - 修改方案

## 📋 问题清单与修改方案

---

## 一、首页

### 1. 临期食材提醒点击后未自动过滤

**问题分析：**
- 首页 `goToFoodList()` 方法只跳转到食材列表页，没有传递筛选参数
- 食材列表页没有处理从首页传入的筛选参数

**修改方案：**

**文件: `pages/home/index.js`**
```javascript
// 修改 goToFoodList 方法，添加参数传递
goToFoodList() {
  // 如果有临期食材，传递筛选参数
  const filterExpiring = this.data.expiringCount > 0
  wx.switchTab({
    url: '/pages/food/list/index',
    success: () => {
      // 使用事件总线或全局数据传递筛选状态
      if (filterExpiring) {
        const app = getApp()
        app.globalData.foodFilter = { status: 'expiring' }
      }
    }
  })
}
```

**文件: `pages/food/list/index.js`**
```javascript
// 在 onShow 中检查全局筛选参数
onShow() {
  this.checkLogin()
  // 检查是否有从首页传入的筛选参数
  const app = getApp()
  if (app.globalData.foodFilter) {
    const filter = app.globalData.foodFilter
    this.setData({
      currentStatus: filter.status || 'all'
    })
    // 清除全局参数，避免重复触发
    app.globalData.foodFilter = null
    this.loadFoodList()
  }
}
```

---

### 2. 今日菜谱推荐优先展示收藏，默认6个

**问题分析：**
- 当前代码请求参数是 `{ limit: 4 }`，只展示4个
- 没有优先获取收藏的菜谱

**修改方案：**

**文件: `pages/home/index.js`**
```javascript
// 修改 loadRecommendRecipes 方法
async loadRecommendRecipes() {
  try {
    // 先尝试获取收藏的菜谱
    let recipes = []
    const favRes = await recipeService.getRecipeList({ 
      isFavorite: true, 
      limit: 6 
    })
    const favorites = favRes.data?.list || []
    
    // 如果收藏不足6个，补充推荐菜谱
    if (favorites.length < 6) {
      const recommendRes = await recipeService.getRecipeList({ 
        limit: 6 - favorites.length 
      })
      const recommends = recommendRes.data?.list || []
      // 合并，去重（避免收藏也在推荐中）
      const favIds = favorites.map(f => f.id)
      const uniqueRecommends = recommends.filter(r => !favIds.includes(r.id))
      recipes = [...favorites, ...uniqueRecommends]
    } else {
      recipes = favorites.slice(0, 6)
    }
    
    this.setData({
      recommendRecipes: recipes
    })
  } catch (error) {
    console.error('获取推荐菜谱失败:', error)
  }
}
```

---

## 二、食材页面

### 1. 筛选条件没有生效

**问题分析：**
- `selectStatus` 方法设置了 `currentStatus` 但调用 `loadFoodList()` 时，没有把 status 传给后端
- 后端需要接收 `status` 参数进行筛选

**修改方案：**

**文件: `pages/food/list/index.js`**
```javascript
// 修改 loadFoodList 方法，添加 status 筛选
async loadFoodList() {
  try {
    const params = {}
    if (this.data.currentCategory !== 'all') {
      params.category = this.data.currentCategory
    }
    // 添加状态筛选参数
    if (this.data.currentStatus !== 'all') {
      params.status = this.data.currentStatus
    }
    if (this.data.keyword) {
      params.keyword = this.data.keyword
    }

    const res = await foodService.getFoodList(params)
    let list = res.data?.list || []
    
    // 前端状态筛选（如果后端不支持，前端兜底）
    if (this.data.currentStatus !== 'all' && !params.status) {
      list = this.filterByStatus(list, this.data.currentStatus)
    }
    
    // ... 其余代码保持不变
  } catch (error) {
    console.error('获取食材列表失败:', error)
  }
},

// 添加前端状态筛选方法
filterByStatus(list, status) {
  const now = new Date()
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  
  return list.filter(item => {
    if (!item.expireDate) return status === 'fresh'
    const expireDate = new Date(item.expireDate)
    
    switch(status) {
      case 'fresh':
        return expireDate > threeDaysLater
      case 'expiring':
        return expireDate <= threeDaysLater && expireDate >= now
      case 'expired':
        return expireDate < now
      default:
        return true
    }
  })
}
```

---

### 2. 上传图片没有生效

**问题分析：**
- 需要检查 `uploadService.uploadImage` 方法实现
- 可能是后端上传接口地址或参数问题

**修改方案：**

**文件: `services/uploadService.js`**
```javascript
const uploadService = {
  // 上传图片
  uploadImage(filePath, type = 'food') {
    return new Promise((resolve, reject) => {
      const app = getApp()
      const token = app.globalData.token
      
      wx.uploadFile({
        url: `${BASE_URL}/upload/image`, // 确认后端接口地址
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        formData: {
          type: type // food 或 recipe
        },
        success: (res) => {
          const data = JSON.parse(res.data)
          resolve(data)
        },
        fail: reject
      })
    })
  }
}
```

**后端检查:**
- 确认 `/upload/image` 接口存在
- 确认接口支持 multipart/form-data
- 确认返回格式符合预期 `{ code: 200, data: { url: 'xxx' } }`

---

### 3. 扫描录入排版优化

**优化方案：**
- 采用卡片式布局，视觉层次更清晰
- 添加动画效果提升体验
- 使用渐变色增加视觉吸引力
- 优化图标和文字比例

**文件: `pages/food/edit/index.wxml` 扫描区域**
```html
<!-- 扫描录入优化 -->
<view class="scan-section" wx:if="{{!isEdit}}">
  <view class="scan-card" bindtap="scanFood">
    <view class="scan-icon-wrap">
      <text class="scan-icon">📷</text>
    </view>
    <view class="scan-content">
      <text class="scan-title">扫描录入</text>
      <text class="scan-desc">拍照识别食材信息，快速添加</text>
    </view>
    <view class="scan-arrow">
      <text class="arrow-icon">›</text>
    </view>
  </view>
</view>
```

**样式优化见下方静态页面预览**

---

### 4. 食材列表新鲜/临期标识优化

**优化方案：**
- 使用圆点 + 文字标签组合
- 不同状态使用不同颜色
  - 新鲜：绿色渐变
  - 临期：橙色渐变  
  - 过期：红色渐变
- 添加过期倒计时显示

**文件: `pages/food/list/index.wxml`**
```html
<!-- 食材卡片状态标识优化 -->
<view class="food-status">
  <view class="status-badge status-{{item.status}}">
    <text class="status-dot"></text>
    <text class="status-text">{{item.statusText}}</text>
  </view>
  <text class="expire-countdown" wx:if="{{item.expireDate && item.status !== 'expired'}}">
    {{item.expireCountdown}}
  </text>
</view>
```

---

## 三、菜谱页面

### 1. 添加按钮样式优化

**优化方案：**
- 使用悬浮按钮（FAB）设计
- 添加阴影和渐变效果
- 使用更大的点击区域
- 添加微交互动画

**文件: `pages/recipe/list/index.wxml`**
```html
<!-- 悬浮添加按钮 -->
<view class="fab-btn" bindtap="goToAddRecipe">
  <view class="fab-inner">
    <text class="fab-icon">+</text>
  </view>
</view>
```

---

### 2. 添加页面取消按钮无响应

**问题分析：**
- `onCancel` 方法调用了 `wx.navigateBack()` 
- 如果页面是直接进入的（没有上一页），会无响应

**修改方案：**

**文件: `pages/recipe/add/index.js`**
```javascript
// 修改 onCancel 方法
onCancel() {
  // 获取页面栈
  const pages = getCurrentPages()
  
  if (pages.length > 1) {
    // 有上一页，正常返回
    wx.navigateBack()
  } else {
    // 没有上一页，跳转到菜谱列表
    wx.switchTab({
      url: '/pages/recipe/list/index'
    })
  }
}
```

---

## 四、我的页面

### 1. 展示用户名

**问题分析：**
- 当前只展示了昵称，用户名需要后端支持
- 或者直接用微信昵称作为用户名显示

**修改方案：**

**文件: `pages/user/index.wxml`**
```html
<view class="user-info">
  <text class="user-name">{{userInfo.nickname || '微信用户'}}</text>
  <text class="user-username" wx:if="{{userInfo.username}}">@{{userInfo.username}}</text>
  <text class="user-id">ID: {{userInfo.id || '--'}}</text>
</view>
```

---

### 2. 头像支持上传修改

**修改方案：**

**文件: `pages/user/index.wxml`**
```html
<view class="user-card">
  <view class="avatar-wrap" bindtap="changeAvatar">
    <image class="user-avatar" src="{{userInfo.avatarUrl || '/assets/images/default-avatar.png'}}" mode="aspectFill"/>
    <view class="avatar-mask">
      <text class="avatar-edit-icon">📷</text>
    </view>
  </view>
  <view class="user-info">
    <text class="user-name">{{userInfo.nickname || '微信用户'}}</text>
    <text class="user-id">ID: {{userInfo.id || '--'}}</text>
  </view>
</view>
```

**文件: `pages/user/index.js`**
```javascript
// 添加修改头像方法
changeAvatar() {
  wx.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFiles[0].tempFilePath
      
      wx.showLoading({ title: '上传中...' })
      
      try {
        const uploadService = require('../../services/uploadService')
        const result = await uploadService.uploadImage(tempFilePath, 'avatar')
        
        if (result.code === 200 && result.data) {
          const newAvatarUrl = result.data.url
          
          // 更新本地数据
          const userInfo = { ...this.data.userInfo, avatarUrl: newAvatarUrl }
          this.setData({ userInfo })
          
          // 更新全局数据
          const app = getApp()
          app.globalData.userInfo = userInfo
          
          // 调用后端更新用户信息
          await this.updateUserInfo({ avatarUrl: newAvatarUrl })
          
          wx.showToast({ title: '头像更新成功', icon: 'success' })
        }
      } catch (error) {
        console.error('上传头像失败:', error)
        wx.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        wx.hideLoading()
      }
    }
  })
},

// 更新用户信息
async updateUserInfo(data) {
  // 调用后端接口更新用户信息
  // 需要后端添加 /user/update 接口
}
```

---

### 3. 微信一键登录保存微信名和头像

**修改方案：**

**文件: `pages/user/index.js`**
```javascript
// 修改 wxLogin 和 doLogin 方法
wxLogin() {
  wx.showLoading({ title: '登录中...', mask: true })
  
  wx.login({
    success: (loginRes) => {
      if (!loginRes.code) {
        wx.hideLoading()
        wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
        return
      }
      
      // 先获取用户信息
      this.getWxUserProfile(loginRes.code)
    },
    fail: (err) => {
      console.error('wx.login 失败:', err)
      wx.hideLoading()
      wx.showToast({ title: '登录失败', icon: 'none' })
    }
  })
},

// 获取微信用户信息
getWxUserProfile(code) {
  wx.getUserProfile({
    desc: '用于完善用户资料',
    success: (res) => {
      const wxUserInfo = res.userInfo
      this.doLogin(code, wxUserInfo)
    },
    fail: () => {
      // 用户拒绝授权，使用默认信息登录
      this.doLogin(code, { nickName: '微信用户', avatarUrl: '' })
    }
  })
},

// 执行登录请求
doLogin(code, wxUserInfo) {
  const data = {
    code: code,
    nickname: wxUserInfo.nickName,
    avatarUrl: wxUserInfo.avatarUrl
  }
  
  authService.login(data)
    .then((loginData) => {
      if (!loginData || loginData.code !== 200) {
        throw new Error(loginData?.message || '登录失败')
      }
      
      // 保存登录状态
      app.setLoginStatus(loginData.data.token, loginData.data.userInfo)
      
      wx.hideLoading()
      showSuccess('登录成功')
      this.checkLoginStatus()
    })
    .catch((error) => {
      console.error('登录失败:', error)
      wx.hideLoading()
      wx.showToast({ title: error.message || '登录失败', icon: 'none' })
    })
}
```

**后端修改:**
- 登录接口接收 `nickname` 和 `avatarUrl` 参数
- 保存到 user 表中

---

## 🎨 样式优化汇总

详见 `optimized-pages.html` 静态页面预览文件，包含：

1. **首页** - 优化后的推荐菜谱卡片、临期提醒样式
2. **食材页** - 筛选标签、扫描录入卡片、食材列表状态标识
3. **菜谱页** - 悬浮添加按钮、菜谱卡片
4. **我的页** - 用户信息卡片、可编辑头像

所有优化后的样式都在静态页面中展示，可以先查看效果。
