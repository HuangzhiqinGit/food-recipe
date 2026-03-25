Component({
  properties: {
    images: {
      type: Array,
      value: []
    },
    maxCount: {
      type: Number,
      value: 5
    },
    type: {
      type: String,
      value: 'food' // food 或 recipe
    }
  },

  data: {
    uploadUrl: ''
  },

  methods: {
    // 选择图片来源
    chooseImage() {
      const remainingCount = this.data.maxCount - this.data.images.length
      if (remainingCount <= 0) {
        wx.showToast({ title: `最多上传${this.data.maxCount}张图片`, icon: 'none' })
        return
      }

      wx.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: (res) => {
          const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
          this.doChooseImage(sourceType, remainingCount)
        }
      })
    },

    // 选择图片
    doChooseImage(sourceType, count) {
      wx.chooseMedia({
        count: count,
        mediaType: ['image'],
        sourceType: sourceType,
        success: (res) => {
          const tempFiles = res.tempFiles
          this.uploadImages(tempFiles)
        }
      })
    },

    // 上传图片
    async uploadImages(tempFiles) {
      wx.showLoading({ title: '上传中...' })
      
      const uploadService = require('../../services/uploadService')
      const newImages = []

      for (const file of tempFiles) {
        try {
          console.log('开始上传图片:', file.tempFilePath)
          const result = await uploadService.uploadImage(file.tempFilePath, this.data.type)
          console.log('上传结果:', result)
          
          if (result.code === 200 && result.data) {
            // 兼容不同的返回数据结构
            const imageUrl = result.data.url || result.data.imageUrl || result.data.fileUrl || result.data
            console.log('获取到图片URL:', imageUrl)
            
            if (imageUrl && typeof imageUrl === 'string') {
              newImages.push(imageUrl)
            } else {
              console.error('图片URL格式不正确:', imageUrl)
              wx.showToast({ title: '图片URL格式错误', icon: 'none' })
            }
          } else {
            console.error('上传返回异常:', result)
            wx.showToast({ title: result.message || '上传失败', icon: 'none' })
          }
        } catch (error) {
          console.error('上传失败:', error)
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      }

      wx.hideLoading()

      if (newImages.length > 0) {
        const allImages = [...this.data.images, ...newImages]
        console.log('所有图片:', allImages)
        this.setData({ images: allImages })
        this.triggerEvent('change', { images: allImages })
        wx.showToast({ title: '上传成功', icon: 'success' })
      } else {
        wx.showToast({ title: '上传失败', icon: 'none' })
      }
    },

    // 删除图片
    deleteImage(e) {
      const index = e.currentTarget.dataset.index
      const images = this.data.images.filter((_, i) => i !== index)
      this.setData({ images })
      this.triggerEvent('change', { images })
    },

    // 预览图片
    previewImage(e) {
      const index = e.currentTarget.dataset.index
      wx.previewImage({
        current: this.data.images[index],
        urls: this.data.images
      })
    },
    
    // 图片加载失败
    onImageError(e) {
      const index = e.currentTarget.dataset.index
      console.error(`图片 ${index} 加载失败:`, this.data.images[index])
      wx.showToast({ title: '图片加载失败', icon: 'none' })
    }
  }
})
