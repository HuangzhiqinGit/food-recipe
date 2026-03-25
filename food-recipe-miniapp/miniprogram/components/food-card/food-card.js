Component({
  properties: {
    food: {
      type: Object,
      value: {}
    }
  },

  data: {
    categoryMap: {
      vegetable: '蔬菜',
      meat: '肉类',
      seafood: '海鲜',
      egg: '蛋奶',
      staple: '主食',
      seasoning: '调料',
      drink: '酒水'
    },
    categoryIconMap: {
      vegetable: '🥬',
      meat: '🥩',
      seafood: '🦐',
      egg: '🥚',
      staple: '🍚',
      seasoning: '🧂',
      drink: '🥤'
    }
  },

  methods: {
    // 点击卡片
    onTap() {
      this.triggerEvent('tap', { food: this.data.food })
    },

    // 长按
    onLongPress() {
      this.triggerEvent('longpress', { food: this.data.food })
    },

    // 获取分类名称
    getCategoryName(category) {
      return this.data.categoryMap[category] || '其他'
    },

    // 获取分类图标
    getCategoryIcon(category) {
      return this.data.categoryIconMap[category] || '📦'
    },

    // 计算剩余天数
    getRemainingDays(expireDate) {
      if (!expireDate) return null
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const expire = new Date(expireDate)
      const diff = Math.ceil((expire - today) / (1000 * 60 * 60 * 24))
      return diff
    },

    // 获取状态样式
    getStatusClass(remainingDays) {
      if (remainingDays === null) return ''
      if (remainingDays < 0) return 'expired'
      if (remainingDays <= 3) return 'warning'
      return ''
    }
  }
})
