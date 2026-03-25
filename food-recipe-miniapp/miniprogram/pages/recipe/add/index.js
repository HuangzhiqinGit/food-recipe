const { showSuccess, showError } = require('../../../utils/util')
const recipeService = require('../../../services/recipeService')

Page({
  data: {
    images: [],
    form: {
      name: '',
      type: 'vegetarian',
      duration: '15min',
      ingredients: [{ name: '', quantity: '', unit: '' }],
      steps: [''],
      tips: ''
    },
    typeOptions: [
      { label: '全素', value: 'vegetarian' },
      { label: '半荤', value: 'semi_meat' },
      { label: '全荤', value: 'meat' }
    ],
    typeIndex: 0,
    durationOptions: [
      { label: '10分钟快手', value: '10min' },
      { label: '15分钟', value: '15min' },
      { label: '20分钟', value: '20min' },
      { label: '30分钟+', value: '30min_plus' }
    ],
    durationIndex: 1
  },

  // 菜名输入
  onNameInput(e) {
    this.setData({
      'form.name': e.detail.value
    })
  },

  // 类型选择
  onTypeChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      typeIndex: index,
      'form.type': this.data.typeOptions[index].value
    })
  },

  // 时长选择
  onDurationChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      durationIndex: index,
      'form.duration': this.data.durationOptions[index].value
    })
  },

  // 添加食材
  addIngredient() {
    const ingredients = this.data.form.ingredients
    ingredients.push({ name: '', quantity: '', unit: '' })
    this.setData({
      'form.ingredients': ingredients
    })
  },

  // 删除食材
  deleteIngredient(e) {
    const index = e.currentTarget.dataset.index
    const ingredients = this.data.form.ingredients
    if (ingredients.length > 1) {
      ingredients.splice(index, 1)
      this.setData({
        'form.ingredients': ingredients
      })
    }
  },

  // 食材输入
  onIngredientInput(e) {
    const { index, field } = e.currentTarget.dataset
    const value = e.detail.value
    const key = `form.ingredients[${index}].${field}`
    this.setData({
      [key]: value
    })
  },

  // 添加步骤
  addStep() {
    const steps = this.data.form.steps
    steps.push('')
    this.setData({
      'form.steps': steps
    })
  },

  // 删除步骤
  deleteStep(e) {
    const index = e.currentTarget.dataset.index
    const steps = this.data.form.steps
    if (steps.length > 1) {
      steps.splice(index, 1)
      this.setData({
        'form.steps': steps
      })
    }
  },

  // 步骤输入
  onStepInput(e) {
    const index = e.currentTarget.dataset.index
    const key = `form.steps[${index}]`
    this.setData({
      [key]: e.detail.value
    })
  },

  // 小贴士输入
  onTipsInput(e) {
    this.setData({
      'form.tips': e.detail.value
    })
  },

  // 图片上传变化
  onImageChange(e) {
    this.setData({
      images: e.detail.images
    })
  },

  // 取消
  onCancel() {
    wx.navigateBack()
  },

  // 保存
  async onSave() {
    const { form, images } = this.data

    // 表单验证
    if (!form.name.trim()) {
      showError('请输入菜名')
      return
    }

    // 验证食材
    const validIngredients = form.ingredients.filter(item => 
      item.name.trim() && item.quantity && item.unit.trim()
    )
    if (validIngredients.length === 0) {
      showError('请至少添加一个完整的食材')
      return
    }

    // 验证步骤
    const validSteps = form.steps.filter(step => step.trim())
    if (validSteps.length === 0) {
      showError('请至少添加一个步骤')
      return
    }

    const data = {
      name: form.name.trim(),
      type: form.type,
      duration: form.duration,
      images: JSON.stringify(images),
      ingredients: JSON.stringify(validIngredients),
      steps: JSON.stringify(validSteps),
      tips: form.tips.trim()
    }

    try {
      await recipeService.addRecipe(data)
      showSuccess('添加成功')

      // 返回并刷新列表
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.loadRecipeList) {
        prevPage.loadRecipeList()
      }

      wx.navigateBack()
    } catch (error) {
      console.error('添加失败:', error)
      showError('添加失败')
    }
  }
})
