import {wxml, style} from './demo'

Page({
  data: {
    src: ''
  },
  onLoad() {
    this.widget = this.selectComponent('.widget')
  },
  // 直接获取img
  getImage() {
    const p1 = this.widget.wxmlToCanvasToImg({wxml, style})
    p1.then(res => {
      this.setData({
        src: res.tempFilePath,
        width: res.container.layoutBox.width,
        height: res.container.layoutBox.height
      })
    }).catch(res => console.error(res))
  },
  renderToCanvas() {
    const p1 = this.widget.renderToCanvas({ wxml, style })
    p1.then((res) => {
      console.log('container', res.layoutBox)
      this.container = res
    })
  },
  extraImage() {
    const p2 = this.widget.canvasToTempFilePath()
    p2.then(res => {
      this.setData({
        src: res.tempFilePath,
        width: this.container.layoutBox.width,
        height: this.container.layoutBox.height
      })
    })
  }
})
