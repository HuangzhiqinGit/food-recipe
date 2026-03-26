const { post } = require('../utils/request')
const { upload } = require('../utils/request')

// 上传图片并识别食材
const scanAndRecognize = (filePath) => {
  return upload('/food/scan', filePath, {})
}

// OCR识别（旧接口，保留兼容）
const recognize = (image) => {
  return post('/ocr/recognize', { image })
}

module.exports = {
  scanAndRecognize,
  recognize
}