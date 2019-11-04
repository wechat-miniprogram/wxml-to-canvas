const $filterNullChildren = (children) => {
    children = deepFlatten(children);
    return children.filter(child => child != null);
}

const deepFlatten = (arr) => {
    let flatten = (arr) => [].concat(...arr);
    return flatten(arr.map(x => Array.isArray(x) ? deepFlatten(x) : x));
}

export default (data, opt) => {
	const {View, Text, Image} = opt;
	Object.assign(data,{}); return new View({style: {}, attr: {"needRoot":true},children:$filterNullChildren([new Canvas({style: {}, attr: {"id":"canvas","type":"2d","style":"width: "+(data.width)+"px; height: "+(data.height)+("px;")},children:$filterNullChildren([])})])});
}