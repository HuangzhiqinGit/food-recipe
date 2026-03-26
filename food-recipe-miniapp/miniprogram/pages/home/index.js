const app = getApp()
const { getFoodStatus } = require('../../utils/util')
const foodService = require('../../services/foodService')
const recipeService = require('../../services/recipeService')
const imageService = require('../../services/imageService')

// 默认菜谱示例图片
const DEFAULT_RECIPE_IMAGES = {
  '家常菜': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  '素食': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  '荤菜': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop',
  '汤品': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
  '早餐': 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=300&fit=crop',
  '快手菜': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  '默认': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop'
}

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

  // 获取推荐菜谱 - 优先展示收藏，默认6个，处理图片签名
  async loadRecommendRecipes() {
    try {
      // 先尝试获取收藏的菜谱
      let recipes = []
      
      // 获取收藏列表
      const favRes = await recipeService.getFavorites()
      const favorites = favRes.data?.list || []
      
      // 如果收藏不足6个，补充推荐菜谱
      if (favorites.length < 6) {
        // 获取推荐菜谱，补充到6个
        const needCount = 6 - favorites.length
        const recommendRes = await recipeService.getRecipeList({ limit: needCount })
        const recommends = recommendRes.data?.list || []
        
        // 合并，去重（避免收藏也在推荐中）
        const favIds = favorites.map(f => f.id)
        const uniqueRecommends = recommends.filter(r => !favIds.includes(r.id))
        
        recipes = [...favorites, ...uniqueRecommends].slice(0, 6)
      } else {
        recipes = favorites.slice(0, 6)
      }
      
      // 为菜谱添加默认图片
      recipes = recipes.map(recipe => {
        let imageUrl = recipe.coverImage || (recipe.images && recipe.images[0])
        
        // 如果没有图片，根据类型使用默认图片
        if (!imageUrl) {
          const typeName = recipe.typeName || '默认'
          imageUrl = DEFAULT_RECIPE_IMAGES[typeName] || DEFAULT_RECIPE_IMAGES['默认']
        }
        
        return {
          ...recipe,
          displayImage: imageUrl
        }
      })
      
      // 处理OSS图片签名
      recipes = await imageService.processRecipeImages(recipes)
      
      this.setData({
        recommendRecipes: recipes
      })
    } catch (error) {
      console.error('获取推荐菜谱失败:', error)
    }
  },

  // 刷新推荐
  refreshRecipes() {
    this.loadRecommendRecipes()
  },

  // 跳转到食材列表 - 修复：点击临期提醒时自动过滤
  goToFoodList() {
    // 如果有临期食材，传递筛选参数
    const filterExpiring = this.data.expiringCount > 0
    
    if (filterExpiring) {
      // 使用全局数据传递筛选参数
      app.globalData.foodFilter = { status: 'expiring' }
    }
    
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
  },
  
  // 图片加载失败处理
  onImageError(e) {
    const index = e.currentTarget.dataset.index
    const recipes = this.data.recommendRecipes
    
    // 使用默认图片替换
    recipes[index].displayImage = DEFAULT_RECIPE_IMAGES['默认']
    
    this.setData({
      recommendRecipes: recipes
    })
  },

  // 阻止固定区域触摸事件冒泡
  preventScroll() {
    return false
  }
})
