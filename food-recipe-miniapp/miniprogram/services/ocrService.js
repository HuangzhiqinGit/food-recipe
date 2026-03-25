const { post } = require('../utils/request')

// OCR识别
const recognize = (image) => {
  return post('/ocr/recognize', { image })
}

module.exports = {
  recognize
}
