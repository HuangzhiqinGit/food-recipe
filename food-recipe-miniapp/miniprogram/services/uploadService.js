const { post, upload } = require('../utils/request')

// 上传图片
const uploadImage = (filePath, type = 'food') => {
  return upload('/upload/image', filePath, { type })
}

// 获取上传凭证
const getUploadToken = () => {
  return get('/upload/token')
}

module.exports = {
  uploadImage,
  getUploadToken
}
