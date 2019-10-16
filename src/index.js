// const _ = require('./utils')


Component({
  properties: {
    prop: {
      width: Number,
      height: Number
    },
  },
  data: {
    flag: false,
  },
  lifetimes: {
    attached() {
      const ratio = wx.getSystemInfoSync().pixelRatio
      const query = this.createSelectorQuery()
      query.select('#canvas').node((res) => {
        const canvas = res.node
        const ctx = canvas.getContext('2d')
        canvas.width = this.data.width * ratio
        canvas.height = this.data.height * ratio
        ctx.scale(ratio, ratio)
      }).exec()
    },
    compile(tpl, data) {

    },
    parseStyle() {

    },
    computeLayout() {

    },
    render() {

    },
  }
})
