const { post, get, put } = require('../utils/request')

// 登录
const login = (data) => {
  return post('/auth/login', data)
}

// 验证token
const validateToken = () => {
  return get('/auth/validate')
}

// 更新用户信息
const updateUserInfo = (data) => {
  return put('/user/update', data)
}

module.exports = {
  login,
  validateToken,
  updateUserInfo
}
