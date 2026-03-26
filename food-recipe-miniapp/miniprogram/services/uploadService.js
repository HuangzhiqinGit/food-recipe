const { post, upload, get } = require('../utils/request')

// 上传图片
const uploadImage = (filePath, type = 'food') => {
  return upload('/upload/image', filePath, { type })
}

// 获取签名URL
const getSignedUrl = (path) => {
  return get('/upload/signed-url', { path })
}

// 获取上传凭证
const getUploadToken = () => {
  return get('/upload/token')
}

module.exports = {
  uploadImage,
  getSignedUrl,
  getUploadToken
}
