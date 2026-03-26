const { showSuccess, showError } = require('../../../utils/util')
const shoppingService = require('../../../services/shoppingService')

Page({
  data: {
    currentTab: 'current',
    shoppingList: [],
    historyList: [],
    totalCount: 0,
    purchasedCount: 0,
    unpurchasedCount: 0,
    unpurchasedList: [],
    purchasedList: [],
    currentCategory: 'all',
    categories: [
      { label: '蔬菜', value: 'vegetable' },
      { label: '肉类', value: 'meat' },
      { label: '海鲜', value: 'seafood' },
      { label: '蛋奶', value: 'egg' },
      { label: '水果', value: 'fruit' },
      { label: '调料', value: 'seasoning' },
      { label: '主食', value: 'staple' },
      { label: '其他', value: 'other' }
    ],
    showAddModal: false,
    showStockModal: false,
    newItem: {
      name: '',
      quantity: '',
      category: 'vegetable'
    },
    newItemCategoryIndex: 0,
    stockLocation: '冰箱冷藏',
    stockExpireDate: ''
  },

  onLoad() {
    this.loadShoppingList()
    this.loadHistoryList()
  },

  onShow() {
    this.loadShoppingList()
  },

  // 切换Tab
  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.tab
    })
    if (e.currentTarget.dataset.tab === 'history') {
      this.loadHistoryList()
    }
  },

  // 选择分类
  selectCategory(e) {
    this.setData({
      currentCategory: e.currentTarget.dataset.value
    })
    this.filterList()
  },

  // 获取分类名称
  getCategoryName(value) {
    const category = this.data.categories.find(c => c.value === value)
    return category ? category.label : ''
  },

  // 加载购物清单
  async loadShoppingList() {
    try {
      const res = await shoppingService.getList()
      const list = res.data?.list || []
      
      // 分离已购买和未购买
      const unpurchased = list.filter(item => !item.isPurchased)
      const purchased = list.filter(item => item.isPurchased)
      
      this.setData({
        shoppingList: list,
        unpurchasedList: unpurchased,
        purchasedList: purchased,
        totalCount: list.length,
        purchasedCount: purchased.length,
        unpurchasedCount: unpurchased.length
      })
    } catch (error) {
      console.error('加载购物清单失败:', error)
    }
  },

  // 加载历史清单
  async loadHistoryList() {
    try {
      const res = await shoppingService.getHistory()
      this.setData({
        historyList: res.data || []
      })
    } catch (error) {
      console.error('加载历史清单失败:', error)
    }
  },

  // 筛选列表
  filterList() {
    const { shoppingList, currentCategory } = this.data
    
    let filtered = shoppingList
    if (currentCategory !== 'all') {
      filtered = shoppingList.filter(item => item.category === currentCategory)
    }
    
    const unpurchased = filtered.filter(item => !item.isPurchased)
    const purchased = filtered.filter(item => item.isPurchased)
    
    this.setData({
      unpurchasedList: unpurchased,
      purchasedList: purchased
    })
  },

  // 切换购买状态
  async toggleStatus(e) {
    const id = e.currentTarget.dataset.id
    try {
      await shoppingService.toggleStatus(id)
      this.loadShoppingList()
    } catch (error) {
      console.error('切换状态失败:', error)
    }
  },

  // 删除项目
  async deleteItem(e) {
    const id = e.currentTarget.dataset.id
    try {
      await shoppingService.deleteItem(id)
      showSuccess('删除成功')
      this.loadShoppingList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showAddModal: true,
      newItem: { name: '', quantity: '', category: 'vegetable' },
      newItemCategoryIndex: 0
    })
  },

  // 隐藏添加弹窗
  hideAddModal() {
    this.setData({ showAddModal: false })
  },

  // 输入名称
  onNewNameInput(e) {
    this.setData({
      'newItem.name': e.detail.value
    })
  },

  // 输入数量
  onNewQuantityInput(e) {
    this.setData({
      'newItem.quantity': e.detail.value
    })
  },

  // 选择分类
  onCategoryChange(e) {
    const index = e.detail.value
    this.setData({
      newItemCategoryIndex: index,
      'newItem.category': this.data.categories[index].value
    })
  },

  // 确认添加
  async confirmAdd() {
    const { newItem } = this.data
    
    if (!newItem.name.trim()) {
      showError('请输入食材名称')
      return
    }
    if (!newItem.quantity.trim()) {
      showError('请输入数量')
      return
    }
    
    try {
      await shoppingService.addItem({
        foodName: newItem.name.trim(),
        quantity: newItem.quantity.trim(),
        category: newItem.category
      })
      showSuccess('添加成功')
      this.hideAddModal()
      this.loadShoppingList()
    } catch (error) {
      console.error('添加失败:', error)
      showError('添加失败')
    }
  },

  // 显示入库弹窗
  showStockModal() {
    const selectedCount = this.data.purchasedList.length
    if (selectedCount === 0) {
      showError('没有已购买的食材')
      return
    }
    
    // 默认过期日期为30天后
    const date = new Date()
    date.setDate(date.getDate() + 30)
    const expireDate = date.toISOString().split('T')[0]
    
    this.setData({
      showStockModal: true,
      selectedCount,
      stockExpireDate: expireDate
    })
  },

  // 隐藏入库弹窗
  hideStockModal() {
    this.setData({ showStockModal: false })
  },

  // 选择存放位置
  selectLocation(e) {
    this.setData({
      stockLocation: e.currentTarget.dataset.value
    })
  },

  // 选择过期日期
  onExpireDateChange(e) {
    this.setData({
      stockExpireDate: e.detail.value
    })
  },

  // 确认入库
  async confirmStock() {
    const { purchasedList, stockLocation, stockExpireDate } = this.data
    
    if (!stockExpireDate) {
      showError('请选择过期日期')
      return
    }
    
    const itemIds = purchasedList.map(item => item.id)
    
    try {
      await shoppingService.batchStock({
        itemIds,
        storageLocation: stockLocation,
        expireDate: stockExpireDate
      })
      showSuccess('入库成功')
      this.hideStockModal()
      this.loadShoppingList()
    } catch (error) {
      console.error('入库失败:', error)
      showError('入库失败')
    }
  },

  // 再次购买
  async repurchase(e) {
    const historyId = e.currentTarget.dataset.id
    try {
      await shoppingService.repurchase(historyId)
      showSuccess('已添加到购物清单')
      this.setData({ currentTab: 'current' })
      this.loadShoppingList()
    } catch (error) {
      console.error('再次购买失败:', error)
      showError('再次购买失败')
    }
  },

  // 清空清单
  async clearList() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空购物清单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await shoppingService.clearList()
            showSuccess('已清空')
            this.loadShoppingList()
          } catch (error) {
            console.error('清空失败:', error)
          }
        }
      }
    })
  }
})
