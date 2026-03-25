const { post, get } = require('../utils/request')

// 登录
const login = (data) => {
  return post('/auth/login', data)
}

// 验证token
const validateToken = () => {
  return get('/auth/validate')
}

module.exports = {
  login,
  validateToken
}
