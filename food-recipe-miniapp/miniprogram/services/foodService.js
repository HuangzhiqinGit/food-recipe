const { get, post, put, delete: del } = require('../utils/request')

const foodService = {
  // 获取食材列表
  getFoodList(params = {}) {
    return get('/foods', params)
  },

  // 获取食材详情
  getFoodDetail(id) {
    return get(`/foods/${id}`)
  },

  // 新增食材
  addFood(data) {
    return post('/foods', data)
  },

  // 编辑食材
  updateFood(id, data) {
    return put(`/foods/${id}`, data)
  },

  // 删除食材
  deleteFood(id) {
    return del(`/foods/${id}`)
  },

  // 标记用完
  finishFood(id) {
    return post(`/foods/${id}/finish`)
  },

  // 获取临期食材数量
  getExpiringCount() {
    return get('/foods/expiring/count')
  }
}

module.exports = foodService
