class Draw {
  constructor(context, canvas, use2dCanvas = false) {
    this.ctx = context
    this.canvas = canvas || null
    this.use2dCanvas = use2dCanvas
  }

  roundRect(x, y, w, h, r, fill = true, stroke = false) {
    if (r < 0) return
    const ctx = this.ctx

    ctx.beginPath()
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 3 / 2)
    ctx.arc(x + w - r, y + r, r, Math.PI * 3 / 2, 0)
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2)
    ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
    ctx.lineTo(x, y + r)
    if (stroke) ctx.stroke()
    if (fill) ctx.fill()
  }

  drawView(box, style) {
    const ctx = this.ctx
    const {
      left: x, top: y, width: w, height: h
    } = box
    const {
      borderRadius = 0,
      borderWidth = 0,
      borderColor,
      color = '#000',
      backgroundColor = 'transparent',
    } = style
    ctx.save()
    // 外环
    if (borderWidth > 0) {
      ctx.fillStyle = borderColor || color
      this.roundRect(x, y, w, h, borderRadius)
    }

    // 内环
    ctx.fillStyle = backgroundColor
    const innerWidth = w - 2 * borderWidth
    const innerHeight = h - 2 * borderWidth
    const innerRadius = borderRadius - borderWidth >= 0 ? borderRadius - borderWidth : 0
    this.roundRect(x + borderWidth, y + borderWidth, innerWidth, innerHeight, innerRadius)
    ctx.restore()
  }

  async drawImage(img, box, style) {
    await new Promise((resolve, reject) => {
      const ctx = this.ctx
      const canvas = this.canvas

      const {
        borderRadius = 0
      } = style
      const {
        left: x, top: y, width: w, height: h
      } = box
      ctx.save()
      this.roundRect(x, y, w, h, borderRadius, false, false)
      ctx.clip()

      const _drawImage = (img) => {
        if (this.use2dCanvas) {
          const Image = canvas.createImage()
          Image.onload = () => {
            ctx.drawImage(Image, x, y, w, h)
            ctx.restore()
            resolve()
          }
          Image.onerror = () => { reject(new Error(`createImage fail: ${img}`)) }
          Image.src = img
        } else {
          ctx.drawImage(img, x, y, w, h)
          ctx.restore()
          resolve()
        }
      }

      const isTempFile = /^wxfile:\/\//.test(img)
      const isNetworkFile = /^https?:\/\//.test(img)

      if (isTempFile) {
        _drawImage(img)
      } else if (isNetworkFile) {
        wx.downloadFile({
          url: img,
          success(res) {
            if (res.statusCode === 200) {
              _drawImage(res.tempFilePath)
            } else {
              reject(new Error(`downloadFile:fail ${img}`))
            }
          },
          fail() {
            reject(new Error(`downloadFile:fail ${img}`))
          }
        })
      } else {
        reject(new Error(`image format error: ${img}`))
      }
    })
  }

  // eslint-disable-next-line complexity
  drawText(text, box, style) {
    const ctx = this.ctx
    let {
      left: x, top: y, width: w, height: h
    } = box
    let {
      color = '#000',
      lineHeight = '1.4em',
      fontSize = 14,
      textAlign = 'left',
      verticalAlign = 'top',
      backgroundColor = 'transparent'
    } = style

    if (typeof lineHeight === 'string') { // 2em
      lineHeight = Math.ceil(parseFloat(lineHeight.replace('em')) * fontSize)
    }
    if (!text || (lineHeight > h)) return

    ctx.save()
    ctx.textBaseline = 'top'
    ctx.font = `${fontSize}px sans-serif`
    ctx.textAlign = textAlign

    // 背景色
    ctx.fillStyle = backgroundColor
    this.roundRect(x, y, w, h, 0)

    // 文字颜色
    ctx.fillStyle = color

    // 水平布局
    switch (textAlign) {
      case 'left':
        break
      case 'center':
        x += 0.5 * w
        break
      case 'right':
        x += w
        break
      default: break
    }

    const textWidth = ctx.measureText(text).width
    const actualHeight = Math.ceil(textWidth / w) * lineHeight
    let paddingTop = Math.ceil((h - actualHeight) / 2)
    if (paddingTop < 0) paddingTop = 0

    // 垂直布局
    switch (verticalAlign) {
      case 'top':
        break
      case 'middle':
        y += paddingTop
        break
      case 'bottom':
        y += 2 * paddingTop
        break
      default: break
    }

    const inlinePaddingTop = Math.ceil((lineHeight - fontSize) / 2)

    // 不超过一行
    if (textWidth <= w) {
      ctx.fillText(text, x, y + inlinePaddingTop)
      return
    }

    // 多行文本
    const chars = text.split('')
    const _y = y

    // 逐行绘制
    let line = ''
    for (const ch of chars) {
      const testLine = line + ch
      const testWidth = ctx.measureText(testLine).width

      if (testWidth > w) {
        ctx.fillText(line, x, y + inlinePaddingTop)
        y += lineHeight
        line = ch
        if ((y + lineHeight) > (_y + h)) break
      } else {
        line = testLine
      }
    }

    // 避免溢出
    if ((y + lineHeight) <= (_y + h)) {
      ctx.fillText(line, x, y + inlinePaddingTop)
    }
    ctx.restore()
  }

  async drawNode(element) {
    const {layoutBox, computedStyle, name} = element
    const {src, text} = element.attributes
    if (name === 'view') {
      this.drawView(layoutBox, computedStyle)
    } else if (name === 'image') {
      await this.drawImage(src, layoutBox, computedStyle)
    } else if (name === 'text') {
      this.drawText(text, layoutBox, computedStyle)
    }
    const childs = Object.values(element.children)
    for (const child of childs) {
      await this.drawNode(child)
    }
  }
}


module.exports = {
  Draw
}
