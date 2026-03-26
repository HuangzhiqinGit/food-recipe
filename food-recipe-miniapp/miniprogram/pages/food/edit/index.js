const { showSuccess, showError } = require('../../../utils/util')
const foodService = require('../../../services/foodService')
const ocrService = require('../../../services/ocrService')

Page({
  data: {
    isEdit: false,
    foodId: null,
    images: [],
    form: {
      name: '',
      category: 'vegetable',
      quantity: '',
      unit: '个',
      location: '冰箱冷藏',
      expireDate: ''
    },
    categories: [
      { label: '蔬菜', value: 'vegetable' },
      { label: '肉类', value: 'meat' },
      { label: '海鲜', value: 'seafood' },
      { label: '蛋奶', value: 'egg' },
      { label: '主食', value: 'staple' },
      { label: '调料', value: 'seasoning' },
      { label: '酒水', value: 'drink' },
      { label: '其他', value: 'other' }
    ],
    categoryIndex: 0,
    units: ['个', '斤', '克', '千克', '升', '毫升', '盒', '袋', '瓶', '把', '根'],
    unitIndex: 0,
    locations: ['冰箱冷藏', '冰箱冷冻', '常温', '其他'],
    locationIndex: 0,
    commonFoods: ['鸡蛋', '番茄', '土豆', '青椒', '洋葱', '鸡胸肉', '猪肉', '牛肉', '虾', '牛奶', '豆腐', '白菜', '胡萝卜', '黄瓜', '茄子']
  },

  onLoad(options) {
    // 从快捷添加传入的名称
    if (options.name) {
      this.setData({
        'form.name': options.name
      })
    }

    // 编辑模式
    if (options.id) {
      this.setData({
        isEdit: true,
        foodId: options.id
      })
      this.loadFoodDetail(options.id)
    }
  },

  // 加载食材详情
  async loadFoodDetail(id) {
    try {
      const res = await foodService.getFoodDetail(id)
      const food = res.data

      // 设置分类索引
      const categoryIndex = this.data.categories.findIndex(c => c.value === food.category)
      // 设置单位索引
      const unitIndex = this.data.units.indexOf(food.unit)
      // 设置位置索引
      const locationIndex = this.data.locations.indexOf(food.location)

      this.setData({
        images: food.imageUrl ? [food.imageUrl] : [],
        form: {
          name: food.name,
          category: food.category,
          quantity: food.quantity.toString(),
          unit: food.unit,
          location: food.location,
          expireDate: food.expireDate || ''
        },
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        unitIndex: unitIndex >= 0 ? unitIndex : 0,
        locationIndex: locationIndex >= 0 ? locationIndex : 0
      })
    } catch (error) {
      console.error('加载食材详情失败:', error)
      showError('加载失败')
    }
  },

  // 图片上传变化
  onImageChange(e) {
    this.setData({
      images: e.detail.images
    })
  },

  // 扫描录入食材 - AI识别
  async scanFood() {
    // 选择图片来源
    const res = await wx.showActionSheet({
      itemList: ['拍照', '从相册选择']
    }).catch(() => null)
    
    if (!res) return
    
    const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: sourceType,
      success: async (chooseRes) => {
        const tempFilePath = chooseRes.tempFiles[0].tempFilePath
        
        wx.showLoading({ title: 'AI识别中...', mask: true })
        
        console.log('准备上传图片, 路径:', tempFilePath)
        
        try {
          // 上传并识别
          console.log('调用 ocrService.scanAndRecognize...')
          const result = await ocrService.scanAndRecognize(tempFilePath)
          console.log('scanAndRecognize 返回:', result)
          
          if (result.code === 200 && result.data) {
            const { name, category, location, imageUrl } = result.data
            
            // 查找分类索引
            const categoryIndex = this.data.categories.findIndex(c => c.value === category)
            // 查找位置索引
            const locationIndex = this.data.locations.indexOf(location)
            
            // 更新表单
            this.setData({
              'form.name': name || '',
              'form.category': category || 'vegetable',
              categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
              'form.location': location || '冰箱冷藏',
              locationIndex: locationIndex >= 0 ? locationIndex : 0,
              images: imageUrl ? [imageUrl] : []
            })
            
            wx.showToast({ title: '识别成功', icon: 'success' })
          } else {
            wx.showToast({ title: '识别失败，请手动填写', icon: 'none' })
          }
        } catch (error) {
          console.error('AI识别失败:', error)
          wx.showToast({ title: '识别失败，请手动填写', icon: 'none' })
        } finally {
          wx.hideLoading()
        }
      }
    })
  },

  // 名称输入
  onNameInput(e) {
    this.setData({
      'form.name': e.detail.value
    })
  },

  // 选择常用食材
  selectCommonFood(e) {
    this.setData({
      'form.name': e.currentTarget.dataset.name
    })
  },

  // 分类选择
  onCategoryChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      categoryIndex: index,
      'form.category': this.data.categories[index].value
    })
  },

  // 数量输入
  onQuantityInput(e) {
    this.setData({
      'form.quantity': e.detail.value
    })
  },

  // 单位选择
  onUnitChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      unitIndex: index,
      'form.unit': this.data.units[index]
    })
  },

  // 位置选择
  onLocationChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      locationIndex: index,
      'form.location': this.data.locations[index]
    })
  },

  // 过期日期选择
  onExpireDateChange(e) {
    this.setData({
      'form.expireDate': e.detail.value
    })
  },

  // 取消
  onCancel() {
    wx.navigateBack()
  },

  // 保存
  async onSave() {
    const { form, isEdit, foodId, images } = this.data

    // 表单验证
    if (!form.name.trim()) {
      showError('请输入食材名称')
      return
    }
    if (!form.quantity || parseFloat(form.quantity) <= 0) {
      showError('请输入正确的数量')
      return
    }

    const data = {
      name: form.name.trim(),
      category: form.category,
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      location: form.location,
      expireDate: form.expireDate || null,
      imageUrl: images.length > 0 ? images[0] : null
    }

    try {
      if (isEdit) {
        await foodService.updateFood(foodId, data)
        showSuccess('更新成功')
      } else {
        await foodService.addFood(data)
        showSuccess('添加成功')
      }

      // 返回上一页并刷新
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.loadFoodList) {
        prevPage.loadFoodList()
      }

      wx.navigateBack()
    } catch (error) {
      console.error('保存失败:', error)
      showError('保存失败')
    }
  }
})
