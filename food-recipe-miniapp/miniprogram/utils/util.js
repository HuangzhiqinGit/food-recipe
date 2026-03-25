// 格式化日期
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
}

// 计算剩余天数
const getDaysLeft = (expireDate) => {
  if (!expireDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expire = new Date(expireDate)
  expire.setHours(0, 0, 0, 0)

  const diffTime = expire - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// 获取食材状态
const getFoodStatus = (expireDate) => {
  const daysLeft = getDaysLeft(expireDate)
  if (daysLeft === null) return { code: 0, text: '新鲜', color: '#4CAF50' }
  if (daysLeft < 1) return { code: 2, text: '已过期', color: '#F44336' }
  if (daysLeft <= 3) return { code: 1, text: `临期 ${daysLeft}天`, color: '#FF9800' }
  return { code: 0, text: '新鲜', color: '#4CAF50' }
}

// 防抖
const debounce = (fn, delay = 300) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流
const throttle = (fn, interval = 300) => {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 显示确认弹窗
const showConfirm = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

// 显示成功提示
const showSuccess = (title = '操作成功') => {
  wx.showToast({
    title,
    icon: 'success'
  })
}

// 显示错误提示
const showError = (title = '操作失败') => {
  wx.showToast({
    title,
    icon: 'none'
  })
}

module.exports = {
  formatDate,
  getDaysLeft,
  getFoodStatus,
  debounce,
  throttle,
  showConfirm,
  showSuccess,
  showError
}
