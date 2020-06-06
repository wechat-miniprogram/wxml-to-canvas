
const xmlParse = require('./xml-parser')
const {Widget} = require('./widget')
const {Draw} = require('./draw')
const {compareVersion} = require('./utils')

const canvasId = 'weui-canvas'

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
  data: {
    use2dCanvas: false, // 2.9.2 后可用canvas 2d 接口
  },
  lifetimes: {
    attached() {
      const {SDKVersion, pixelRatio: dpr} = wx.getSystemInfoSync()
      const use2dCanvas = compareVersion(SDKVersion, '2.9.2') >= 0
      this.dpr = dpr
      this.setData({use2dCanvas}, async () => {
        await this.getCanvasInfo(use2dCanvas, canvasId)
        this.triggerEvent('canvasReady', {}, {}) // canvas初始化完成的回调，可以开始绘制
      })
    }
  },
  methods: {
    // 获取canvas context等信息
    getCanvasInfo(use2dCanvas, canvasId) {
      return new Promise((resolve) => {
        if (use2dCanvas) {
          const dpr = this.dpr
          const query = this.createSelectorQuery()
          query.select(`#${canvasId}`)
              .fields({node: true, size: true})
              .exec(res => {
                const canvas = res[0].node
                const ctx = canvas.getContext('2d')
                canvas.width = res[0].width * dpr
                canvas.height = res[0].height * dpr
                ctx.scale(dpr, dpr)
                this.ctx = ctx
                this.canvas = canvas
                console.log('exec')
                resolve()
              })
        } else {
          this.ctx = wx.createCanvasContext(canvasId, this)
          resolve()
        }
      })
    },
    async renderToCanvas(args) {
      const data = await this.initCanvas(args)
      const {draw, container, ctx} = data
      await draw.drawNode(container)

      if (!this.data.use2dCanvas) {
        this.canvasDraw(ctx)
      }
      return Promise.resolve(container)
    },

    async drawToCanvas(args) {
      const data = await this.initCanvas(args)
      const {draw, container, ctx} = data
      const handler = await draw.drawNode(container)

      if (!this.data.use2dCanvas) {
        return this.canvasDraw(ctx)
      } else {
        return handler
      }
    },

    async initCanvas(args) {
      const {wxml, style} = args
      const ctx = this.ctx
      const canvas = this.canvas
      const use2dCanvas = this.data.use2dCanvas

      if (use2dCanvas && !canvas) {
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
      const draw = new Draw(ctx, canvas, use2dCanvas)
      return Promise.resolve({draw, ctx, container})
    },

    // 低版本绘制方法
    canvasDraw(ctx, reserve) {
      return new Promise(resolve => {
        ctx.draw(reserve, () => {
          resolve()
        })
      })
    },

    // wxml=>canvas=>Img
    async wxmlToCanvasToImg(args) {
      await this.drawToCanvas(args)
      return this.canvasToTempFilePath()
    },

    canvasToTempFilePath(args = {}) {
      const use2dCanvas = this.data.use2dCanvas

      return new Promise((resolve, reject) => {
        const {
          top, left, width, height
        } = this.boundary

        const copyArgs = {
          x: left,
          y: top,
          width,
          height,
          destWidth: width * this.dpr,
          destHeight: height * this.dpr,
          canvasId,
          fileType: args.fileType || 'png',
          quality: args.quality || 1,
          success: res => {
            res.container = {
              layoutBox: this.boundary
            }
            resolve(res)
          },
          fail: reject
        }

        if (use2dCanvas) {
          delete copyArgs.canvasId
          copyArgs.canvas = this.canvas
        }
        wx.canvasToTempFilePath(copyArgs, this)
      })
    }
  }
})
