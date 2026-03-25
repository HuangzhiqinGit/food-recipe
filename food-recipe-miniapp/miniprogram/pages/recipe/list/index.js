const { showSuccess } = require('../../../utils/util')
const recipeService = require('../../../services/recipeService')

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

  // 加载菜谱列表
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
      this.setData({
        recipeList: res.data?.list || []
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

  // 按库存匹配
  async matchByInventory() {
    try {
      wx.showLoading({ title: '匹配中...' })

      const res = await recipeService.getRecipeList({ match: true })
      this.setData({
        recipeList: res.data?.list || [],
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
  }
})
