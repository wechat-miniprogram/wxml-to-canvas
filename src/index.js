
const xmlParse = require('./xml-parser')
const {Widget} = require('./widget')
const {Draw} = require('./draw')

Component({
  properties: {
    width: {
      type: Number,
      value: 400
    },
    height: {
      type: Number,
      value: 300
    }
  },
  lifetimes: {
    attached() {
      const dpr = wx.getSystemInfoSync().pixelRatio
      const query = this.createSelectorQuery()
      this.dpr = dpr
      query.select('#canvas')
        .fields({node: true, size: true})
        .exec(res => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          ctx.scale(dpr, dpr)
          this.ctx = ctx
          this.canvas = canvas
        })
    }
  },
  methods: {
    async renderToCanvas(args) {
      const {wxml, style} = args

      // 清空画布
      const ctx = this.ctx
      const canvas = this.canvas
      if (!ctx || !canvas) {
        return Promise.reject(new Error('renderToCanvas: fail canvas has not been created'))
      }

      ctx.clearRect(0, 0, this.data.width, this.data.height)
      const {root: xom} = xmlParse(wxml)

      const widget = new Widget(xom, style)
      const container = widget.init()
      this.boundary = {
        top: container.layoutBox.top,
        left: container.layoutBox.left,
        width: container.computedStyle.width,
        height: container.computedStyle.height,
      }
      const draw = new Draw(canvas, ctx)
      await draw.drawNode(container)
      return Promise.resolve(container)
    },

    canvasToTempFilePath(args = {}) {
      return new Promise((resolve, reject) => {
        const {
          top, left, width, height
        } = this.boundary
        wx.canvasToTempFilePath({
          x: left,
          y: top,
          width,
          height,
          destWidth: width * this.dpr,
          destHeight: height * this.dpr,
          canvas: this.canvas,
          fileType: args.fileType || 'png',
          quality: args.quality || 1,
          success: resolve,
          fail: reject
        })
      })
    }
  }
})
