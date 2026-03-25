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
          const result = await uploadService.uploadImage(file.tempFilePath, this.data.type)
          if (result.code === 200 && result.data) {
            newImages.push(result.data.url)
          }
        } catch (error) {
          console.error('上传失败:', error)
        }
      }

      wx.hideLoading()

      if (newImages.length > 0) {
        const allImages = [...this.data.images, ...newImages]
        this.setData({ images: allImages })
        this.triggerEvent('change', { images: allImages })
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
    }
  }
})
