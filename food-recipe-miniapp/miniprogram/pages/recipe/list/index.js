const { showSuccess } = require('../../../utils/util')
const recipeService = require('../../../services/recipeService')
const imageService = require('../../../services/imageService')

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
    currentTab: 'recommend',
    recipeList: [],
    filterType: '',
    filterDuration: ''
  },

  onLoad() {
    this.loadRecipeList()
  },

  onShow() {
    this.loadRecipeList()
  },

  // 加载菜谱列表 - 处理图片签名
  async loadRecipeList() {
    try {
      const { currentTab, filterType, filterDuration } = this.data

      const params = {
        isFavorite: currentTab === 'favorite'
      }

      if (filterType) {
        params.type = filterType
      }
      if (filterDuration) {
        params.duration = filterDuration
      }

      const res = await recipeService.getRecipeList(params)
      let list = res.data?.list || []
      
      // 为菜谱添加显示图片
      list = list.map(recipe => {
        let imageUrl = recipe.image || recipe.coverImage || (recipe.images && recipe.images[0])
        
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
      list = await imageService.processRecipeImages(list)
      
      this.setData({
        recipeList: list
      })
    } catch (error) {
      console.error('获取菜谱列表失败:', error)
    }
  },

  // 切换标签
  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.tab
    })
    this.loadRecipeList()
  },

  // 按库存匹配 - 处理图片签名
  async matchByInventory() {
    try {
      wx.showLoading({ title: '匹配中...' })

      const res = await recipeService.getRecipeList({ match: true })
      let list = res.data?.list || []
      
      // 为菜谱添加显示图片
      list = list.map(recipe => {
        let imageUrl = recipe.image || recipe.coverImage || (recipe.images && recipe.images[0])
        
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
      list = await imageService.processRecipeImages(list)
      
      this.setData({
        recipeList: list,
        currentTab: 'recommend'
      })

      wx.hideLoading()
    } catch (error) {
      wx.hideLoading()
      console.error('库存匹配失败:', error)
    }
  },

  // 跳转到筛选页
  goToFilter() {
    wx.navigateTo({
      url: '/pages/recipe/filter/index'
    })
  },

  // 跳转到添加菜谱
  goToAddRecipe() {
    wx.navigateTo({
      url: '/pages/recipe/add/index'
    })
  },

  // 跳转到菜谱详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/recipe/detail/index?id=${id}`
    })
  },

  // 跳转到食材列表
  goToFoodList() {
    wx.switchTab({
      url: '/pages/food/list/index'
    })
  },
  
  // 图片加载失败处理
  onImageError(e) {
    const index = e.currentTarget.dataset.index
    const recipeList = this.data.recipeList
    
    console.error(`菜谱图片 ${index} 加载失败:`, recipeList[index].displayImage)
    
    // 使用默认图片替换
    recipeList[index].displayImage = DEFAULT_RECIPE_IMAGES['默认']
    
    this.setData({
      recipeList: recipeList
    })
  }
})
