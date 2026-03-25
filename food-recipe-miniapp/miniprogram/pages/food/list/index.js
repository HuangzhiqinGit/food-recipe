const app = getApp()
const { debounce, showConfirm, showSuccess } = require('../../../utils/util')
const foodService = require('../../../services/foodService')
const authService = require('../../../services/authService')
const imageService = require('../../../services/imageService')

Page({
  data: {
    keyword: '',
    currentCategory: 'all',
    categories: [
      { label: '全部', value: 'all' },
      { label: '蔬菜', value: 'vegetable' },
      { label: '肉类', value: 'meat' },
      { label: '海鲜', value: 'seafood' },
      { label: '蛋奶', value: 'egg' },
      { label: '主食', value: 'staple' },
      { label: '调料', value: 'seasoning' },
      { label: '酒水', value: 'drink' }
    ],
    currentStatus: 'all',
    statusList: [
      { label: '全部', value: 'all' },
      { label: '新鲜', value: 'fresh' },
      { label: '临期', value: 'expiring' },
      { label: '已过期', value: 'expired' }
    ],
    foodList: [],
    isLogin: false
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    // 检查是否有从首页传入的筛选参数
    this.checkGlobalFilter()
    this.checkLogin()
  },

  // 检查全局筛选参数（从首页跳转过来）
  checkGlobalFilter() {
    if (app.globalData.foodFilter) {
      const filter = app.globalData.foodFilter
      this.setData({
        currentStatus: filter.status || 'all'
      })
      // 清除全局参数，避免重复触发
      app.globalData.foodFilter = null
    }
  },

  // 检查登录状态
  checkLogin() {
    const isLogin = !!app.globalData.token
    this.setData({ isLogin })
    if (isLogin) {
      this.loadFoodList()
    }
  },

  // 格式化日期时间
  formatDateTime(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  },

  // 计算过期倒计时
  getExpireCountdown(expireDate) {
    if (!expireDate) return ''
    
    const now = new Date()
    const expire = new Date(expireDate)
    const diffTime = expire - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `已过期${Math.abs(diffDays)}天`
    } else if (diffDays === 0) {
      return '今天过期'
    } else {
      return `剩余${diffDays}天`
    }
  },

  // 根据过期日期计算状态
  getStatusByExpireDate(expireDate) {
    if (!expireDate) return { status: 'fresh', statusText: '新鲜' }
    
    const now = new Date()
    const expire = new Date(expireDate)
    const diffTime = expire - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { status: 'expired', statusText: '已过期' }
    } else if (diffDays <= 3) {
      return { status: 'expiring', statusText: '临期' }
    } else {
      return { status: 'fresh', statusText: '新鲜' }
    }
  },

  // 加载食材列表 - 修复：状态筛选生效，图片添加签名
  async loadFoodList() {
    try {
      const params = {}
      if (this.data.currentCategory !== 'all') {
        params.category = this.data.currentCategory
      }
      if (this.data.keyword) {
        params.keyword = this.data.keyword
      }

      const res = await foodService.getFoodList(params)
      let list = res.data?.list || []
      
      // 格式化数据并计算状态
      list = list.map(item => {
        const statusInfo = this.getStatusByExpireDate(item.expireDate)
        return {
          ...item,
          createdAt: this.formatDateTime(item.createdAt),
          updatedAt: this.formatDateTime(item.updatedAt),
          status: statusInfo.status,
          statusText: statusInfo.statusText,
          expireCountdown: this.getExpireCountdown(item.expireDate)
        }
      })
      
      // 状态筛选（前端筛选）
      if (this.data.currentStatus !== 'all') {
        list = list.filter(item => item.status === this.data.currentStatus)
      }
      
      // 处理图片签名
      list = await imageService.processFoodImages(list)
      
      this.setData({
        foodList: list
      })
    } catch (error) {
      console.error('获取食材列表失败:', error)
    }
  },

  // 搜索输入
  onSearchInput: debounce(function(e) {
    this.setData({
      keyword: e.detail.value
    })
    this.loadFoodList()
  }, 300),

  // 选择分类
  selectCategory(e) {
    this.setData({
      currentCategory: e.currentTarget.dataset.value
    })
    this.loadFoodList()
  },

  // 选择状态 - 修复：筛选生效
  selectStatus(e) {
    this.setData({
      currentStatus: e.currentTarget.dataset.value
    })
    this.loadFoodList()
  },

  // 跳转到新增
  goToAddFood() {
    wx.navigateTo({
      url: '/pages/food/edit/index'
    })
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/food/detail/index?id=${id}`
    })
  },

  // 长按显示操作菜单
  showActionSheet(e) {
    const item = e.currentTarget.dataset.item
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 编辑
          wx.navigateTo({
            url: `/pages/food/edit/index?id=${item.id}`
          })
        } else if (res.tapIndex === 1) {
          // 删除
          this.deleteFood(item.id)
        }
      }
    })
  },

  // 删除食材
  async deleteFood(id) {
    const confirmed = await showConfirm('确认删除', '确定要删除这个食材吗？')
    if (!confirmed) return

    try {
      await foodService.deleteFood(id)
      showSuccess('删除成功')
      this.loadFoodList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  },

  // 快捷添加
  quickAdd(e) {
    const name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: `/pages/food/edit/index?name=${name}`
    })
  },

  // 去登录 - 直接弹出微信授权并自动登录
  goToLogin() {
    console.log('点击去登录，开始微信授权登录')
    
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
        
        // 调用后端登录接口（后端会自动注册用户）
        authService.login({
          code: loginRes.code,
          nickname: '微信用户',
          avatarUrl: ''
        }).then((loginData) => {
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
          
          // 刷新页面数据
          this.checkLogin()
        }).catch((error) => {
          console.error('登录失败:', error)
          wx.hideLoading()
          wx.showToast({
            title: error.message || '登录失败',
            icon: 'none',
            duration: 2000
          })
        })
      },
      fail: (err) => {
        console.error('wx.login 失败:', err)
        wx.hideLoading()
        wx.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
    })
  },
  
  // 图片加载失败处理
  onImageError(e) {
    const index = e.currentTarget.dataset.index
    const foodList = this.data.foodList
    
    console.error(`食材图片 ${index} 加载失败:`, foodList[index].imageUrl)
    
    // 设置默认图片
    foodList[index].imageUrl = '/assets/images/empty-food.png'
    
    this.setData({
      foodList: foodList
    })
  }
})
