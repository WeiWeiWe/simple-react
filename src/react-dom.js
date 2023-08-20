import { REACT_ELEMENT } from './utils';

function render(VNode, containerDOM) {
  mount(VNode, containerDOM);
}

function mount(VNode, containerDOM) {
  // 將虛擬 DOM 轉化成真實 DOM
  const newDOM = createDOM(VNode);

  // 將轉化的真實 DOM 掛載到 containerDOM 中
  newDOM && containerDOM.appendChild(newDOM);
}

/** 將虛擬 DOM 轉化成真實 DOM */
function createDOM(VNode) {
  const { type, props } = VNode;
  let dom;

  // 1. 創建元素
  if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }

  // 2. 處理子元素
  if (props) {
    if (typeof props.children === 'object' && props.children.type) {
      // 處理單個子元素
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      // 處理多個子元素
      mountArray(props.children, dom);
    } else if (typeof props.children === 'string') {
      // 單純文字內容直接掛載
      dom.appendChild(document.createTextNode(props.children));
    }
  }

  // 3. 處理屬性值
  setPropsForDOM(dom, props);

  return dom;
}

/**
 * 處理多個子元素
 */
function mountArray(children, parent) {
  if (!Array.isArray(children)) return;

  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === 'string') {
      // 單純文字內容直接掛載
      parent.appendChild(document.createTextNode(children[i]));
    } else {
      // 處理單個子元素
      mount(children[i], parent);
    }
  }
}

/**
 * 處理屬性值
 */
function setPropsForDOM(dom, VNodeProps = {}) {
  if (!dom) return;

  for (const key in VNodeProps) {
    // children 在處理子元素時，已經處理完畢
    if (key === 'children') continue;

    if (/^on[A-Z].*/.test(key)) {
      // TODO: 事件處理
    } else if (key === 'style') {
      // 處理 style 屬性
      Object.keys(VNodeProps[key]).forEach((styleName) => {
        dom.style[styleName] = VNodeProps[key][styleName];
      });
    } else {
      // VNodeProps 多餘的屬性也直接存到 dom 物件裡，這些屬性基本上都用不到，單純存起來而已！
      dom[key] = VNodeProps[key];
    }
  }
}

const ReactDOM = {
  render,
};

export default ReactDOM;
