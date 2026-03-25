# 微信小程序前端开发技术实现方案

> 版本：v1.0  
> 框架：微信小程序原生框架  
> 适用场景：通用业务小程序开发

---

## 目录

1. [项目目录结构](#1-项目目录结构)
2. [技术选型](#2-技术选型)
3. [页面路由配置](#3-页面路由配置)
4. [核心组件设计](#4-核心组件设计)
5. [状态管理方案](#5-状态管理方案)
6. [API封装](#6-api封装)
7. [核心功能代码示例](#7-核心功能代码示例)
8. [性能优化策略](#8-性能优化策略)
9. [开发注意事项](#9-开发注意事项)

---

## 1. 项目目录结构

### 1.1 完整目录层级

```
mini-program-project/
├── app.js                      # 小程序入口文件
├── app.json                    # 全局配置
├── app.wxss                    # 全局样式
├── project.config.json         # 项目配置文件
├── project.private.config.json # 私有配置（不提交git）
├── sitemap.json                # 搜索索引配置
├── .eslintrc.js                # ESLint配置
├── .prettierrc                 # Prettier配置
├── package.json                # npm依赖
│
├── components/                 # 公共组件
│   ├── common/                 # 通用组件
│   │   ├── loading/
│   │   ├── empty/
│   │   ├── toast/
│   │   ├── modal/
│   │   ├── navbar/
│   │   └── safe-area/
│   ├── business/               # 业务组件
│   │   ├── product-card/
│   │   ├── order-item/
│   │   └── user-avatar/
│   └── form/                   # 表单组件
│       ├── form-input/
│       └── form-picker/
│
├── pages/                      # 页面目录
│   ├── index/                  # 首页
│   ├── category/               # 分类页
│   ├── cart/                   # 购物车
│   ├── user/                   # 个人中心
│   ├── login/                  # 登录页
│   ├── search/                 # 搜索页
│   ├── product/                # 商品详情
│   ├── order/                  # 订单相关
│   │   ├── list/
│   │   ├── detail/
│   │   └── confirm/
│   └── address/                # 地址管理
│       ├── list/
│       └── edit/
│
├── subpackages/                # 分包目录
│   ├── packageA/               # 功能分包A
│   │   └── pages/
│   └── packageB/               # 功能分包B
│       └── pages/
│
├── utils/                      # 工具函数
│   ├── request.js              # 网络请求封装
│   ├── storage.js              # 本地存储封装
│   ├── util.js                 # 通用工具
│   ├── validate.js             # 表单验证
│   ├── constants.js            # 常量定义
│   └── eventBus.js             # 事件总线
│
├── services/                   # 业务服务层
│   ├── userService.js          # 用户服务
│   ├── productService.js       # 商品服务
│   ├── orderService.js         # 订单服务
│   └── addressService.js       # 地址服务
│
├── behaviors/                  # 行为复用
│   ├── shareBehavior.js
│   └── pageBehavior.js
│
├── styles/                     # 样式资源
│   ├── variables.wxss          # CSS变量
│   ├── mixins.wxss             # 混入样式
│   └── common.wxss             # 公共样式
│
├── assets/                     # 静态资源
│   ├── images/                 # 图片资源
│   │   ├── icons/              # 图标
│   │   ├── banners/            # 轮播图
│   │   └── placeholders/       # 占位图
│   └── fonts/                  # 字体文件
│
├── miniprogram_npm/            # npm构建产物
└── node_modules/               # npm依赖
```

### 1.2 文件组织规范

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| 页面文件夹 | 小写+连字符 | `user-center/`, `order-list/` |
| 组件文件夹 | 小写+连字符 | `product-card/`, `loading-spinner/` |
| JS文件 | 小写+连字符 | `user-service.js`, `api-config.js` |
| 样式文件 | 与页面同名 | `index.wxss`, `index.wxml` |
| 图片资源 | 语义化命名 | `icon-home.png`, `banner-summer.jpg` |

### 1.3 模块划分说明

```
┌─────────────────────────────────────────────────────────────┐
│                        应用层 (App)                          │
├─────────────────────────────────────────────────────────────┤
│  页面层 (Pages)  │  组件层 (Components)  │  分包 (Subpackages) │
├─────────────────────────────────────────────────────────────┤
│                    业务服务层 (Services)                      │
├─────────────────────────────────────────────────────────────┤
│  网络请求  │  数据存储  │  工具函数  │  常量定义  │  事件总线  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 技术选型

### 2.1 原生小程序 vs 跨端框架对比

| 维度 | 微信小程序原生 | Taro 3.x | UniApp |
|------|---------------|----------|--------|
| **学习成本** | 低（官方文档） | 中（React/Vue语法） | 低（Vue语法） |
| **开发效率** | 中 | 高（组件复用） | 高（组件复用） |
| **性能表现** | 最优 | 接近原生 | 接近原生 |
| **包体积** | 最小 | 较大 | 较大 |
| **多端适配** | 不支持 | 支持（H5/APP等） | 支持（H5/APP等） |
| **生态支持** | 丰富 | 丰富 | 丰富 |
| **TS支持** | 良好 | 优秀 | 良好 |
| **调试体验** | 最佳 | 良好 | 良好 |

### 2.2 推荐方案

**推荐：微信小程序原生框架**

**理由：**

1. **性能最优**：无额外运行时开销，首屏加载最快
2. **包体积小**：无需携带框架运行时，更容易控制在2MB限制内
3. **调试便捷**：微信开发者工具原生支持，调试体验最佳
4. **官方特性**：第一时间支持微信新特性（如 skyline 渲染引擎）
5. **维护简单**：无框架升级依赖，长期维护成本低

**适用场景：**
- 纯微信小程序项目
- 对性能要求较高的项目
- 需要严格控制包体积的项目
- 团队对小程序原生开发熟悉

### 2.3 可选增强方案

```javascript
// 使用 MobX-miniprogram 增强状态管理
// npm install mobx-miniprogram mobx-miniprogram-bindings

// 使用 miniprogram-computed 支持计算属性
// npm install miniprogram-computed

// 使用 async/await 支持
// 原生已支持，无需额外配置
```

---

## 3. 页面路由配置

### 3.1 app.json 完整配置

```json
{
  "pages": [
    "pages/index/index",
    "pages/category/category",
    "pages/cart/cart",
    "pages/user/user",
    "pages/login/login",
    "pages/search/search",
    "pages/product/detail/detail",
    "pages/order/list/list",
    "pages/order/detail/detail",
    "pages/order/confirm/confirm",
    "pages/address/list/list",
    "pages/address/edit/edit"
  ],
  "subpackages": [
    {
      "root": "subpackages/packageA",
      "name": "packageA",
      "pages": [
        "pages/coupon/list/list",
        "pages/coupon/detail/detail"
      ]
    },
    {
      "root": "subpackages/packageB",
      "name": "packageB",
      "pages": [
        "pages/setting/index/index",
        "pages/setting/about/about"
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["packageA"]
    }
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#07c160",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "assets/images/icons/home.png",
        "selectedIconPath": "assets/images/icons/home-active.png"
      },
      {
        "pagePath": "pages/category/category",
        "text": "分类",
        "iconPath": "assets/images/icons/category.png",
        "selectedIconPath": "assets/images/icons/category-active.png"
      },
      {
        "pagePath": "pages/cart/cart",
        "text": "购物车",
        "iconPath": "assets/images/icons/cart.png",
        "selectedIconPath": "assets/images/icons/cart-active.png"
      },
      {
        "pagePath": "pages/user/user",
        "text": "我的",
        "iconPath": "assets/images/icons/user.png",
        "selectedIconPath": "assets/images/icons/user-active.png"
      }
    ]
  },
  "window": {
    "navigationBarTitleText": "小程序",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f5f5f5",
    "backgroundTextStyle": "dark",
    "enablePullDownRefresh": false,
    "onReachBottomDistance": 50
  },
  "usingComponents": {
    "loading": "./components/common/loading/loading",
    "empty": "./components/common/empty/empty",
    "toast": "./components/common/toast/toast",
    "modal": "./components/common/modal/modal",
    "navbar": "./components/common/navbar/navbar"
  },
  "permission": {
    "scope.userLocation": {
      "desc": "您的位置信息将用于小程序位置接口的效果展示"
    }
  },
  "requiredBackgroundModes": ["audio"],
  "lazyCodeLoading": "requiredComponents",
  "renderer": "skyline",
  "rendererOptions": {
    "skyline": {
      "defaultDisplayBlock": true,
      "disableABTest": true
    }
  }
}
```

### 3.2 路由设计规范

```javascript
// utils/router.js - 路由管理
const routes = {
  // 首页
  INDEX: '/pages/index/index',
  
  // 商品相关
  PRODUCT_DETAIL: '/pages/product/detail/detail',
  PRODUCT_LIST: '/pages/product/list/list',
  
  // 订单相关
  ORDER_LIST: '/pages/order/list/list',
  ORDER_DETAIL: '/pages/order/detail/detail',
  ORDER_CONFIRM: '/pages/order/confirm/confirm',
  
  // 用户相关
  USER_CENTER: '/pages/user/user',
  LOGIN: '/pages/login/login',
  
  // 分包路由
  COUPON_LIST: '/subpackages/packageA/pages/coupon/list/list',
  SETTING: '/subpackages/packageB/pages/setting/index/index'
};

// 页面跳转封装
const router = {
  // 保留当前页面，跳转到新页面
  navigateTo(url, params = {}) {
    const queryString = this._buildQuery(params);
    wx.navigateTo({
      url: `${url}${queryString}`
    });
  },
  
  // 关闭当前页面，跳转到新页面
  redirectTo(url, params = {}) {
    const queryString = this._buildQuery(params);
    wx.redirectTo({
      url: `${url}${queryString}`
    });
  },
  
  // 跳转到TabBar页面
  switchTab(url) {
    wx.switchTab({ url });
  },
  
  // 关闭所有页面，打开新页面
  reLaunch(url, params = {}) {
    const queryString = this._buildQuery(params);
    wx.reLaunch({
      url: `${url}${queryString}`
    });
  },
  
  // 返回上一页面
  navigateBack(delta = 1) {
    wx.navigateBack({ delta });
  },
  
  // 构建查询字符串
  _buildQuery(params) {
    const keys = Object.keys(params);
    if (keys.length === 0) return '';
    
    const query = keys.map(key => {
      const value = typeof params[key] === 'object' 
        ? JSON.stringify(params[key]) 
        : params[key];
      return `${key}=${encodeURIComponent(value)}`;
    }).join('&');
    
    return `?${query}`;
  }
};

module.exports = { routes, router };
```

### 3.3 使用示例

```javascript
// pages/index/index.js
const { routes, router } = require('../../utils/router');

Page({
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    router.navigateTo(routes.PRODUCT_DETAIL, { id });
  },
  
  goToUserCenter() {
    router.switchTab(routes.USER_CENTER);
  },
  
  goToLogin() {
    router.redirectTo(routes.LOGIN);
  }
});
```

---

## 4. 核心组件设计

### 4.1 公共组件列表

| 组件名 | 用途 | 复杂度 | 文件位置 |
|--------|------|--------|----------|
| `loading` | 加载动画 | 低 | `components/common/loading/` |
| `empty` | 空状态展示 | 低 | `components/common/empty/` |
| `toast` | 轻提示 | 中 | `components/common/toast/` |
| `modal` | 弹窗对话框 | 中 | `components/common/modal/` |
| `navbar` | 自定义导航栏 | 高 | `components/common/navbar/` |
| `safe-area` | 安全区域适配 | 低 | `components/common/safe-area/` |
| `image-loader` | 图片懒加载 | 中 | `components/common/image-loader/` |
| `skeleton` | 骨架屏 | 中 | `components/common/skeleton/` |
| `sticky` | 吸顶容器 | 中 | `components/common/sticky/` |
| `waterfall` | 瀑布流布局 | 高 | `components/common/waterfall/` |

### 4.2 组件设计规范

#### 4.2.1 Loading 组件

```javascript
// components/common/loading/loading.js
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  
  properties: {
    // 加载状态
    loading: {
      type: Boolean,
      value: false
    },
    // 加载类型: spinner / dots / circle
    type: {
      type: String,
      value: 'spinner'
    },
    // 提示文字
    text: {
      type: String,
      value: '加载中...'
    },
    // 是否全屏
    fullscreen: {
      type: Boolean,
      value: false
    },
    // 背景色
    background: {
      type: String,
      value: 'rgba(255, 255, 255, 0.9)'
    }
  },
  
  data: {
    // 内部数据
  },
  
  methods: {
    // 阻止冒泡
    preventTouchMove() {
      return false;
    }
  }
});
```

```html
<!-- components/common/loading/loading.wxml -->
<view 
  class="loading-container {{fullscreen ? 'fullscreen' : ''}}"
  style="background: {{background}}"
  wx:if="{{loading}}"
  catchtouchmove="preventTouchMove"
>
  <view class="loading-content">
    <view class="loading-spinner loading-{{type}}">
      <view class="spinner-item" wx:for="{{4}}" wx:key="index"></view>
    </view>
    <text class="loading-text" wx:if="{{text}}">{{text}}</text>
    <slot name="extra"></slot>
  </view>
</view>
```

```css
/* components/common/loading/loading.wxss */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Spinner 动画 */
.loading-spinner {
  position: relative;
  width: 60rpx;
  height: 60rpx;
}

.spinner-item {
  position: absolute;
  width: 100%;
  height: 100%;
  animation: spinner-rotate 1.2s linear infinite;
}

.spinner-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 8rpx;
  height: 8rpx;
  margin-left: -4rpx;
  background: #07c160;
  border-radius: 50%;
}

.spinner-item:nth-child(1) { animation-delay: -1.2s; }
.spinner-item:nth-child(2) { animation-delay: -1.05s; }
.spinner-item:nth-child(3) { animation-delay: -0.9s; }
.spinner-item:nth-child(4) { animation-delay: -0.75s; }

@keyframes spinner-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}
```

#### 4.2.2 Toast 组件

```javascript
// components/common/toast/toast.js
Component({
  options: {
    addGlobalClass: true
  },
  
  properties: {
    // 是否显示
    visible: {
      type: Boolean,
      value: false
    },
    // 提示类型: success / error / loading / none
    type: {
      type: String,
      value: 'none'
    },
    // 提示文字
    message: {
      type: String,
      value: ''
    },
    // 显示时长(ms)
    duration: {
      type: Number,
      value: 2000
    },
    // 是否显示遮罩
    mask: {
      type: Boolean,
      value: false
    }
  },
  
  data: {
    timer: null
  },
  
  observers: {
    'visible': function(visible) {
      if (visible && this.data.duration > 0) {
        this._startTimer();
      }
    }
  },
  
  methods: {
    _startTimer() {
      this._clearTimer();
      this.data.timer = setTimeout(() => {
        this.hide();
      }, this.data.duration);
    },
    
    _clearTimer() {
      if (this.data.timer) {
        clearTimeout(this.data.timer);
        this.data.timer = null;
      }
    },
    
    hide() {
      this._clearTimer();
      this.setData({ visible: false });
      this.triggerEvent('close');
    },
    
    // 快捷方法
    show(options = {}) {
      const { type = 'none', message = '', duration = 2000, mask = false } = options;
      this.setData({
        visible: true,
        type,
        message,
        duration,
        mask
      });
    }
  },
  
  detached() {
    this._clearTimer();
  }
});
```

```html
<!-- components/common/toast/toast.wxml -->
<view 
  class="toast-container {{visible ? 'show' : ''}}"
  wx:if="{{visible}}"
  catchtouchmove="preventTouchMove"
>
  <view class="toast-mask" wx:if="{{mask}}"></view>
  <view class="toast-content toast-{{type}}">
    <view class="toast-icon" wx:if="{{type !== 'none'}}">
      <image wx:if="{{type === 'success'}}" src="/assets/images/icons/success.png" />
      <image wx:if="{{type === 'error'}}" src="/assets/images/icons/error.png" />
      <view class="loading-spinner" wx:if="{{type === 'loading'}}"></view>
    </view>
    <text class="toast-message">{{message}}</text>
  </view>
</view>
```

### 4.3 组件通信方案

```javascript
// 方案1: 父传子 - Properties
// 父组件
<child-component title="{{pageTitle}}" count="{{itemCount}}" />

// 子组件
Component({
  properties: {
    title: String,
    count: {
      type: Number,
      value: 0,
      observer(newVal, oldVal) {
        console.log('count changed:', oldVal, '->', newVal);
      }
    }
  }
});

// 方案2: 子传父 - TriggerEvent
// 子组件
Component({
  methods: {
    onTap() {
      this.triggerEvent('customEvent', { 
        data: 'some data',
        timestamp: Date.now()
      }, {
        bubbles: true,      // 事件冒泡
        composed: true,     // 跨越组件边界
        capturePhase: false // 捕获阶段
      });
    }
  }
});

// 父组件
<child-component bind:customEvent="handleCustomEvent" />

// 方案3: 全局事件总线
// utils/eventBus.js
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  off(event, callback) {
    if (!this.events[event]) return;
    if (!callback) {
      delete this.events[event];
      return;
    }
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (e) {
        console.error('Event callback error:', e);
      }
    });
  }
  
  once(event, callback) {
    const onceCallback = (...args) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    this.on(event, onceCallback);
  }
}

module.exports = new EventBus();

// 使用示例
const eventBus = require('../../utils/eventBus');

// 订阅事件
eventBus.on('userLogin', (userInfo) => {
  console.log('用户登录:', userInfo);
});

// 发布事件
eventBus.emit('userLogin', { name: '张三', id: 123 });

// 方案4: 页面间通信
// 页面A
wx.navigateTo({
  url: '/pages/pageB/pageB',
  events: {
    // 监听页面B返回的数据
    acceptDataFromPageB(data) {
      console.log('收到页面B数据:', data);
    }
  },
  success(res) {
    // 向页面B发送数据
    res.eventChannel.emit('acceptDataFromPageA', { from: 'pageA' });
  }
});

// 页面B
Page({
  onLoad() {
    const eventChannel = this.getOpenerEventChannel();
    // 监听页面A发送的数据
    eventChannel.on('acceptDataFromPageA', (data) => {
      console.log('收到页面A数据:', data);
    });
  },
  
  goBack() {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('acceptDataFromPageB', { from: 'pageB' });
    wx.navigateBack();
  }
});
```

---

## 5. 状态管理方案

### 5.1 全局状态管理设计

```javascript
// stores/index.js - 全局状态管理
const { observable, action } = require('mobx-miniprogram');

// 用户状态
const userStore = observable({
  // 状态
  isLogin: false,
  userInfo: null,
  token: '',
  
  // 计算属性
  get isVip() {
    return this.userInfo?.vipLevel > 0;
  },
  
  get displayName() {
    return this.userInfo?.nickName || '未登录';
  },
  
  // Action
  setUserInfo: action(function(info) {
    this.userInfo = info;
    this.isLogin = !!info;
  }),
  
  setToken: action(function(token) {
    this.token = token;
  }),
  
  logout: action(function() {
    this.isLogin = false;
    this.userInfo = null;
    this.token = '';
  })
});

// 购物车状态
const cartStore = observable({
  items: [],
  
  get totalCount() {
    return this.items.reduce((sum, item) => sum + item.count, 0);
  },
  
  get totalPrice() {
    return this.items.reduce((sum, item) => sum + item.price * item.count, 0);
  },
  
  get selectedItems() {
    return this.items.filter(item => item.selected);
  },
  
  addItem: action(function(item) {
    const exist = this.items.find(i => i.id === item.id);
    if (exist) {
      exist.count += item.count;
    } else {
      this.items.push({ ...item, selected: true });
    }
  }),
  
  removeItem: action(function(id) {
    const index = this.items.findIndex(i => i.id === id);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  }),
  
  updateItemCount: action(function(id, count) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.count = Math.max(1, count);
    }
  }),
  
  toggleSelect: action(function(id) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.selected = !item.selected;
    }
  }),
  
  selectAll: action(function(selected) {
    this.items.forEach(item => {
      item.selected = selected;
    });
  }),
  
  clear: action(function() {
    this.items = [];
  })
});

// 系统状态
const systemStore = observable({
  networkType: 'unknown',
  isConnected: true,
  systemInfo: null,
  
  setNetworkInfo: action(function(info) {
    this.networkType = info.networkType;
    this.isConnected = info.isConnected;
  }),
  
  setSystemInfo: action(function(info) {
    this.systemInfo = info;
  })
});

module.exports = {
  userStore,
  cartStore,
  systemStore
};
```

### 5.2 页面绑定状态

```javascript
// pages/cart/cart.js
const { createStoreBindings } = require('mobx-miniprogram-bindings');
const { cartStore, userStore } = require('../../stores/index');

Page({
  data: {
    localData: 'page local data'
  },
  
  onLoad() {
    // 绑定 store 到页面
    this.storeBindings = createStoreBindings(this, {
      store: cartStore,
      fields: ['items', 'totalCount', 'totalPrice', 'selectedItems'],
      actions: ['addItem', 'removeItem', 'toggleSelect', 'selectAll']
    });
  },
  
  onUnload() {
    this.storeBindings.destroyStoreBindings();
  },
  
  // 使用 store 中的 action
  onAddToCart(e) {
    const { item } = e.currentTarget.dataset;
    this.addItem(item);
  },
  
  onRemoveItem(e) {
    const { id } = e.currentTarget.dataset;
    this.removeItem(id);
  },
  
  onToggleSelect(e) {
    const { id } = e.currentTarget.dataset;
    this.toggleSelect(id);
  },
  
  onSelectAll(e) {
    const { checked } = e.detail;
    this.selectAll(checked);
  }
});
```

### 5.3 Storage 缓存策略

```javascript
// utils/storage.js - 本地存储封装
const storage = {
  // 存储前缀，防止key冲突
  prefix: 'mp_',
  
  // 设置缓存
  set(key, value, expire = 0) {
    const data = {
      value,
      expire: expire > 0 ? Date.now() + expire * 1000 : 0,
      timestamp: Date.now()
    };
    try {
      wx.setStorageSync(this.prefix + key, data);
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },
  
  // 获取缓存
  get(key, defaultValue = null) {
    try {
      const data = wx.getStorageSync(this.prefix + key);
      if (!data) return defaultValue;
      
      // 检查是否过期
      if (data.expire > 0 && Date.now() > data.expire) {
        this.remove(key);
        return defaultValue;
      }
      
      return data.value;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  },
  
  // 移除缓存
  remove(key) {
    try {
      wx.removeStorageSync(this.prefix + key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },
  
  // 清空缓存
  clear() {
    try {
      wx.clearStorageSync();
      return true;
    } catch (e) {
      console.error('Storage clear error:', e);
      return false;
    }
  },
  
  // 获取缓存信息
  info() {
    return wx.getStorageInfoSync();
  },
  
  // 批量设置
  setBatch(items, expire = 0) {
    Object.keys(items).forEach(key => {
      this.set(key, items[key], expire);
    });
  },
  
  // 批量获取
  getBatch(keys) {
    const result = {};
    keys.forEach(key => {
      result[key] = this.get(key);
    });
    return result;
  }
};

// 用户相关存储
const userStorage = {
  // Token
  setToken(token) {
    return storage.set('token', token, 7 * 24 * 60 * 60); // 7天
  },
  getToken() {
    return storage.get('token', '');
  },
  
  // 用户信息
  setUserInfo(info) {
    return storage.set('userInfo', info, 7 * 24 * 60 * 60);
  },
  getUserInfo() {
    return storage.get('userInfo', null);
  },
  
  // 搜索历史
  addSearchHistory(keyword) {
    let history = this.getSearchHistory();
    history = history.filter(item => item !== keyword);
    history.unshift(keyword);
    history = history.slice(0, 20); // 最多20条
    return storage.set('searchHistory', history);
  },
  getSearchHistory() {
    return storage.get('searchHistory', []);
  },
  clearSearchHistory() {
    return storage.remove('searchHistory');
  }
};

module.exports = { storage, userStorage };
```

---

## 6. API封装

### 6.1 网络请求封装

```javascript
// utils/request.js - 网络请求封装
const { userStorage } = require('./storage');
const { API_BASE_URL, TIMEOUT, RETRY_COUNT } = require('./constants');

// 请求队列（用于取消请求）
const requestQueue = new Map();
let requestId = 0;

// 请求封装
const request = (options) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      timeout = TIMEOUT,
      retry = 0,
      loading = false,
      loadingText = '加载中...',
      needToken = true,
      needSign = false
    } = options;
    
    // 生成请求ID
    const currentRequestId = ++requestId;
    
    // 显示加载
    if (loading) {
      wx.showLoading({ title: loadingText, mask: true });
    }
    
    // 构建请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    };
    
    // 添加Token
    if (needToken) {
      const token = userStorage.getToken();
      if (token) {
        requestHeader['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // 添加签名（可选）
    if (needSign) {
      const sign = generateSign(data);
      requestHeader['X-Sign'] = sign;
      requestHeader['X-Timestamp'] = Date.now();
    }
    
    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    // 发起请求
    const requestTask = wx.request({
      url: fullUrl,
      method,
      data,
      header: requestHeader,
      timeout,
      success: (res) => {
        handleSuccess(res, resolve, reject, options);
      },
      fail: (err) => {
        handleFail(err, reject, options, currentRequestId, resolve);
      },
      complete: () => {
        if (loading) {
          wx.hideLoading();
        }
        requestQueue.delete(currentRequestId);
      }
    });
    
    // 保存请求任务
    requestQueue.set(currentRequestId, requestTask);
  });
};

// 处理成功响应
const handleSuccess = (res, resolve, reject, options) => {
  const { statusCode, data } = res;
  
  // HTTP状态码检查
  if (statusCode >= 200 && statusCode < 300) {
    // 业务状态码检查
    if (data.code === 200 || data.code === 0 || data.success === true) {
      resolve(data.data || data);
    } else {
      // 业务错误
      const error = new Error(data.message || '请求失败');
      error.code = data.code;
      error.data = data;
      
      // 特殊错误码处理
      handleBusinessError(error);
      reject(error);
    }
  } else if (statusCode === 401) {
    // Token过期，需要重新登录
    handleTokenExpired();
    reject(new Error('登录已过期，请重新登录'));
  } else {
    reject(new Error(`HTTP ${statusCode}: ${data.message || '请求失败'}`));
  }
};

// 处理失败
const handleFail = (err, reject, options, requestId, resolve) => {
  const { retry } = options;
  
  // 网络错误重试
  if (retry > 0 && (err.errMsg?.includes('timeout') || err.errMsg?.includes('fail'))) {
    console.log(`请求失败，准备重试，剩余次数: ${retry}`);
    setTimeout(() => {
      request({ ...options, retry: retry - 1 })
        .then(resolve)
        .catch(reject);
    }, 1000);
    return;
  }
  
  // 网络状态检查
  wx.getNetworkType({
    success: (res) => {
      if (res.networkType === 'none') {
        wx.showToast({ title: '网络不可用', icon: 'none' });
      }
    }
  });
  
  reject(new Error(err.errMsg || '网络请求失败'));
};

// 处理业务错误
const handleBusinessError = (error) => {
  switch (error.code) {
    case 1001: // 参数错误
      wx.showToast({ title: error.message, icon: 'none' });
      break;
    case 1002: // 未登录
      handleTokenExpired();
      break;
    default:
      wx.showToast({ title: error.message || '操作失败', icon: 'none' });
  }
};

// Token过期处理
const handleTokenExpired = () => {
  userStorage.setToken('');
  wx.showModal({
    title: '提示',
    content: '登录已过期，请重新登录',
    showCancel: false,
    success: () => {
      wx.navigateTo({ url: '/pages/login/login' });
    }
  });
};

// 生成签名
const generateSign = (data) => {
  // 实现签名算法
  const sortedKeys = Object.keys(data).sort();
  const signStr = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
  // 使用 crypto-js 或其他库进行加密
  return signStr; // 简化示例
};

// 取消请求
const cancelRequest = (requestId) => {
  const task = requestQueue.get(requestId);
  if (task) {
    task.abort();
    requestQueue.delete(requestId);
  }
};

// 取消所有请求
const cancelAllRequests = () => {
  requestQueue.forEach((task, id) => {
    task.abort();
  });
  requestQueue.clear();
};

// 导出
module.exports = {
  request,
  cancelRequest,
  cancelAllRequests,
  
  // 快捷方法
  get: (url, params, options) => request({ 
    url, 
    method: 'GET', 
    data: params, 
    ...options 
  }),
  
  post: (url, data, options) => request({ 
    url, 
    method: 'POST', 
    data, 
    ...options 
  }),
  
  put: (url, data, options) => request({ 
    url, 
    method: 'PUT', 
    data, 
    ...options 
  }),
  
  del: (url, data, options) => request({ 
    url, 
    method: 'DELETE', 
    data, 
    ...options 
  }),
  
  upload: (url, filePath, options = {}) => {
    const { name = 'file', formData = {}, header = {} } = options;
    
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: url.startsWith('http') ? url : `${API_BASE_URL}${url}`,
        filePath,
        name,
        formData,
        header: {
          'Authorization': `Bearer ${userStorage.getToken()}`,
          ...header
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch (e) {
            resolve(res.data);
          }
        },
        fail: reject
      });
    });
  }
};
```

### 6.2 接口调用示例

```javascript
// services/userService.js - 用户服务
const { get, post } = require('../utils/request');

const userService = {
  // 登录
  login(code, userInfo) {
    return post('/api/user/login', {
      code,
      ...userInfo
    }, {
      needToken: false,
      loading: true,
      loadingText: '登录中...'
    });
  },
  
  // 获取用户信息
  getUserInfo() {
    return get('/api/user/info');
  },
  
  // 更新用户信息
  updateUserInfo(data) {
    return post('/api/user/update', data);
  },
  
  // 刷新Token
  refreshToken() {
    return post('/api/user/refresh-token', {}, { needToken: true });
  }
};

// services/productService.js - 商品服务
const productService = {
  // 获取商品列表
  getList(params) {
    return get('/api/product/list', params);
  },
  
  // 获取商品详情
  getDetail(id) {
    return get('/api/product/detail', { id });
  },
  
  // 搜索商品
  search(keyword, params = {}) {
    return get('/api/product/search', {
      keyword,
      ...params
    });
  },
  
  // 获取分类
  getCategories() {
    return get('/api/product/categories');
  }
};

// services/orderService.js - 订单服务
const orderService = {
  // 创建订单
  create(data) {
    return post('/api/order/create', data, {
      loading: true,
      loadingText: '提交中...'
    });
  },
  
  // 获取订单列表
  getList(params) {
    return get('/api/order/list', params);
  },
  
  // 获取订单详情
  getDetail(orderNo) {
    return get('/api/order/detail', { orderNo });
  },
  
  // 取消订单
  cancel(orderNo) {
    return post('/api/order/cancel', { orderNo });
  },
  
  // 支付订单
  pay(orderNo) {
    return post('/api/order/pay', { orderNo }, {
      loading: true,
      loadingText: '支付中...'
    });
  }
};

module.exports = {
  userService,
  productService,
  orderService
};
```

---

## 7. 核心功能代码示例

### 7.1 用户登录授权流程

```javascript
// pages/login/login.js
const { userService } = require('../../services/index');
const { userStorage } = require('../../utils/storage');
const { userStore } = require('../../stores/index');

Page({
  data: {
    loading: false,
    privacyChecked: false
  },
  
  onLoad() {
    // 检查是否已登录
    if (userStore.isLogin) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },
  
  // 隐私协议勾选
  onPrivacyChange(e) {
    this.setData({
      privacyChecked: e.detail.value.length > 0
    });
  },
  
  // 查看隐私协议
  onViewPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' });
  },
  
  // 微信登录
  async onWechatLogin() {
    if (!this.data.privacyChecked) {
      wx.showToast({ title: '请先同意隐私协议', icon: 'none' });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      // 1. 获取微信登录code
      const { code } = await wx.login();
      
      // 2. 获取用户信息（需用户授权）
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });
      
      // 3. 调用后端登录接口
      const result = await userService.login(code, {
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender,
        country: userInfo.country,
        province: userInfo.province,
        city: userInfo.city
      });
      
      // 4. 保存登录态
      userStorage.setToken(result.token);
      userStorage.setUserInfo(result.userInfo);
      
      // 5. 更新全局状态
      userStore.setToken(result.token);
      userStore.setUserInfo(result.userInfo);
      
      wx.showToast({ title: '登录成功', icon: 'success' });
      
      // 6. 返回上一页或首页
      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({ url: '/pages/index/index' });
        }
      }, 1500);
      
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({ title: error.message || '登录失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  
  // 手机号登录（需要企业资质）
  async onPhoneLogin(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '请授权手机号', icon: 'none' });
      return;
    }
    
    const { code: phoneCode, encryptedData, iv } = e.detail;
    
    // 获取微信登录code
    const { code } = await wx.login();
    
    // 调用后端手机号登录接口
    // ...
  },
  
  // 游客模式
  onGuestLogin() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
```

```html
<!-- pages/login/login.wxml -->
<view class="login-page">
  <view class="login-header">
    <image class="logo" src="/assets/images/logo.png" mode="aspectFit" />
    <text class="title">欢迎使用小程序</text>
  </view>
  
  <view class="login-actions">
    <button 
      class="btn-login btn-wechat"
      bindtap="onWechatLogin"
      loading="{{loading}}"
    >
      <image class="btn-icon" src="/assets/images/icons/wechat.png" />
      微信一键登录
    </button>
    
    <button 
      class="btn-login btn-phone"
      open-type="getPhoneNumber"
      bind:getphonenumber="onPhoneLogin"
    >
      手机号登录
    </button>
    
    <button class="btn-guest" bindtap="onGuestLogin">
      暂不登录，随便看看
    </button>
  </view>
  
  <view class="privacy-agreement">
    <checkbox-group bindchange="onPrivacyChange">
      <checkbox value="1" checked="{{privacyChecked}}" />
    </checkbox-group>
    <text class="privacy-text">
      我已阅读并同意
      <text class="link" bindtap="onViewPrivacy">《用户协议》</text>
      和
      <text class="link" bindtap="onViewPrivacy">《隐私政策》</text>
    </text>
  </view>
</view>
```

### 7.2 列表页加载更多实现

```javascript
// pages/order/list/list.js
const { orderService } = require('../../../services/index');

Page({
  data: {
    list: [],
    loading: false,
    finished: false,
    refreshing: false,
    page: 1,
    pageSize: 10,
    total: 0,
    status: 0, // 订单状态筛选
    error: false,
    errorMsg: ''
  },
  
  onLoad(options) {
    const { status = 0 } = options;
    this.setData({ status });
    this.loadData();
  },
  
  // 加载数据
  async loadData(reset = false) {
    if (this.data.loading) return;
    
    const { page, pageSize, status, list } = this.data;
    const currentPage = reset ? 1 : page;
    
    this.setData({ 
      loading: true, 
      error: false,
      finished: false 
    });
    
    try {
      const result = await orderService.getList({
        page: currentPage,
        pageSize,
        status
      });
      
      const newList = reset ? result.list : [...list, ...result.list];
      const finished = newList.length >= result.total;
      
      this.setData({
        list: newList,
        page: currentPage + 1,
        total: result.total,
        finished,
        loading: false
      });
      
    } catch (error) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: error.message || '加载失败'
      });
    }
  },
  
  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({ refreshing: true });
    await this.loadData(true);
    this.setData({ refreshing: false });
    wx.stopPullDownRefresh();
  },
  
  // 上拉加载更多
  onReachBottom() {
    if (this.data.finished || this.data.loading) return;
    this.loadData();
  },
  
  // 状态筛选
  onStatusChange(e) {
    const { status } = e.currentTarget.dataset;
    this.setData({ status, list: [], page: 1 });
    this.loadData(true);
  },
  
  // 重试
  onRetry() {
    this.loadData(true);
  },
  
  // 查看详情
  onItemTap(e) {
    const { orderNo } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/detail/detail?orderNo=${orderNo}`
    });
  }
});
```

```html
<!-- pages/order/list/list.wxml -->
<view class="order-list-page">
  <!-- 状态筛选 -->
  <view class="status-tabs">
    <view 
      class="tab-item {{status === item.value ? 'active' : ''}}"
      wx:for="{{tabs}}"
      wx:key="value"
      data-status="{{item.value}}"
      bindtap="onStatusChange"
    >
      {{item.label}}
      <text class="badge" wx:if="{{item.count > 0}}">{{item.count}}</text>
    </view>
  </view>
  
  <!-- 订单列表 -->
  <scroll-view 
    class="order-list"
    scroll-y
    enhanced
    show-scrollbar="{{false}}"
    refresher-enabled
    refresher-triggered="{{refreshing}}"
    bindrefresherrefresh="onPullDownRefresh"
    bindscrolltolower="onReachBottom"
  >
    <!-- 订单项 -->
    <view 
      class="order-item"
      wx:for="{{list}}"
      wx:key="orderNo"
      data-order-no="{{item.orderNo}}"
      bindtap="onItemTap"
    >
      <view class="order-header">
        <text class="order-no">订单号: {{item.orderNo}}</text>
        <text class="order-status">{{item.statusText}}</text>
      </view>
      <view class="order-products">
        <image 
          wx:for="{{item.products}}"
          wx:for-item="product"
          wx:key="id"
          class="product-image"
          src="{{product.image}}"
          mode="aspectFill"
        />
      </view>
      <view class="order-footer">
        <text class="order-time">{{item.createTime}}</text>
        <text class="order-total">共{{item.productCount}}件 实付: ¥{{item.totalAmount}}</text>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view class="loading-more" wx:if="{{loading && list.length > 0}}">
      <loading size="small" />
      <text>加载中...</text>
    </view>
    
    <!-- 到底提示 -->
    <view class="no-more" wx:if="{{finished && list.length > 0}}">
      没有更多订单了
    </view>
    
    <!-- 空状态 -->
    <empty 
      wx:if="{{!loading && list.length === 0}}"
      icon="/assets/images/empty-order.png"
      text="暂无订单"
      button-text="去逛逛"
      bind:buttontap="goShopping"
    />
    
    <!-- 错误状态 -->
    <view class="error-state" wx:if="{{error}}">
      <image src="/assets/images/error.png" />
      <text>{{errorMsg}}</text>
      <button bindtap="onRetry">重新加载</button>
    </view>
  </scroll-view>
</view>
```

```css
/* pages/order/list/list.wxss */
.order-list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.status-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #07c160;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #07c160;
  border-radius: 2rpx;
}

.badge {
  display: inline-block;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  margin-left: 8rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  line-height: 32rpx;
  text-align: center;
  border-radius: 16rpx;
}

.order-list {
  flex: 1;
  background: #f5f5f5;
}

.order-item {
  margin: 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.order-no {
  font-size: 26rpx;
  color: #999;
}

.order-status {
  font-size: 26rpx;
  color: #07c160;
}

.order-products {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-total {
  font-size: 26rpx;
  color: #333;
}

.loading-more, .no-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 24rpx;
}
```

### 7.3 表单提交与校验

```javascript
// utils/validate.js - 表单验证工具
const validate = {
  // 必填
  required(value, message = '此项为必填项') {
    if (value === undefined || value === null || value === '') {
      return message;
    }
    return true;
  },
  
  // 手机号
  mobile(value, message = '请输入正确的手机号') {
    const reg = /^1[3-9]\d{9}$/;
    if (!reg.test(value)) {
      return message;
    }
    return true;
  },
  
  // 邮箱
  email(value, message = '请输入正确的邮箱地址') {
    const reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
    if (!reg.test(value)) {
      return message;
    }
    return true;
  },
  
  // 身份证号
  idCard(value, message = '请输入正确的身份证号') {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!reg.test(value)) {
      return message;
    }
    return true;
  },
  
  // 最小长度
  minLength(value, length, message) {
    message = message || `长度不能少于${length}个字符`;
    if (String(value).length < length) {
      return message;
    }
    return true;
  },
  
  // 最大长度
  maxLength(value, length, message) {
    message = message || `长度不能超过${length}个字符`;
    if (String(value).length > length) {
      return message;
    }
    return true;
  },
  
  // 数字范围
  range(value, min, max, message) {
    message = message || `数值范围应在${min}-${max}之间`;
    const num = Number(value);
    if (isNaN(num) || num < min || num > max) {
      return message;
    }
    return true;
  },
  
  // 自定义正则
  pattern(value, reg, message = '格式不正确') {
    if (!reg.test(value)) {
      return message;
    }
    return true;
  }
};

// 表单验证器
class FormValidator {
  constructor(rules) {
    this.rules = rules;
    this.errors = {};
  }
  
  validate(data) {
    this.errors = {};
    let isValid = true;
    
    for (const [field, fieldRules] of Object.entries(this.rules)) {
      const value = data[field];
      
      for (const rule of fieldRules) {
        const { validator, message, ...params } = rule;
        
        let result;
        if (typeof validator === 'function') {
          result = validator(value, data);
        } else if (typeof validator === 'string' && validate[validator]) {
          result = validate[validator](value, message, ...Object.values(params));
        }
        
        if (result !== true) {
          this.errors[field] = result;
          isValid = false;
          break;
        }
      }
    }
    
    return isValid;
  }
  
  getErrors() {
    return this.errors;
  }
  
  getFirstError() {
    const errors = Object.values(this.errors);
    return errors.length > 0 ? errors[0] : null;
  }
}

module.exports = { validate, FormValidator };
```

```javascript
// pages/address/edit/edit.js
const { addressService } = require('../../../services/index');
const { FormValidator } = require('../../../utils/validate');

Page({
  data: {
    form: {
      name: '',
      mobile: '',
      region: [],
      detail: '',
      isDefault: false
    },
    errors: {},
    regionOptions: [],
    loading: false
  },
  
  // 验证规则
  validator: null,
  
  onLoad(options) {
    // 初始化验证器
    this.validator = new FormValidator({
      name: [
        { validator: 'required', message: '请输入收货人姓名' },
        { validator: 'maxLength', length: 20, message: '姓名不能超过20个字符' }
      ],
      mobile: [
        { validator: 'required', message: '请输入手机号' },
        { validator: 'mobile', message: '请输入正确的手机号' }
      ],
      region: [
        { 
          validator: (value) => value.length === 3 || '请选择省市区',
          message: '请选择省市区'
        }
      ],
      detail: [
        { validator: 'required', message: '请输入详细地址' },
        { validator: 'maxLength', length: 100, message: '详细地址不能超过100个字符' }
      ]
    });
    
    // 编辑模式
    if (options.id) {
      this.loadAddressDetail(options.id);
    }
    
    // 加载地区数据
    this.loadRegionData();
  },
  
  // 加载地址详情
  async loadAddressDetail(id) {
    try {
      const detail = await addressService.getDetail(id);
      this.setData({
        form: {
          id: detail.id,
          name: detail.name,
          mobile: detail.mobile,
          region: [detail.province, detail.city, detail.district],
          detail: detail.detail,
          isDefault: detail.isDefault
        }
      });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  
  // 加载地区数据
  async loadRegionData() {
    // 从本地缓存或接口获取
    const regionData = wx.getStorageSync('regionData');
    if (regionData) {
      this.setData({ regionOptions: regionData });
    } else {
      try {
        const data = await addressService.getRegionData();
        wx.setStorageSync('regionData', data);
        this.setData({ regionOptions: data });
      } catch (error) {
        console.error('加载地区数据失败:', error);
      }
    }
  },
  
  // 输入处理
  onInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`form.${field}`]: value,
      [`errors.${field}`]: ''
    });
  },
  
  // 地区选择
  onRegionChange(e) {
    const { value } = e.detail;
    this.setData({
      'form.region': value,
      'errors.region': ''
    });
  },
  
  // 默认地址切换
  onDefaultChange(e) {
    this.setData({
      'form.isDefault': e.detail.value
    });
  },
  
  // 表单提交
  async onSubmit() {
    const { form } = this.data;
    
    // 验证表单
    const isValid = this.validator.validate(form);
    if (!isValid) {
      this.setData({ errors: this.validator.getErrors() });
      wx.showToast({ 
        title: this.validator.getFirstError(), 
        icon: 'none' 
      });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const submitData = {
        ...form,
        province: form.region[0],
        city: form.region[1],
        district: form.region[2]
      };
      
      if (form.id) {
        await addressService.update(submitData);
      } else {
        await addressService.create(submitData);
      }
      
      wx.showToast({ title: '保存成功', icon: 'success' });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      
    } catch (error) {
      wx.showToast({ title: error.message || '保存失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  
  // 微信地址导入
  async onImportFromWechat() {
    try {
      const address = await wx.chooseAddress();
      
      this.setData({
        form: {
          ...this.data.form,
          name: address.userName,
          mobile: address.telNumber,
          region: [address.provinceName, address.cityName, address.countyName],
          detail: address.detailInfo
        },
        errors: {}
      });
    } catch (error) {
      if (error.errMsg !== 'chooseAddress:fail cancel') {
        wx.showToast({ title: '导入失败', icon: 'none' });
      }
    }
  }
});
```

```html
<!-- pages/address/edit/edit.wxml -->
<view class="address-edit-page">
  <view class="form-section">
    <view class="form-item {{errors.name ? 'error' : ''}}">
      <text class="label">收货人</text>
      <input 
        class="input"
        placeholder="请输入收货人姓名"
        value="{{form.name}}"
        data-field="name"
        bindinput="onInput"
      />
    </view>
    <text class="error-text" wx:if="{{errors.name}}">{{errors.name}}</text>
    
    <view class="form-item {{errors.mobile ? 'error' : ''}}">
      <text class="label">手机号</text>
      <input 
        class="input"
        type="number"
        maxlength="11"
        placeholder="请输入手机号"
        value="{{form.mobile}}"
        data-field="mobile"
        bindinput="onInput"
      />
    </view>
    <text class="error-text" wx:if="{{errors.mobile}}">{{errors.mobile}}</text>
    
    <view class="form-item {{errors.region ? 'error' : ''}}">
      <text class="label">所在地区</text>
      <picker 
        mode="region"
        value="{{form.region}}"
        bindchange="onRegionChange"
      >
        <view class="picker {{form.region.length === 0 ? 'placeholder' : ''}}">
          {{form.region.length > 0 ? form.region.join(' ') : '请选择省市区'}}
        </view>
      </picker>
      <image class="arrow" src="/assets/images/icons/arrow-right.png" />
    </view>
    <text class="error-text" wx:if="{{errors.region}}">{{errors.region}}</text>
    
    <view class="form-item {{errors.detail ? 'error' : ''}}">
      <text class="label">详细地址</text>
      <textarea 
        class="textarea"
        placeholder="请输入街道、楼牌号等"
        value="{{form.detail}}"
        data-field="detail"
        bindinput="onInput"
        maxlength="100"
      />
    </view>
    <text class="error-text" wx:if="{{errors.detail}}">{{errors.detail}}</text>
    
    <view class="form-item">
      <text class="label">设为默认地址</text>
      <switch 
        checked="{{form.isDefault}}"
        bindchange="onDefaultChange"
        color="#07c160"
      />
    </view>
  </view>
  
  <view class="actions">
    <button class="btn-submit" bindtap="onSubmit" loading="{{loading}}">
      保存
    </button>
    <button class="btn-import" bindtap="onImportFromWechat">
      从微信导入
    </button>
  </view>
</view>
```

### 7.4 图片上传功能

```javascript
// utils/upload.js - 图片上传封装
const { request } = require('./request');

const upload = {
  // 选择图片
  chooseImage(options = {}) {
    const {
      count = 1,
      sizeType = ['original', 'compressed'],
      sourceType = ['album', 'camera']
    } = options;
    
    return new Promise((resolve, reject) => {
      wx.chooseMedia({
        count,
        mediaType: ['image'],
        sizeType,
        sourceType,
        success: (res) => {
          resolve(res.tempFiles);
        },
        fail: reject
      });
    });
  },
  
  // 压缩图片
  compressImage(src, quality = 80) {
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src,
        quality,
        success: (res) => resolve(res.tempFilePath),
        fail: reject
      });
    });
  },
  
  // 获取图片信息
  getImageInfo(src) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src,
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 上传到服务器
  uploadToServer(filePath, options = {}) {
    const {
      url = '/api/upload/image',
      name = 'file',
      formData = {},
      onProgress
    } = options;
    
    return new Promise((resolve, reject) => {
      const uploadTask = wx.uploadFile({
        url: url.startsWith('http') ? url : `${API_BASE_URL}${url}`,
        filePath,
        name,
        formData,
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.code === 200) {
              resolve(data.data);
            } else {
              reject(new Error(data.message || '上传失败'));
            }
          } catch (e) {
            resolve(res.data);
          }
        },
        fail: reject
      });
      
      // 监听上传进度
      if (onProgress && uploadTask) {
        uploadTask.onProgressUpdate((res) => {
          onProgress(res.progress, res.totalBytesSent, res.totalBytesExpectedToSend);
        });
      }
    });
  },
  
  // 批量上传
  async uploadMultiple(filePaths, options = {}) {
    const { onItemProgress, onTotalProgress } = options;
    const results = [];
    const total = filePaths.length;
    let completed = 0;
    
    for (let i = 0; i < filePaths.length; i++) {
      try {
        const result = await this.uploadToServer(filePaths[i], {
          ...options,
          onProgress: (progress) => {
            if (onItemProgress) {
              onItemProgress(i, progress);
            }
          }
        });
        results.push({ success: true, data: result, index: i });
      } catch (error) {
        results.push({ success: false, error: error.message, index: i });
      }
      
      completed++;
      if (onTotalProgress) {
        onTotalProgress(Math.round((completed / total) * 100), completed, total);
      }
    }
    
    return results;
  },
  
  // 预览图片
  previewImage(urls, current = 0) {
    wx.previewImage({
      urls: urls.map(url => typeof url === 'string' ? url : url.url),
      current: typeof current === 'number' ? urls[current] : current
    });
  },
  
  // 保存图片到相册
  saveImageToPhotosAlbum(filePath) {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: resolve,
        fail: (err) => {
          if (err.errMsg.includes('auth deny')) {
            wx.showModal({
              title: '提示',
              content: '需要授权保存图片到相册',
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting();
                }
              }
            });
          }
          reject(err);
        }
      });
    });
  }
};

module.exports = upload;
```

```javascript
// pages/upload-demo/upload-demo.js
const upload = require('../../utils/upload');

Page({
  data: {
    images: [], // { url, status: 'uploading'|'success'|'error', progress }
    maxCount: 9,
    uploadProgress: 0
  },
  
  // 选择图片
  async onChooseImage() {
    const { images, maxCount } = this.data;
    const remainCount = maxCount - images.length;
    
    if (remainCount <= 0) {
      wx.showToast({ title: `最多上传${maxCount}张图片`, icon: 'none' });
      return;
    }
    
    try {
      const files = await upload.chooseImage({ count: remainCount });
      
      // 添加到列表
      const newImages = files.map(file => ({
        localPath: file.tempFilePath,
        url: '',
        status: 'pending',
        progress: 0
      }));
      
      this.setData({
        images: [...images, ...newImages]
      });
      
      // 自动上传
      this.uploadImages();
      
    } catch (error) {
      console.error('选择图片失败:', error);
    }
  },
  
  // 上传图片
  async uploadImages() {
    const { images } = this.data;
    
    for (let i = 0; i < images.length; i++) {
      if (images[i].status !== 'pending') continue;
      
      // 更新状态为上传中
      this.setData({ [`images[${i}].status`]: 'uploading' });
      
      try {
        // 压缩图片
        const compressedPath = await upload.compressImage(images[i].localPath, 80);
        
        // 上传
        const result = await upload.uploadToServer(compressedPath, {
          onProgress: (progress) => {
            this.setData({ [`images[${i}].progress`]: progress });
          }
        });
        
        // 更新为成功状态
        this.setData({
          [`images[${i}].status`]: 'success',
          [`images[${i}].url`]: result.url,
          [`images[${i}].progress`]: 100
        });
        
      } catch (error) {
        this.setData({
          [`images[${i}].status`]: 'error',
          [`images[${i}].error`]: error.message
        });
      }
    }
  },
  
  // 删除图片
  onDeleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const { images } = this.data;
    
    wx.showModal({
      title: '提示',
      content: '确定删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          images.splice(index, 1);
          this.setData({ images });
        }
      }
    });
  },
  
  // 重试上传
  onRetryUpload(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      [`images[${index}].status`]: 'pending',
      [`images[${index}].progress`]: 0
    });
    this.uploadImages();
  },
  
  // 预览图片
  onPreviewImage(e) {
    const { index } = e.currentTarget.dataset;
    const { images } = this.data;
    
    const urls = images.map(img => img.localPath || img.url);
    upload.previewImage(urls, index);
  },
  
  // 提交
  onSubmit() {
    const { images } = this.data;
    const uploadedImages = images.filter(img => img.status === 'success');
    
    if (uploadedImages.length === 0) {
      wx.showToast({ title: '请至少上传一张图片', icon: 'none' });
      return;
    }
    
    console.log('提交的图片:', uploadedImages.map(img => img.url));
    // 调用提交接口...
  }
});
```

```html
<!-- pages/upload-demo/upload-demo.wxml -->
<view class="upload-page">
  <view class="upload-section">
    <text class="section-title">上传图片 ({{images.length}}/{{maxCount}})</text>
    
    <view class="image-list">
      <!-- 已上传图片 -->
      <view 
        class="image-item"
        wx:for="{{images}}"
        wx:key="index"
        data-index="{{index}}"
      >
        <image 
          class="image-preview"
          src="{{item.localPath || item.url}}"
          mode="aspectFill"
          bindtap="onPreviewImage"
          data-index="{{index}}"
        />
        
        <!-- 删除按钮 -->
        <view 
          class="delete-btn"
          catchtap="onDeleteImage"
          data-index="{{index}}"
        >
          <text class="icon-close">×</text>
        </view>
        
        <!-- 上传进度 -->
        <view class="upload-overlay" wx:if="{{item.status === 'uploading'}}">
          <progress 
            class="upload-progress"
            percent="{{item.progress}}"
            stroke-width="4"
            activeColor="#fff"
            backgroundColor="rgba(255,255,255,0.3)"
          />
          <text class="upload-text">{{item.progress}}%</text>
        </view>
        
        <!-- 上传失败 -->
        <view class="upload-overlay error" wx:if="{{item.status === 'error'}}">
          <text class="error-text">上传失败</text>
          <button 
            class="retry-btn"
            size="mini"
            catchtap="onRetryUpload"
            data-index="{{index}}"
          >
            重试
          </button>
        </view>
      </view>
      
      <!-- 添加按钮 -->
      <view 
        class="add-btn"
        bindtap="onChooseImage"
        wx:if="{{images.length < maxCount}}"
      >
        <text class="icon-add">+</text>
        <text class="add-text">添加图片</text>
      </view>
    </view>
  </view>
  
  <button class="btn-submit" bindtap="onSubmit">提交</button>
</view>
```

### 7.5 地理位置获取

```javascript
// utils/location.js - 地理位置工具
const location = {
  // 获取当前位置
  getCurrentPosition(options = {}) {
    const {
      type = 'gcj02', // wgs84 / gcj02
      altitude = false,
      isHighAccuracy = true,
      highAccuracyExpireTime = 3000
    } = options;
    
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type,
        altitude,
        isHighAccuracy,
        highAccuracyExpireTime,
        success: resolve,
        fail: (err) => {
          if (err.errCode === 2) {
            // 位置服务未开启
            wx.showModal({
              title: '提示',
              content: '请开启手机定位服务',
              showCancel: false
            });
          } else if (err.errMsg.includes('auth deny')) {
            // 未授权
            wx.showModal({
              title: '提示',
              content: '需要获取您的位置信息',
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting();
                }
              }
            });
          }
          reject(err);
        }
      });
    });
  },
  
  // 选择位置
  chooseLocation(options = {}) {
    return new Promise((resolve, reject) => {
      wx.chooseLocation({
        ...options,
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 打开位置
  openLocation(latitude, longitude, options = {}) {
    return new Promise((resolve, reject) => {
      wx.openLocation({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        ...options,
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 地址解析（需要调用地图服务）
  async geocoder(address) {
    // 使用腾讯地图API或其他服务
    const { QQ_MAP_KEY } = require('./constants');
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://apis.map.qq.com/ws/geocoder/v1/',
        data: {
          address,
          key: QQ_MAP_KEY
        },
        success: (res) => {
          if (res.data.status === 0) {
            resolve(res.data.result.location);
          } else {
            reject(new Error(res.data.message));
          }
        },
        fail: reject
      });
    });
  },
  
  // 逆地址解析
  async reverseGeocoder(latitude, longitude) {
    const { QQ_MAP_KEY } = require('./constants');
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://apis.map.qq.com/ws/geocoder/v1/',
        data: {
          location: `${latitude},${longitude}`,
          key: QQ_MAP_KEY,
          get_poi: 1
        },
        success: (res) => {
          if (res.data.status === 0) {
            resolve(res.data.result);
          } else {
            reject(new Error(res.data.message));
          }
        },
        fail: reject
      });
    });
  },
  
  // 计算两点距离
  calculateDistance(lat1, lng1, lat2, lng2) {
    const rad = (d) => d * Math.PI / 180;
    const EARTH_RADIUS = 6378137;
    
    const radLat1 = rad(lat1);
    const radLat2 = rad(lat2);
    const a = radLat1 - radLat2;
    const b = rad(lng1) - rad(lng2);
    
    const s = 2 * Math.asin(Math.sqrt(
      Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
    ));
    
    return Math.round(s * EARTH_RADIUS);
  },
  
  // 格式化距离
  formatDistance(distance) {
    if (distance < 1000) {
      return `${distance}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

module.exports = location;
```

```javascript
// pages/location-demo/location-demo.js
const location = require('../../utils/location');

Page({
  data: {
    currentLocation: null,
    selectedLocation: null,
    nearbyShops: [],
    loading: false
  },
  
  async onLoad() {
    await this.getCurrentLocation();
  },
  
  // 获取当前位置
  async getCurrentLocation() {
    this.setData({ loading: true });
    
    try {
      const position = await location.getCurrentPosition({
        isHighAccuracy: true
      });
      
      // 逆地址解析
      const addressInfo = await location.reverseGeocoder(
        position.latitude,
        position.longitude
      );
      
      this.setData({
        currentLocation: {
          ...position,
          address: addressInfo.address,
          formatted_addresses: addressInfo.formatted_addresses
        }
      });
      
      // 加载附近门店
      this.loadNearbyShops(position.latitude, position.longitude);
      
    } catch (error) {
      console.error('获取位置失败:', error);
      wx.showToast({ title: '获取位置失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  
  // 选择位置
  async onChooseLocation() {
    try {
      const selected = await location.chooseLocation();
      
      this.setData({
        selectedLocation: selected
      });
      
      wx.showToast({ 
        title: `选择了: ${selected.name}`, 
        icon: 'none' 
      });
      
    } catch (error) {
      if (error.errMsg !== 'chooseLocation:fail cancel') {
        wx.showToast({ title: '选择位置失败', icon: 'none' });
      }
    }
  },
  
  // 打开地图导航
  onNavigate(e) {
    const { latitude, longitude, name, address } = e.currentTarget.dataset;
    
    location.openLocation(latitude, longitude, {
      name,
      address,
      scale: 18
    });
  },
  
  // 加载附近门店
  async loadNearbyShops(lat, lng) {
    // 模拟数据，实际调用接口
    const mockShops = [
      { id: 1, name: '门店A', lat: lat + 0.001, lng: lng + 0.001, address: '地址A' },
      { id: 2, name: '门店B', lat: lat - 0.002, lng: lng + 0.002, address: '地址B' },
      { id: 3, name: '门店C', lat: lat + 0.003, lng: lng - 0.001, address: '地址C' }
    ];
    
    // 计算距离并排序
    const shopsWithDistance = mockShops.map(shop => ({
      ...shop,
      distance: location.calculateDistance(lat, lng, shop.lat, shop.lng),
      distanceText: location.formatDistance(
        location.calculateDistance(lat, lng, shop.lat, shop.lng)
      )
    })).sort((a, b) => a.distance - b.distance);
    
    this.setData({ nearbyShops: shopsWithDistance });
  }
});
```

---

## 8. 性能优化策略

### 8.1 首屏加载优化

```javascript
// app.js - 应用入口优化
App({
  onLaunch(options) {
    // 1. 并行初始化
    this.initParallel();
    
    // 2. 预加载关键数据
    this.preloadCriticalData();
    
    // 3. 监听性能指标
    this.monitorPerformance();
  },
  
  // 并行初始化
  async initParallel() {
    await Promise.all([
      this.initSystemInfo(),
      this.initNetworkStatus(),
      this.initUserInfo()
    ]);
  },
  
  // 获取系统信息
  initSystemInfo() {
    return new Promise((resolve) => {
      wx.getSystemInfo({
        success: (res) => {
          this.globalData.systemInfo = res;
          resolve(res);
        },
        fail: resolve
      });
    });
  },
  
  // 网络状态
  initNetworkStatus() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          this.globalData.networkType = res.networkType;
          resolve(res);
        },
        fail: resolve
      });
    });
  },
  
  // 用户信息
  async initUserInfo() {
    const token = wx.getStorageSync('token');
    if (token) {
      try {
        // 静默登录验证
        const userInfo = await this.verifyToken(token);
        this.globalData.userInfo = userInfo;
      } catch (e) {
        // Token过期，清除
        wx.removeStorageSync('token');
      }
    }
  },
  
  // 预加载关键数据
  preloadCriticalData() {
    // 首页数据、配置信息等
    const criticalData = [
      this.preloadHomeData(),
      this.preloadConfig()
    ];
    
    Promise.all(criticalData).catch(console.error);
  },
  
  // 性能监控
  monitorPerformance() {
    // 监听页面渲染时间
    if (wx.getPerformance) {
      const performance = wx.getPerformance();
      const observer = performance.createObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          console.log('Performance entry:', entry);
        });
      });
      observer.observe({ entryTypes: ['render', 'script', 'navigation'] });
    }
  },
  
  globalData: {
    systemInfo: null,
    networkType: 'unknown',
    userInfo: null
  }
});
```

### 8.2 图片优化

```javascript
// components/image-loader/image-loader.js - 图片懒加载组件
Component({
  options: {
    addGlobalClass: true
  },
  
  properties: {
    src: String,
    mode: {
      type: String,
      value: 'aspectFill'
    },
    lazyLoad: {
      type: Boolean,
      value: true
    },
    placeholder: {
      type: String,
      value: '/assets/images/placeholder.png'
    },
    webp: {
      type: Boolean,
      value: true
    },
    showMenuByLongpress: {
      type: Boolean,
      value: false
    }
  },
  
  data: {
    loaded: false,
    currentSrc: ''
  },
  
  observers: {
    'src': function(src) {
      if (!this.properties.lazyLoad) {
        this.setData({ currentSrc: src });
      }
    }
  },
  
  ready() {
    if (this.properties.lazyLoad) {
      this.observeImage();
    }
  },
  
  // 使用 IntersectionObserver 实现懒加载
  observeImage() {
    this.observer = this.createIntersectionObserver({
      thresholds: [0],
      initialRatio: 0
    });
    
    this.observer.relativeToViewport({
      bottom: 100 // 提前100px加载
    }).observe('.image-container', (res) => {
      if (res.intersectionRatio > 0) {
        this.setData({ currentSrc: this.properties.src });
        this.observer.disconnect();
      }
    });
  },
  
  onLoad() {
    this.setData({ loaded: true });
    this.triggerEvent('load');
  },
  
  onError() {
    this.setData({ 
      currentSrc: this.properties.placeholder,
      loaded: true 
    });
    this.triggerEvent('error');
  },
  
  detached() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
});
```

```html
<!-- components/image-loader/image-loader.wxml -->
<view class="image-container">
  <image 
    class="image {{loaded ? 'loaded' : ''}}"
    src="{{currentSrc}}"
    mode="{{mode}}"
    webp="{{webp}}"
    show-menu-by-longpress="{{showMenuByLongpress}}"
    bindload="onLoad"
    binderror="onError"
  />
  <image 
    class="placeholder {{loaded ? 'hide' : ''}}"
    src="{{placeholder}}"
    mode="{{mode}}"
  />
</view>
```

```css
/* components/image-loader/image-loader.wxss */
.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}

.image {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s;
}

.image.loaded {
  opacity: 1;
}

.placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  transition: opacity 0.3s;
}

.placeholder.hide {
  opacity: 0;
  pointer-events: none;
}
```

### 8.3 列表虚拟滚动

```javascript
// components/virtual-list/virtual-list.js - 虚拟列表组件
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  
  properties: {
    list: {
      type: Array,
      value: []
    },
    itemHeight: {
      type: Number,
      value: 100
    },
    bufferSize: {
      type: Number,
      value: 5
    },
    scrollTop: {
      type: Number,
      value: 0
    }
  },
  
  data: {
    visibleList: [],
    startIndex: 0,
    endIndex: 0,
    containerHeight: 0,
    totalHeight: 0,
    offset: 0
  },
  
  observers: {
    'list, itemHeight': function(list, itemHeight) {
      this.setData({
        totalHeight: list.length * itemHeight
      });
      this.updateVisibleList();
    },
    'scrollTop': function(scrollTop) {
      this.updateVisibleList(scrollTop);
    }
  },
  
  ready() {
    // 获取容器高度
    this.createSelectorQuery()
      .select('.virtual-list-container')
      .boundingClientRect((rect) => {
        this.setData({
          containerHeight: rect.height
        });
        this.updateVisibleList();
      })
      .exec();
  },
  
  methods: {
    // 更新可见列表
    updateVisibleList(scrollTop = this.data.scrollTop) {
      const { list, itemHeight, bufferSize, containerHeight } = this.data;
      
      if (!containerHeight || list.length === 0) return;
      
      // 计算可见范围
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
      const visibleCount = Math.ceil(containerHeight / itemHeight) + bufferSize * 2;
      const endIndex = Math.min(list.length, startIndex + visibleCount);
      
      // 提取可见数据
      const visibleList = list.slice(startIndex, endIndex).map((item, index) => ({
        ...item,
        _index: startIndex + index,
        _style: `transform: translateY(${(startIndex + index) * itemHeight}px);`
      }));
      
      this.setData({
        visibleList,
        startIndex,
        endIndex,
        offset: startIndex * itemHeight
      });
    },
    
    // 滚动事件
    onScroll(e) {
      const scrollTop = e.detail.scrollTop;
      this.updateVisibleList(scrollTop);
      this.triggerEvent('scroll', e.detail);
    },
    
    // 滚动到底部
    onScrollToLower() {
      this.triggerEvent('scrolltolower');
    }
  }
});
```

```html
<!-- components/virtual-list/virtual-list.wxml -->
<scroll-view 
  class="virtual-list-container"
  scroll-y
  enhanced
  show-scrollbar="{{false}}"
  scroll-top="{{scrollTop}}"
  bindscroll="onScroll"
  bindscrolltolower="onScrollToLower"
>
  <view class="virtual-list-content" style="height: {{totalHeight}}px;">
    <view 
      class="virtual-list-item"
      wx:for="{{visibleList}}"
      wx:key="_index"
      style="{{item._style}}"
    >
      <slot item="{{item}}" index="{{item._index}}"></slot>
    </view>
  </view>
</scroll-view>
```

```css
/* components/virtual-list/virtual-list.wxss */
.virtual-list-container {
  height: 100%;
}

.virtual-list-content {
  position: relative;
}

.virtual-list-item {
  position: absolute;
  left: 0;
  right: 0;
  will-change: transform;
}
```

### 8.4 分包加载配置

```json
// app.json - 分包配置
{
  "pages": [
    "pages/index/index",
    "pages/category/category",
    "pages/cart/cart",
    "pages/user/user"
  ],
  "subpackages": [
    {
      "root": "subpackages/order",
      "name": "order",
      "pages": [
        "pages/list/list",
        "pages/detail/detail",
        "pages/confirm/confirm",
        "pages/refund/refund"
      ]
    },
    {
      "root": "subpackages/product",
      "name": "product",
      "pages": [
        "pages/detail/detail",
        "pages/list/list",
        "pages/search/search"
      ]
    },
    {
      "root": "subpackages/user",
      "name": "user",
      "pages": [
        "pages/address/list/list",
        "pages/address/edit/edit",
        "pages/coupon/list/list",
        "pages/setting/index/index"
      ]
    },
    {
      "root": "subpackages/activity",
      "name": "activity",
      "pages": [
        "pages/seckill/list/list",
        "pages/group/list/list",
        "pages/lottery/index/index"
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["product"]
    },
    "pages/cart/cart": {
      "network": "all",
      "packages": ["order"]
    },
    "pages/user/user": {
      "network": "all",
      "packages": ["user"]
    }
  },
  "workers": "workers",
  "lazyCodeLoading": "requiredComponents"
}
```

### 8.5 性能优化清单

```javascript
// utils/performance.js - 性能优化工具
const performance = {
  // 图片优化配置
  imageOptimization: {
    // 使用 WebP 格式
    useWebP: true,
    // 使用 CDN 图片压缩
    cdnCompress: true,
    // 懒加载阈值
    lazyThreshold: 100,
    // 占位图
    placeholder: '/assets/images/placeholder.png'
  },
  
  // 缓存策略
  cacheStrategy: {
    // 首页数据缓存时间
    homeData: 5 * 60 * 1000, // 5分钟
    // 用户信息缓存时间
    userInfo: 30 * 60 * 1000, // 30分钟
    // 配置信息缓存时间
    config: 60 * 60 * 1000 // 1小时
  },
  
  // 内存管理
  memoryManagement: {
    // 图片缓存上限
    imageCacheLimit: 50,
    // 页面栈上限
    pageStackLimit: 10,
    // 定时清理间隔
    cleanupInterval: 5 * 60 * 1000
  },
  
  // 启动优化
  launchOptimization: {
    // 预加载页面
    preloadPages: ['pages/index/index'],
    // 延迟加载组件
    lazyComponents: true,
    // 骨架屏
    useSkeleton: true
  },
  
  // 渲染优化
  renderOptimization: {
    // 使用 virtual-list
    useVirtualList: true,
    // 列表项高度固定
    fixedItemHeight: true,
    // 避免不必要的数据绑定
    minimizeDataBinding: true
  }
};

// 性能监控
const performanceMonitor = {
  // 页面加载时间
  pageLoadTime: {},
  
  // 开始计时
  startTimer(name) {
    this.pageLoadTime[name] = {
      start: performance.now()
    };
  },
  
  // 结束计时
  endTimer(name) {
    if (this.pageLoadTime[name]) {
      const duration = performance.now() - this.pageLoadTime[name].start;
      this.pageLoadTime[name].duration = duration;
      
      // 上报或记录
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      
      // 慢页面警告
      if (duration > 2000) {
        console.warn(`[Performance] Slow page detected: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
  },
  
  // 获取性能数据
  getMetrics() {
    return this.pageLoadTime;
  }
};

module.exports = { performance, performanceMonitor };
```

---

## 9. 开发注意事项

### 9.1 常见坑点提醒

```javascript
// ========== 常见坑点及解决方案 ==========

// 1. setData 数据大小限制
// ❌ 错误：一次性设置大量数据
this.setData({
  hugeList: veryLargeArray  // 超过 1MB 会报错
});

// ✅ 正确：分页加载，虚拟列表
this.setData({
  visibleList: largeArray.slice(0, 20)
});

// 2. 页面栈限制
// ❌ 错误：无限 navigateTo
wx.navigateTo({ url: '/pages/a/a' });
wx.navigateTo({ url: '/pages/b/b' });
// ... 超过 10 层会报错

// ✅ 正确：使用 redirectTo 或 reLaunch
wx.redirectTo({ url: '/pages/b/b' }); // 关闭当前页
wx.reLaunch({ url: '/pages/index/index' }); // 关闭所有页

// 3. 图片域名白名单
// ❌ 错误：直接引用外部图片
<image src="https://example.com/image.jpg" />

// ✅ 正确：在管理后台配置 downloadFile 域名
// 或使用自己域名的 CDN

// 4. 异步回调 this 指向
// ❌ 错误
Page({
  data: { name: 'test' },
  onLoad() {
    setTimeout(function() {
      console.log(this.data.name); // undefined
    }, 1000);
  }
});

// ✅ 正确：使用箭头函数
Page({
  data: { name: 'test' },
  onLoad() {
    setTimeout(() => {
      console.log(this.data.name); // 'test'
    }, 1000);
  }
});

// 5. 自定义组件数据更新
// ❌ 错误：直接修改 properties
Component({
  properties: {
    count: Number
  },
  methods: {
    add() {
      this.properties.count++; // 不会触发视图更新
    }
  }
});

// ✅ 正确：使用 setData
Component({
  properties: {
    count: Number
  },
  data: {
    internalCount: 0
  },
  observers: {
    'count': function(count) {
      this.setData({ internalCount: count });
    }
  },
  methods: {
    add() {
      this.setData({
        internalCount: this.data.internalCount + 1
      });
    }
  }
});

// 6. 滚动穿透问题
// ✅ 解决方案：在弹窗层阻止滚动
Component({
  methods: {
    preventTouchMove() {
      return false;
    }
  }
});

// WXML: <view catchtouchmove="preventTouchMove">

// 7. 日期格式化
// ❌ 错误：使用 new Date('2023-01-01') iOS 不支持
// ✅ 正确：使用兼容格式
const date = new Date('2023/01/01'); // 使用斜杠

// 8. rpx 单位注意事项
// ✅ 设计稿宽度为 750px，1rpx = 0.5px (iPhone6)
// 字体大小建议使用 px，避免在不同设备上差异过大

// 9. 分享功能
// ✅ 必须定义 onShareAppMessage
Page({
  onShareAppMessage() {
    return {
      title: '分享标题',
      path: '/pages/index/index?id=123',
      imageUrl: '/assets/images/share.png'
    };
  }
});

// 10. 获取节点信息
// ✅ 使用 SelectorQuery
const query = wx.createSelectorQuery();
query.select('#myId').boundingClientRect();
query.selectViewport().scrollOffset();
query.exec((res) => {
  console.log(res[0]); // 节点信息
  console.log(res[1]); // 滚动位置
});
```

### 9.2 调试技巧

```javascript
// ========== 调试技巧 ==========

// 1. 开启调试模式
// 在 app.json 中添加
{
  "debug": true
}

// 2. 使用 vConsole
// 在真机上查看 console 日志
// 开发工具 -> 详情 -> 本地设置 -> 开启 vConsole

// 3. 性能面板
// 开发工具 -> 性能面板
// 查看渲染时间、脚本执行时间等

// 4. 网络请求监控
// 开发工具 -> Network 面板
// 查看请求详情、响应时间等

// 5. Storage 查看
// 开发工具 -> Storage 面板
// 查看本地存储数据

// 6. 自定义日志
const logger = {
  debug: (msg, ...args) => {
    #ifdef DEBUG
    console.log(`[DEBUG] ${msg}`, ...args);
    #endif
  },
  info: (msg, ...args) => {
    console.info(`[INFO] ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`[WARN] ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`[ERROR] ${msg}`, ...args);
    // 上报错误
    this.reportError(msg, args);
  }
};

// 7. 页面生命周期调试
Page({
  onLoad() {
    console.log('[Lifecycle] onLoad');
  },
  onShow() {
    console.log('[Lifecycle] onShow');
  },
  onReady() {
    console.log('[Lifecycle] onReady');
  },
  onHide() {
    console.log('[Lifecycle] onHide');
  },
  onUnload() {
    console.log('[Lifecycle] onUnload');
  }
});

// 8. 数据变化追踪
Page({
  data: {
    count: 0
  },
  setDataWithLog(data) {
    console.log('[setData]', data);
    this.setData(data);
  }
});

// 9. 网络请求追踪
const originalRequest = wx.request;
wx.request = function(options) {
  console.log('[Request]', options.url, options.data);
  const startTime = Date.now();
  
  const originalSuccess = options.success;
  options.success = function(res) {
    console.log('[Response]', options.url, Date.now() - startTime + 'ms', res);
    originalSuccess && originalSuccess(res);
  };
  
  return originalRequest(options);
};
```

### 9.3 审核注意事项

```javascript
// ========== 审核注意事项 ==========

// 1. 用户隐私保护
// ✅ 必须提供隐私政策
// ✅ 收集用户信息前必须明确告知
// ✅ 敏感权限需要用户授权

// 2. 内容合规
// ❌ 禁止：色情、暴力、赌博等内容
// ❌ 禁止：诱导分享、强制分享
// ❌ 禁止：虚假宣传、欺诈行为

// 3. 功能完整
// ✅ 提交审核前确保核心功能可用
// ✅ 避免使用测试数据
// ✅ 确保所有页面都能正常访问

// 4. 类目选择
// ✅ 选择与小程序功能匹配的类目
// ✅ 特殊类目需要相应资质

// 5. 代码规范
// ✅ 移除 console.log 和 debugger
// ✅ 移除未使用的代码和资源
// ✅ 确保代码安全，无敏感信息泄露

// 6. 用户体验
// ✅ 页面加载时间 < 3s
// ✅ 提供清晰的导航和反馈
// ✅ 适配不同屏幕尺寸

// 7. 常见审核驳回原因
const rejectReasons = [
  '页面加载失败或白屏',
  '功能不完整或存在明显bug',
  '涉及用户隐私未提供隐私政策',
  '类目与实际功能不符',
  '存在诱导分享行为',
  '内容涉及违规信息',
  '用户体验差，操作不流畅'
];

// 8. 审核加速技巧
const auditTips = {
  // 提供测试账号
  testAccount: {
    username: 'test@example.com',
    password: 'test123456'
  },
  // 提供操作说明
  instructions: '1. 点击首页进入 2. 选择商品 3. 下单支付',
  // 提供视频演示
  videoDemo: 'https://example.com/demo.mp4'
};
```

---

## 附录：常用工具函数

```javascript
// utils/util.js - 常用工具函数
const util = {
  // 格式化日期
  formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (typeof date === 'string') {
      date = new Date(date.replace(/-/g, '/'));
    } else if (typeof date === 'number') {
      date = new Date(date);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hour)
      .replace('mm', minute)
      .replace('ss', second);
  },
  
  // 防抖
  debounce(fn, delay = 300) {
    let timer = null;
    return function(...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  },
  
  // 节流
  throttle(fn, interval = 300) {
    let lastTime = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= interval) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  },
  
  // 深拷贝
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (obj instanceof Object) {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
  },
  
  // 金额格式化
  formatMoney(amount, decimals = 2) {
    return '¥' + parseFloat(amount).toFixed(decimals);
  },
  
  // 千分位格式化
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  
  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // 获取页面参数
  getPageParams() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    return currentPage.options || {};
  },
  
  // 跳转外部链接（需配置业务域名）
  openWebView(url) {
    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
    });
  },
  
  // 拨打电话
  makePhoneCall(phoneNumber) {
    wx.makePhoneCall({ phoneNumber });
  },
  
  // 复制到剪贴板
  copyToClipboard(data) {
    wx.setClipboardData({
      data: String(data),
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  },
  
  // 扫码
  scanCode(options = {}) {
    return new Promise((resolve, reject) => {
      wx.scanCode({
        onlyFromCamera: false,
        ...options,
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 获取二维码参数
  getSceneParams(scene) {
    try {
      const decoded = decodeURIComponent(scene);
      const params = {};
      decoded.split('&').forEach(item => {
        const [key, value] = item.split('=');
        params[key] = value;
      });
      return params;
    } catch (e) {
      return {};
    }
  }
};

module.exports = util;
```

---

## 总结

本文档提供了微信小程序前端开发的完整技术实现方案，涵盖：

1. **项目目录结构**：标准化的文件组织和模块划分
2. **技术选型**：原生框架 vs 跨端框架的对比分析
3. **页面路由配置**：完整的路由管理和跳转封装
4. **核心组件设计**：10个常用组件的设计规范和通信方案
5. **状态管理方案**：基于 MobX 的全局状态管理
6. **API封装**：完整的网络请求封装和错误处理
7. **核心功能代码**：登录、列表、表单、上传、定位等完整示例
8. **性能优化**：首屏优化、图片懒加载、虚拟列表、分包加载
9. **开发注意事项**：常见坑点、调试技巧、审核注意事项

建议根据实际业务需求，灵活调整方案中的配置和实现细节。

---

*文档版本：v1.0*  
*最后更新：2024年*
