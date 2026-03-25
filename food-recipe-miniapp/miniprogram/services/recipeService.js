const { get, post } = require('../utils/request')

const recipeService = {
  // 获取菜谱列表
  getRecipeList(params = {}) {
    return get('/recipes', params)
  },

  // 获取菜谱详情
  getRecipeDetail(id) {
    return get(`/recipes/${id}`)
  },

  // 添加个人菜谱
  addRecipe(data) {
    return post('/recipes', data)
  },

  // 收藏/取消收藏
  toggleFavorite(id) {
    return post(`/recipes/${id}/favorite`)
  },

  // 获取收藏列表
  getFavorites() {
    return get('/recipes/favorites')
  },

  // 缺的食材加入购物清单
  addToShopping(id) {
    return post(`/recipes/${id}/add-to-shopping`)
  },

  // 开始烹饪（扣减库存）
  cook(id) {
    return post(`/recipes/${id}/cook`)
  }
}

module.exports = recipeService
