const app = getApp()
const { showConfirm, showSuccess } = require('../../utils/util')
const foodService = require('../../services/foodService')
const recipeService = require('../../services/recipeService')
const authService = require('../../services/authService')

Page({
  data: {
    userInfo: {},
    isLogin: false,
    stats: {
      foodCount: 0,
      recipeCount: 0,
      favoriteCount: 0
    }
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLogin = !!app.globalData.token
    this.setData({
      isLogin,
      userInfo: app.globalData.userInfo || {}
    })
    if (isLogin) {
      this.loadStats()
    }
  },

  // 微信登录 - 自动登录（用户不存在则自动注册）
  wxLogin() {
    console.log('======== 点击登录按钮，开始自动登录 ========')
    
    wx.showLoading({ title: '登录中...', mask: true })
    
    // 获取微信登录凭证
    wx.login({
      success: (loginRes) => {
        console.log('wx.login 成功, code:', loginRes.code)
        
        if (!loginRes.code) {
          wx.hideLoading()
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
          return
        }
        
        // 直接调用后端登录接口（后端会自动注册用户）
        this.doLogin(loginRes.code)
      },
      fail: (err) => {
        console.error('wx.login 失败:', err)
        wx.hideLoading()
        wx.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
    })
  },
  
  // 执行登录请求
  doLogin(code) {
    console.log('调用后端登录接口, code:', code)
    
    const data = {
      code: code,
      nickname: '微信用户',
      avatarUrl: ''
    }
    
    authService.login(data)
      .then((loginData) => {
        console.log('后端登录返回:', loginData)
        
        if (!loginData || loginData.code !== 200) {
          throw new Error(loginData?.message || '登录失败')
        }
        
        if (!loginData.data || !loginData.data.token) {
          throw new Error('登录返回数据异常')
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
        wx.showToast({
          title: error.message || '登录失败',
          icon: 'none',
          duration: 2000
        })
      })
  },

  // 加载统计数据
  loadStats() {
    // 获取食材数量
    foodService.getFoodList()
      .then((foodRes) => {
        const foodCount = foodRes.data?.list?.length || 0
        this.setData({ 'stats.foodCount': foodCount })
      })
      .catch((error) => {
        console.error('获取食材数量失败:', error)
      })
    
    // 获取收藏数量
    recipeService.getFavorites()
      .then((favRes) => {
        const favoriteCount = favRes.data?.list?.length || 0
        this.setData({ 'stats.favoriteCount': favoriteCount })
      })
      .catch((error) => {
        console.error('获取收藏数量失败:', error)
      })
  },

  // 跳转到食材列表
  goToFoodList() {
    wx.switchTab({
      url: '/pages/food/list/index'
    })
  },

  // 跳转到菜谱列表
  goToRecipeList() {
    wx.switchTab({
      url: '/pages/recipe/list/index'
    })
  },

  // 跳转到收藏
  goToFavorites() {
    wx.switchTab({
      url: '/pages/recipe/list/index'
    })
    // 切换到收藏标签
    const pages = getCurrentPages()
    const recipePage = pages.find(p => p.route === 'pages/recipe/list/index')
    if (recipePage) {
      recipePage.setData({ currentTab: 'favorite' })
      recipePage.loadRecipeList()
    }
  },

  // 跳转到购物清单
  goToShoppingList() {
    wx.switchTab({
      url: '/pages/shopping/list/index'
    })
  },

  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '家庭食材&菜谱管理小程序 v1.0\n\n智能管理食材，轻松搞定一日三餐',
      showCancel: false
    })
  },

  // 意见反馈
  showFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的反馈！请发送邮件至 feedback@example.com',
      showCancel: false
    })
  },

  // 退出登录
  logout() {
    showConfirm('确认退出', '确定要退出登录吗？')
      .then((confirmed) => {
        if (!confirmed) return
        
        app.clearLoginStatus()
        showSuccess('已退出登录')
        
        // 重新加载页面
        wx.reLaunch({
          url: '/pages/home/index'
        })
      })
  }
})
