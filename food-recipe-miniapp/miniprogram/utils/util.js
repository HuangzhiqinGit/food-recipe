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

// 格式化日期时间（完整格式）
const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
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

// 获取食材状态（优化后，返回更详细的信息）
const getFoodStatus = (expireDate) => {
  const daysLeft = getDaysLeft(expireDate)
  if (daysLeft === null) return { 
    code: 0, 
    text: '无过期日期', 
    type: 'normal',
    color: '#4CAF50',
    bgGradient: 'linear-gradient(135deg, #52c234 0%, #22b322 100%)',
    icon: '✅'
  }
  if (daysLeft < 0) return { 
    code: 2, 
    text: `已过期 ${Math.abs(daysLeft)} 天`, 
    type: 'expired',
    color: '#F44336',
    bgGradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
    icon: '⚠️'
  }
  if (daysLeft === 0) return { 
    code: 1, 
    text: '今天过期', 
    type: 'warning',
    color: '#FF9800',
    bgGradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    icon: '⏰'
  }
  if (daysLeft <= 3) return { 
    code: 1, 
    text: `临期 ${daysLeft} 天`, 
    type: 'warning',
    color: '#FF9800',
    bgGradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    icon: '⏰'
  }
  return { 
    code: 0, 
    text: `${daysLeft} 天后过期`, 
    type: 'normal',
    color: '#4CAF50',
    bgGradient: 'linear-gradient(135deg, #52c234 0%, #22b322 100%)',
    icon: '✅'
  }
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
  formatDateTime,
  getDaysLeft,
  getFoodStatus,
  debounce,
  throttle,
  showConfirm,
  showSuccess,
  showError
}
