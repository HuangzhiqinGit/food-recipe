const { showSuccess, showError } = require('../../../utils/util')
const recipeService = require('../../../services/recipeService')
const shoppingService = require('../../../services/shoppingService')

// 食材分类名称映射
const CATEGORY_MAP = {
  vegetable: '蔬菜',
  meat: '肉类',
  seafood: '海鲜',
  egg: '蛋奶',
  staple: '主食',
  seasoning: '调料',
  drink: '酒水',
  other: '其他'
}

Page({
  data: {
    recipeId: null,
    recipe: {},
    images: [],
    ingredients: [],
    steps: [],
    showCookModal: false,
    cookIngredients: []
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ recipeId: options.id })
      this.loadRecipeDetail(options.id)
    }
  },

  // 加载菜谱详情
  async loadRecipeDetail(id) {
    try {
      const res = await recipeService.getRecipeDetail(id)
      const recipe = res.data

      // 解析JSON字段
      let ingredients = JSON.parse(recipe.ingredients || '[]')
      const steps = JSON.parse(recipe.steps || '[]')
      const images = recipe.images ? JSON.parse(recipe.images) : []

      // 为食材添加分类名称
      ingredients = ingredients.map(item => ({
        ...item,
        categoryName: CATEGORY_MAP[item.category] || '其他'
      }))

      this.setData({
        recipe: recipe,
        images: images,
        ingredients: ingredients,
        steps: steps
      })
    } catch (error) {
      console.error('加载菜谱详情失败:', error)
      showError('加载失败')
    }
  },

  // 收藏/取消收藏
  async toggleFavorite() {
    try {
      const { recipeId, recipe } = this.data
      await recipeService.toggleFavorite(recipeId)

      this.setData({
        'recipe.isFavorite': !recipe.isFavorite
      })

      showSuccess(recipe.isFavorite ? '取消收藏' : '收藏成功')
    } catch (error) {
      console.error('收藏操作失败:', error)
      showError('操作失败')
    }
  },

  // 缺的食材加入购物清单
  addToShopping() {
    const { ingredients, recipeId } = this.data
    
    // 筛选缺少的食材
    const missingIngredients = ingredients.filter(item => !item.hasStock)
    
    if (missingIngredients.length === 0) {
      showSuccess('所有食材库存充足')
      return
    }

    // 构建确认框内容，展示食材列表
    const itemsList = missingIngredients.map(item => 
      `• ${item.name} ${item.quantity}${item.unit || ''}`
    ).join('\n')
    const content = `${itemsList}\n\n共 ${missingIngredients.length} 个食材`

    wx.showModal({
      title: '确认添加',
      content: content,
      confirmText: '添加',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          await this.doAddToShopping(missingIngredients, recipeId)
        }
      }
    })
  },

  // 执行添加操作
  async doAddToShopping(missingIngredients, recipeId) {
    try {
      wx.showLoading({ title: '添加中...' })
      
      // 逐个添加到购物清单
      for (const item of missingIngredients) {
        await shoppingService.addItem({
          foodName: item.name,
          quantity: `${item.quantity}${item.unit || ''}`,
          category: item.category || '', // 传递分类
          fromRecipeId: recipeId
        })
      }
      
      wx.hideLoading()
      
      // 询问是否跳转到购物清单（成功提示在跳转弹窗中）
      wx.showModal({
        title: `已添加 ${missingIngredients.length} 个食材`,
        content: '是否跳转到购物清单？',
        confirmText: '去查看',
        cancelText: '留在当前页',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/shopping/list/index'
            })
          }
        }
      })
    } catch (error) {
      wx.hideLoading()
      console.error('添加到购物清单失败:', error)
      showError('添加失败')
    }
  },

  // 开始烹饪
  startCooking() {
    const { ingredients } = this.data
    this.setData({
      showCookModal: true,
      cookIngredients: ingredients
    })
  },

  // 隐藏烹饪弹窗
  hideCookModal() {
    this.setData({ showCookModal: false })
  },

  // 确认烹饪
  async confirmCook() {
    const { recipeId } = this.data
    
    try {
      wx.showLoading({ title: '烹饪中...' })
      const res = await recipeService.cook(recipeId)
      wx.hideLoading()
      
      const result = res.data
      const deducted = result.deducted || []
      const insufficient = result.insufficient || []
      
      this.hideCookModal()
      
      if (insufficient.length > 0) {
        const names = insufficient.map(i => i.name).join('、')
        wx.showModal({
          title: '库存不足',
          content: `${names} 库存不足，已扣减其他食材`,
          showCancel: false
        })
      } else {
        showSuccess('烹饪成功！')
      }
    } catch (error) {
      wx.hideLoading()
      console.error('烹饪失败:', error)
      showError('烹饪失败')
    }
  }
})
