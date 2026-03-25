Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  methods: {
    // 切换完成状态
    onToggle() {
      this.triggerEvent('toggle', { item: this.data.item })
    },

    // 删除
    onDelete() {
      this.triggerEvent('delete', { item: this.data.item })
    },

    // 编辑
    onEdit() {
      this.triggerEvent('edit', { item: this.data.item })
    }
  }
})
