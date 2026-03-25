Component({
  properties: {
    recipe: {
      type: Object,
      value: {}
    },
    showFavorite: {
      type: Boolean,
      value: true
    }
  },

  data: {
    difficultyMap: {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
  },

  methods: {
    // 点击卡片
    onTap() {
      this.triggerEvent('tap', { recipe: this.data.recipe })
    },

    // 点击收藏
    onFavoriteTap(e) {
      e.stopPropagation()
      this.triggerEvent('favorite', { recipe: this.data.recipe })
    },

    // 获取难度文本
    getDifficultyText(difficulty) {
      return this.data.difficultyMap[difficulty] || '简单'
    },

    // 获取难度样式
    getDifficultyClass(difficulty) {
      const map = {
        easy: 'easy',
        medium: 'medium',
        hard: 'hard'
      }
      return map[difficulty] || 'easy'
    }
  }
})
