# widget-to-canvas 
[![](https://img.shields.io/npm/v/widget-to-canvas )](https://www.npmjs.com/package/widget-to-canvas )
[![](https://img.shields.io/npm/l/widget-to-canvas )](https://github.com/wechat-miniprogram/widget-to-canvas )

小程序内通过静态模板和样式绘制 canvas ，导出图片（基础库版本 >= 2.9.0）。

## 使用方法

#### Step1. npm 安装，参考 [小程序 npm 支持](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)

```
npm install --save widget-to-canvas
```

#### Step2. JSON 组件声明
```
{
  "usingComponents": {
    "widget-to-canvas": "widget-to-canvas",
  }
}

```

#### Step3. wxml 引入弹幕组件
```
<video class="video" src="{{src}}">
  <widget-to-canvas class="widget"></widget-to-canvas>
</video>
<image src="{{src}}" style="width: {{width}}px; height: {{height}}px"></image>
```

#### Step4. js 获取实例
```
const {dom, style} = require('./demo.js')
Page({
  data: {
    src: ''
  },
  onLoad() {
    this.widget = this.selectComponent('.widget')
  },
  renderToCanvas() {
    const p1 = this.widget.renderToCanvas({ dom, style })
    p1.then((res) => {
      console.log('container', res.layoutBox)
      this.container = res
      this.extraImage()
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
```

## 模板

支持 `view`、`text`、`image` 三种标签，通过 class 匹配 style 对象中的样式。 class 不支持并列，取唯一值。

```
<view class="container">
  <view class="item-box-red">
  </view>
  <view class="item-box-green">
    <text class="text">yeah!</text>
  </view>
  <view class="item-box-blue">
      <image class="img" src="https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3582589792,4046843010&fm=26&gp=0.jpg"></image>
  </view>
</view>
```

## 样式

对象属性值为对应标签的 class 驼峰形式。**需为每个标签元素指定 width 和 height 属性**，否则会导致布局错误。样式暂不支持继承。

元素均为 flex 布局。left/top 仅在 absolute 定位下生效。

```
const style = {
  container: {
    width: 300,
    height: 200,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ccc',
    alignItems: 'center'
  },
  itemBoxRed: {
    width: 80,
    height: 60,
    backgroundColor: '#ff0000'
  },
}
```

## 接口

#### f1. `renderToCanvas({dom, style}): Promise`

渲染结构到 canvas，传入template 和 style 对象，返回容器对象，包含布局和样式信息。

#### f2. `canvasToTempFilePath({fileType, quality}): Promise`

提取画布中容器所在区域内容生成相同大小的图片，返回临时文件地址。

`fileType` 支持 `jpg`、`png` 两种格式，quality 为图片的质量，目前仅对 jpg 有效。取值范围为 (0, 1]，不在范围内时当作 1.0 处理。

## 支持的 css 属性

### 布局相关

| 属性名 |  支持的值或类型  |  默认值 |
| ----  | ----- | -----   |
| width | number | 0      |
| height | number | 0      |
| position | relative, absolute | relative      |
| left | number | 0      |
| top | number | 0      |
| right | number | 0      |
| bottom | number | 0      |
| margin | number | 0      |
| padding | number | 0      |
| borderWidth | number | 0      |
| borderRadius | number | 0      |
| flexDirection	 | column, row | row      |
| flexShrink | number | 1      |
| flexGrow | number |       |
| flexWrap | wrap, nowrap | nowrap      |
| justifyContent | flex-start, center, flex-end, space-between, space-around | flex-start      |
| alignItems, alignSelf | flex-start, center, flex-end, stretch | flex-start      |

支持 marginLeft, marginRight, marginTop, marginBottom, paddingLeft, paddingRight, paddingTop, paddingBottom

### 文字

| 属性名 |  支持的值或类型  |  默认值 |
| ----  | ----- | -----   |
| fontSize | number | 14      |
| lineHeight | number / string | 1.4     |
| textAlign | left, center, right | left      |
| verticalAlign | top, middle, bottom | top      |
| color | string | #000000      |
| backgroundColor | string | #ffffff      |

lineHeight 取值为数字时，表示fontSize的倍数；可带单位如 '20px’。


### 变形

| 属性名 |  支持的值或类型  |  默认值 |
| ----  | ----- | -----   |
| scale | number | 1      |