const app = getApp()
const { showConfirm, showSuccess } = require('../../utils/util')
const foodService = require('../../services/foodService')
const recipeService = require('../../services/recipeService')
const authService = require('../../services/authService')
const uploadService = require('../../services/uploadService')

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

  // 微信登录 - 自动登录并获取用户信息
  wxLogin() {
    wx.showLoading({ title: '登录中...', mask: true })
    
    // 获取微信登录凭证
    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          wx.hideLoading()
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
          return
        }
        
        // 获取微信用户信息
        this.getWxUserProfile(loginRes.code)
      },
      fail: (err) => {
        console.error('wx.login 失败:', err)
        wx.hideLoading()
        wx.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
    })
  },

  // 获取微信用户信息 - 新增
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
  
  // 执行登录请求 - 修改：保存微信昵称和头像
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

  // 修改头像 - 新增
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
            // result.data 是 OSS 路径，保存到数据库
            const ossPath = result.data
            
            // 调用后端更新用户信息（保存OSS路径到数据库）
            await this.updateUserInfo({ avatarUrl: ossPath })
            
            // 立即获取签名URL用于显示
            const signedUrlRes = await uploadService.getSignedUrl(ossPath)
            const displayUrl = signedUrlRes.code === 200 ? signedUrlRes.data : ''
            
            // 更新本地数据（使用带签名URL显示）
            const userInfo = { ...this.data.userInfo, avatarUrl: displayUrl }
            this.setData({ userInfo })
            
            // 更新全局数据
            app.globalData.userInfo = userInfo
            
            wx.showToast({ title: '头像更新成功', icon: 'success' })
          } else {
            wx.showToast({ title: '上传失败', icon: 'none' })
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

  // 更新用户信息 - 新增
  async updateUserInfo(data) {
    try {
      const result = await authService.updateUserInfo(data)
      return result
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
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
