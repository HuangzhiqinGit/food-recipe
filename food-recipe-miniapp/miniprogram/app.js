App({
  globalData: {
    userInfo: null,
    token: null,
    // 开发环境
    // baseUrl: 'http://localhost:8080/api/v1'
    // 生产环境（IP地址）
    // baseUrl: 'http://101.132.126.58:8080/api/v1'
    // 生产环境（域名）
    baseUrl: 'https://hzqstudio.store/api/v1'
  },

  onLaunch() {
    console.log('App Launch')
    // 应用启动时自动尝试微信登录
    this.autoLogin()
  },

  // 自动登录
  autoLogin() {
    const token = wx.getStorageSync('token')
    if (token) {
      // 已有token，验证有效性
      this.globalData.token = token
      this.validateToken(token)
    } else {
      // 没有token，自动获取微信登录凭证
      console.log('没有token，尝试自动登录')
      wx.login({
        success: (res) => {
          if (res.code) {
            this.doAutoLogin(res.code)
          }
        }
      })
    }
  },

  // 执行自动登录
  doAutoLogin(code) {
    const { post } = require('./utils/request')
    post('/auth/login', {
      code: code,
      nickname: '微信用户',
      avatarUrl: ''
    }).then((res) => {
      if (res.code === 200 && res.data) {
        this.setLoginStatus(res.data.token, res.data.userInfo)
        console.log('自动登录成功')
      }
    }).catch((err) => {
      console.log('自动登录失败:', err)
    })
  },

  onShow() {
    console.log('App Show')
  },

  onHide() {
    console.log('App Hide')
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      // 验证token有效性
      this.validateToken(token)
    }
  },

  // 验证token
  validateToken(token) {
    wx.request({
      url: `${this.globalData.baseUrl}/auth/validate`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 200) {
          this.globalData.userInfo = res.data.data
        } else {
          // token无效，清除登录状态
          this.clearLoginStatus()
        }
      },
      fail: () => {
        // 网络错误，继续使用本地token
      }
    })
  },

  // 设置登录状态
  setLoginStatus(token, userInfo) {
    this.globalData.token = token
    this.globalData.userInfo = userInfo
    wx.setStorageSync('token', token)
    wx.setStorageSync('userInfo', userInfo)
  },

  // 清除登录状态
  clearLoginStatus() {
    this.globalData.token = null
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  },

  // 全局错误处理
  onError(msg) {
    console.error('App Error:', msg)
  }
})
