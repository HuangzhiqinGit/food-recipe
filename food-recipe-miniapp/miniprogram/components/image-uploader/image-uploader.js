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
    uploadingImages: [], // 正在上传的图片（本地预览）
    uploadError: null,   // 上传错误信息
    failedFiles: []      // 上传失败的文件
  },

  methods: {
    // 选择图片来源
    chooseImage() {
      const remainingCount = this.data.maxCount - this.data.images.length - this.data.uploadingImages.length
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
          // 立即显示本地预览
          const uploadingImages = tempFiles.map(file => ({
            tempFilePath: file.tempFilePath,
            isUploading: true
          }))
          this.setData({ 
            uploadingImages: [...this.data.uploadingImages, ...uploadingImages],
            uploadError: null // 清除之前的错误
          })
          // 开始上传
          this.uploadImages(tempFiles)
        }
      })
    },

    // 上传图片
    async uploadImages(tempFiles) {
      const uploadService = require('../../services/uploadService')
      const newImages = []
      const failedFiles = []

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
              failedFiles.push(file)
            }
          } else {
            console.error('上传返回异常:', result)
            failedFiles.push(file)
            // 显示具体错误
            this.handleUploadError(result.code, result.message)
          }
        } catch (error) {
          console.error('上传失败:', error)
          failedFiles.push(file)
          // 根据错误类型显示不同提示
          this.handleNetworkError(error)
        }
      }

      // 移除已完成的预览
      const remainingUploading = this.data.uploadingImages.filter(
        item => !tempFiles.some(file => file.tempFilePath === item.tempFilePath)
      )

      if (newImages.length > 0) {
        const allImages = [...this.data.images, ...newImages]
        this.setData({ 
          images: allImages,
          uploadingImages: remainingUploading,
          failedFiles: failedFiles
        })
        this.triggerEvent('change', { images: allImages })
        
        if (failedFiles.length === 0) {
          wx.showToast({ title: '上传成功', icon: 'success' })
        }
      } else {
        this.setData({ 
          uploadingImages: remainingUploading,
          failedFiles: failedFiles
        })
      }

      // 如果有失败的文件，显示错误提示
      if (failedFiles.length > 0 && !this.data.uploadError) {
        this.setData({
          uploadError: {
            title: '部分图片上传失败',
            message: `${failedFiles.length}张图片上传失败，可点击重试`
          }
        })
      }
    },

    // 处理上传错误
    handleUploadError(code, message) {
      let errorInfo = { title: '上传失败', message: message || '请稍后重试' }
      
      switch (code) {
        case 400:
          errorInfo = { title: '上传失败', message: '文件格式或大小不符合要求' }
          break
        case 401:
          errorInfo = { title: '登录已过期', message: '请重新登录后再试' }
          break
        case 403:
          errorInfo = { title: '上传失败', message: '没有权限上传文件' }
          break
        case 413:
          errorInfo = { title: '文件过大', message: '单张图片不能超过10MB' }
          break
        case 503:
          errorInfo = { title: '服务暂不可用', message: '文件存储服务未配置，请联系管理员' }
          break
        case 500:
        default:
          errorInfo = { title: '服务器繁忙', message: '请稍后重试，或检查网络连接' }
          break
      }
      
      this.setData({ uploadError: errorInfo })
    },

    // 处理网络错误
    handleNetworkError(error) {
      let errorInfo = { title: '网络错误', message: '请检查网络连接后重试' }
      
      if (error.errMsg && error.errMsg.includes('timeout')) {
        errorInfo = { title: '请求超时', message: '上传时间过长，请检查网络或压缩图片后重试' }
      } else if (error.errMsg && error.errMsg.includes('fail')) {
        errorInfo = { title: '网络错误', message: '无法连接到服务器，请检查网络设置' }
      }
      
      this.setData({ uploadError: errorInfo })
    },

    // 重试上传
    retryUpload() {
      const { failedFiles } = this.data
      if (failedFiles.length === 0) return
      
      // 重置错误状态
      this.setData({ 
        uploadError: null,
        failedFiles: []
      })
      
      // 重新上传失败的文件
      const tempFiles = failedFiles.map(path => ({ tempFilePath: path }))
      this.uploadImages(tempFiles)
    },

    // 忽略错误
    dismissError() {
      this.setData({ 
        uploadError: null,
        failedFiles: []
      })
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
