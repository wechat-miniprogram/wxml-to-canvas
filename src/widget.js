const Block = require('widget-ui')
const {splitLineToCamelCase} = require('./utils')

class Element extends Block {
  constructor(prop) {
    super(prop.style)
    this.name = prop.name
    this.attributes = prop.attributes
  }
}


class Widget {
  constructor(xom, style) {
    this.xom = xom
    this.style = style

    this.inheritProps = ['fontSize', 'lineHeight', 'textAlign', 'verticalAlign', 'color']
  }

  init() {
    this.container = this.create(this.xom)
    this.container.layout()

    this.inheritStyle(this.container)
    return this.container
  }

  // 继承父节点的样式
  inheritStyle(node) {
    const parent = node.parent || null
    const children = node.children || {}
    const computedStyle = node.computedStyle

    if (parent) {
      this.inheritProps.forEach(prop => {
        computedStyle[prop] = computedStyle[prop] || parent.computedStyle[prop]
      })
    }

    Object.values(children).forEach(child => {
      this.inheritStyle(child)
    })
  }

  create(node) {
    let classNames = (node.attributes.class || '').split(' ')
    classNames = classNames.map(item => splitLineToCamelCase(item.trim()))
    const style = {}
    classNames.forEach(item => {
      Object.assign(style, this.style[item] || {})
    })

    const args = {name: node.name, style}

    const attrs = Object.keys(node.attributes)
    const attributes = {}
    for (const attr of attrs) {
      const value = node.attributes[attr]
      const CamelAttr = splitLineToCamelCase(attr)

      if (value === '' || value === 'true') {
        attributes[CamelAttr] = true
      } else if (value === 'false') {
        attributes[CamelAttr] = false
      } else {
        attributes[CamelAttr] = value
      }
    }
    attributes.text = node.content
    args.attributes = attributes
    const element = new Element(args)
    node.children.forEach(childNode => {
      const childElement = this.create(childNode)
      element.add(childElement)
    })
    return element
  }
}

module.exports = {Widget}
