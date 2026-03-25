Page({
  data: {
    selectedType: '',
    selectedDuration: '',
    typeOptions: [
      { label: '全部', value: '' },
      { label: '全素', value: 'vegetarian' },
      { label: '半荤', value: 'semi_meat' },
      { label: '全荤', value: 'meat' }
    ],
    durationOptions: [
      { label: '全部', value: '' },
      { label: '10分钟快手', value: '10min' },
      { label: '15分钟', value: '15min' },
      { label: '20分钟', value: '20min' },
      { label: '30分钟+', value: '30min_plus' }
    ]
  },

  // 选择类型
  selectType(e) {
    this.setData({
      selectedType: e.currentTarget.dataset.value
    })
  },

  // 选择时长
  selectDuration(e) {
    this.setData({
      selectedDuration: e.currentTarget.dataset.value
    })
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      selectedType: '',
      selectedDuration: ''
    })
  },

  // 确认筛选
  confirmFilter() {
    const { selectedType, selectedDuration } = this.data

    // 返回上一页并传递筛选条件
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      prevPage.setData({
        filterType: selectedType,
        filterDuration: selectedDuration
      })
      prevPage.loadRecipeList()
    }

    wx.navigateBack()
  }
})
