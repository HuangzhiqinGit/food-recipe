const { get, post, put, delete: del } = require('../utils/request')

const shoppingService = {
  // 获取购物清单
  getList() {
    return get('/shopping')
  },

  // 添加清单项
  addItem(data) {
    return post('/shopping', data)
  },

  // 从菜谱添加缺失的食材
  addFromRecipe(recipeId) {
    return post(`/shopping/from-recipe/${recipeId}`)
  },

  // 切换购买状态
  toggleStatus(id) {
    return put(`/shopping/${id}/toggle`)
  },

  // 删除清单项
  deleteItem(id) {
    return del(`/shopping/${id}`)
  },

  // 清空清单
  clearList() {
    return del('/shopping/clear')
  },

  // 批量入库
  batchStock(data) {
    return post('/shopping/batch-stock', data)
  },

  // 获取历史清单
  getHistory() {
    return get('/shopping/history')
  },

  // 再次购买
  repurchase(historyId) {
    return post(`/shopping/repurchase/${historyId}`)
  }
}

module.exports = shoppingService
