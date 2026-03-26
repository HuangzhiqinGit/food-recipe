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
        console.log('获取到微信用户信息:', wxUserInfo)
        this.doLogin(code, wxUserInfo)
      },
      fail: () => {
        // 用户拒绝授权，使用默认信息登录
        console.log('用户拒绝授权，使用默认信息登录')
        this.doLogin(code, { nickName: '微信用户', avatarUrl: '' })
      }
    })
  },
  
  // 执行登录请求 - 修改：保存微信昵称和头像
  doLogin(code, wxUserInfo) {
    console.log('调用后端登录接口, code:', code, '用户信息:', wxUserInfo)
    
    const data = {
      code: code,
      nickname: wxUserInfo.nickName,
      avatarUrl: wxUserInfo.avatarUrl
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
          console.log('开始上传图片:', tempFilePath)
          const result = await uploadService.uploadImage(tempFilePath, 'avatar')
          console.log('上传结果:', result)
          
          if (result.code === 200 && result.data) {
            // result.data 现在是完整的带签名 URL
            const fullImageUrl = result.data
            console.log('获取到完整图片URL:', fullImageUrl)
            
            // 从完整URL中提取路径（用于保存到数据库）
            // URL 格式: https://xxx.oss-cn-xxx.aliyuncs.com/foods/xxx.png?Signature=xxx
            let pathForDb = fullImageUrl
            try {
              const urlObj = new URL(fullImageUrl)
              // 去掉开头的 /
              pathForDb = urlObj.pathname.substring(1)
              // 如果路径包含签名参数，去掉它们
              if (pathForDb.includes('?')) {
                pathForDb = pathForDb.split('?')[0]
              }
            } catch (e) {
              console.log('解析URL失败，使用原始值:', e)
            }
            console.log('提取的路径用于数据库:', pathForDb)
            
            // 更新本地数据（使用完整URL显示）
            const userInfo = { ...this.data.userInfo, avatarUrl: fullImageUrl }
            this.setData({ userInfo })
            
            // 更新全局数据
            app.globalData.userInfo = userInfo
            
            // 调用后端更新用户信息（保存路径到数据库）
            console.log('开始调用 updateUserInfo, 参数:', { avatarUrl: pathForDb })
            const updateResult = await this.updateUserInfo({ avatarUrl: pathForDb })
            console.log('updateUserInfo 返回:', updateResult)
            
            // 如果后端返回了新的完整URL，更新显示
            if (updateResult.code === 200 && updateResult.data && updateResult.data.avatarUrl) {
              const updatedUserInfo = { ...this.data.userInfo, avatarUrl: updateResult.data.avatarUrl }
              this.setData({ userInfo: updatedUserInfo })
              app.globalData.userInfo = updatedUserInfo
            }
            
            wx.showToast({ title: '头像更新成功', icon: 'success' })
          } else {
            console.error('上传失败, result:', result)
            wx.showToast({ title: '上传失败', icon: 'none' })
          }
        } catch (error) {
          console.error('上传头像失败, 错误详情:', error)
          wx.showToast({ title: '上传失败', icon: 'none' })
        } finally {
          wx.hideLoading()
        }
      }
    })
  },

  // 更新用户信息 - 新增
  async updateUserInfo(data) {
    console.log('updateUserInfo 被调用, 数据:', data)
    try {
      console.log('开始调用 authService.updateUserInfo')
      const result = await authService.updateUserInfo(data)
      console.log('authService.updateUserInfo 返回:', result)
      return result
    } catch (error) {
      console.error('更新用户信息失败, 错误:', error)
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
