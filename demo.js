const dom = `
  <view class="container">
    <view class="item-box-red">
    </view>
    <view class="item-box-green">
      <text class="text">yeah!</text>
    </view>
    <view class="item-box-blue">
    </view>
  </view>
`

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
  itemBoxGreen: {
    width: 80,
    height: 60,
    backgroundColor: '#00ff00'
  },
  itemBoxBlue: {
    width: 80,
    height: 60,
    backgroundColor: '#0000ff'
  },
  text: {
    width: 80,
    height: 60,
    color: '#000',
    textAlign: 'center',
    verticalAlign: 'middle',
  }
}


module.exports = {
  dom,
  style
}
