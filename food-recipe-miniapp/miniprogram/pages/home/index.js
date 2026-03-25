const app = getApp()
const { getFoodStatus } = require('../../utils/util')
const foodService = require('../../services/foodService')
const recipeService = require('../../services/recipeService')

Page({
  data: {
    userInfo: {},
    expiringCount: 0,
    recommendRecipes: []
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo || {}
    })
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  // 加载数据
  async loadData() {
    // 未登录不加载需要认证的数据
    if (!app.globalData.token) {
      return
    }
    await this.loadExpiringCount()
    await this.loadRecommendRecipes()
  },

  // 获取临期食材数量
  async loadExpiringCount() {
    try {
      const res = await foodService.getExpiringCount()
      this.setData({
        expiringCount: res.data || 0
      })
    } catch (error) {
      console.error('获取临期食材失败:', error)
    }
  },

  // 获取推荐菜谱
  async loadRecommendRecipes() {
    try {
      const res = await recipeService.getRecipeList({ limit: 4 })
      this.setData({
        recommendRecipes: res.data?.list || []
      })
    } catch (error) {
      console.error('获取推荐菜谱失败:', error)
    }
  },

  // 刷新推荐
  refreshRecipes() {
    this.loadRecommendRecipes()
  },

  // 跳转到食材列表
  goToFoodList() {
    wx.switchTab({
      url: '/pages/food/list/index'
    })
  },

  // 跳转到菜谱详情
  goToRecipeDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/recipe/detail/index?id=${id}`
    })
  }
})
