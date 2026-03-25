/**
 * 图片服务 - 处理OSS图片签名URL
 */
const app = getApp()
const { get, post } = require('./request')

// 缓存的签名URL
const urlCache = new Map()
const CACHE_EXPIRE_TIME = 50 * 60 * 1000 // 50分钟缓存（签名有效期1小时）

/**
 * 获取图片签名URL（单张）
 * @param {string} url 原始图片URL
 * @returns {Promise<string>} 带签名的URL
 */
const getSignedImageUrl = async (url) => {
  if (!url || url.includes('Signature=')) {
    return url
  }
  
  // 检查缓存
  const cached = urlCache.get(url)
  if (cached && Date.now() - cached.time < CACHE_EXPIRE_TIME) {
    return cached.signedUrl
  }
  
  try {
    const res = await get('/image/url', { url })
    if (res.code === 200 && res.data) {
      // 缓存结果
      urlCache.set(url, {
        signedUrl: res.data,
        time: Date.now()
      })
      return res.data
    }
  } catch (error) {
    console.error('获取图片签名URL失败:', error)
  }
  
  return url
}

/**
 * 批量获取图片签名URL
 * @param {string[]} urls 原始图片URL数组
 * @returns {Promise<string[]>} 带签名的URL数组
 */
const getSignedImageUrls = async (urls) => {
  if (!urls || urls.length === 0) {
    return urls
  }
  
  // 过滤出需要获取签名的URL
  const needFetch = urls.filter(url => url && !url.includes('Signature='))
  
  if (needFetch.length === 0) {
    return urls
  }
  
  try {
    const res = await post('/image/urls', { urls: needFetch })
    if (res.code === 200 && res.data) {
      // 更新缓存
      res.data.forEach((signedUrl, index) => {
        if (needFetch[index]) {
          urlCache.set(needFetch[index], {
            signedUrl: signedUrl,
            time: Date.now()
          })
        }
      })
      
      // 返回完整列表（保持原有顺序）
      return urls.map(url => {
        if (!url || url.includes('Signature=')) {
          return url
        }
        const idx = needFetch.indexOf(url)
        return idx >= 0 ? res.data[idx] : url
      })
    }
  } catch (error) {
    console.error('批量获取图片签名URL失败:', error)
  }
  
  return urls
}

/**
 * 处理食材列表图片（批量）
 * @param {Array} foodList 食材列表
 * @returns {Promise<Array>} 处理后的食材列表
 */
const processFoodImages = async (foodList) => {
  if (!foodList || foodList.length === 0) {
    return foodList
  }
  
  // 提取所有图片URL
  const urls = foodList.map(item => item.imageUrl).filter(Boolean)
  
  if (urls.length === 0) {
    return foodList
  }
  
  // 批量获取签名URL
  const signedUrls = await getSignedImageUrls(urls)
  
  // 映射回食材列表
  let urlIndex = 0
  return foodList.map(item => {
    if (item.imageUrl) {
      return {
        ...item,
        imageUrl: signedUrls[urlIndex++]
      }
    }
    return item
  })
}

/**
 * 处理菜谱列表图片（批量）
 * @param {Array} recipeList 菜谱列表
 * @returns {Promise<Array>} 处理后的菜谱列表
 */
const processRecipeImages = async (recipeList) => {
  if (!recipeList || recipeList.length === 0) {
    return recipeList
  }
  
  // 提取所有图片URL（coverImage或images[0]）
  const urls = recipeList.map(item => {
    return item.coverImage || (item.images && item.images[0]) || item.image
  }).filter(Boolean)
  
  if (urls.length === 0) {
    return recipeList
  }
  
  // 批量获取签名URL
  const signedUrls = await getSignedImageUrls(urls)
  
  // 映射回菜谱列表
  let urlIndex = 0
  return recipeList.map(item => {
    const originalUrl = item.coverImage || (item.images && item.images[0]) || item.image
    if (originalUrl) {
      return {
        ...item,
        displayImage: signedUrls[urlIndex++]
      }
    }
    return item
  })
}

/**
 * 清除图片URL缓存
 */
const clearImageCache = () => {
  urlCache.clear()
}

module.exports = {
  getSignedImageUrl,
  getSignedImageUrls,
  processFoodImages,
  processRecipeImages,
  clearImageCache
}
