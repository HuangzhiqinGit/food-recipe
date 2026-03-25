const { showConfirm, showSuccess, showError } = require('../../../utils/util')
const foodService = require('../../../services/foodService')

Page({
  data: {
    foodId: null,
    food: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ foodId: options.id })
      this.loadFoodDetail(options.id)
    } else {
      showError('参数错误')
      wx.navigateBack()
    }
  },

  // 加载食材详情
  async loadFoodDetail(id) {
    try {
      this.setData({ loading: true })
      const res = await foodService.getFoodDetail(id)
      this.setData({
        food: res.data,
        loading: false
      })
    } catch (error) {
      console.error('加载食材详情失败:', error)
      this.setData({ loading: false })
      showError('加载失败')
    }
  },

  // 获取分类名称
  getCategoryName(category) {
    const map = {
      vegetable: '蔬菜',
      meat: '肉类',
      seafood: '海鲜',
      egg: '蛋奶',
      staple: '主食',
      seasoning: '调料',
      drink: '酒水'
    }
    return map[category] || '其他'
  },

  // 获取分类图标
  getCategoryIcon(category) {
    const map = {
      vegetable: '🥬',
      meat: '🥩',
      seafood: '🦐',
      egg: '🥚',
      staple: '🍚',
      seasoning: '🧂',
      drink: '🥤'
    }
    return map[category] || '📦'
  },

  // 计算剩余天数
  getRemainingDays(expireDate) {
    if (!expireDate) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expire = new Date(expireDate)
    const diff = Math.ceil((expire - today) / (1000 * 60 * 60 * 24))
    return diff
  },

  // 获取状态标签
  getStatusLabel(remainingDays) {
    if (remainingDays === null) return { text: '无过期日期', type: 'normal' }
    if (remainingDays < 0) return { text: `已过期 ${Math.abs(remainingDays)} 天`, type: 'expired' }
    if (remainingDays === 0) return { text: '今天过期', type: 'warning' }
    if (remainingDays <= 3) return { text: `${remainingDays} 天后过期`, type: 'warning' }
    return { text: `${remainingDays} 天后过期`, type: 'normal' }
  },

  // 跳转到编辑
  goToEdit() {
    wx.navigateTo({
      url: `/pages/food/edit/index?id=${this.data.foodId}`
    })
  },

  // 删除食材
  async deleteFood() {
    const confirmed = await showConfirm('确认删除', '确定要删除这个食材吗？')
    if (!confirmed) return

    try {
      await foodService.deleteFood(this.data.foodId)
      showSuccess('删除成功')
      // 返回上一页并刷新
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.loadFoodList) {
        prevPage.loadFoodList()
      }
      wx.navigateBack()
    } catch (error) {
      console.error('删除失败:', error)
      showError('删除失败')
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadFoodDetail(this.data.foodId)
    wx.stopPullDownRefresh()
  }
})
