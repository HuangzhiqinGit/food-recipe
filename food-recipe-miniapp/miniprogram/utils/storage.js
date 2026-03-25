const storage = {
  // 设置缓存
  set(key, value, expire = 0) {
    const data = {
      value,
      expire: expire > 0 ? Date.now() + expire * 1000 : 0,
      timestamp: Date.now()
    }
    try {
      wx.setStorageSync(key, data)
      return true
    } catch (e) {
      console.error('Storage set error:', e)
      return false
    }
  },

  // 获取缓存
  get(key, defaultValue = null) {
    try {
      const data = wx.getStorageSync(key)
      if (!data) return defaultValue

      // 检查是否过期
      if (data.expire > 0 && Date.now() > data.expire) {
        this.remove(key)
        return defaultValue
      }

      return data.value
    } catch (e) {
      console.error('Storage get error:', e)
      return defaultValue
    }
  },

  // 移除缓存
  remove(key) {
    try {
      wx.removeStorageSync(key)
      return true
    } catch (e) {
      console.error('Storage remove error:', e)
      return false
    }
  },

  // 清空缓存
  clear() {
    try {
      wx.clearStorageSync()
      return true
    } catch (e) {
      console.error('Storage clear error:', e)
      return false
    }
  }
}

module.exports = storage
