const app = getApp()

// 请求拦截器
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token

    // 检查是否需要认证（登录接口不需要）
    const noAuthUrls = ['/auth/login', '/auth/validate']
    const needAuth = !noAuthUrls.some(url => options.url.includes(url))

    // 需要认证但没有 token，提示登录
    if (needAuth && !token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      reject({ code: 401, message: '请先登录' })
      return
    }

    wx.request({
      url: `${app.globalData.baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data)
          } else if (res.data.code === 401) {
            // token过期，清除登录状态并重新登录
            app.clearLoginStatus()
            wx.showToast({
              title: '登录已过期',
              icon: 'none'
            })
            reject(res.data)
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(res.data)
          }
        } else {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// GET请求
const get = (url, params = {}) => {
  return request({ url, method: 'GET', data: params })
}

// POST请求
const post = (url, data = {}) => {
  return request({ url, method: 'POST', data })
}

// PUT请求
const put = (url, data = {}) => {
  return request({ url, method: 'PUT', data })
}

// DELETE请求
const del = (url, data = {}) => {
  return request({ url, method: 'DELETE', data })
}

// 上传文件
const upload = (url, filePath, formData = {}) => {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token
    const fullUrl = `${app.globalData.baseUrl}${url}`
    
    console.log('upload 请求:', fullUrl)
    console.log('filePath:', filePath)
    console.log('token:', token ? '已设置' : '未设置')

    wx.uploadFile({
      url: fullUrl,
      filePath: filePath,
      name: 'file',
      formData: formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        console.log('uploadFile success, statusCode:', res.statusCode)
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            resolve(data)
          } else {
            wx.showToast({
              title: data.message || '上传失败',
              icon: 'none'
            })
            reject(data)
          }
        } else {
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        console.error('uploadFile fail:', err)
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  upload
}
