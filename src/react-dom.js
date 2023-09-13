import { REACT_ELEMENT, REACT_FORWARD_REF } from './utils';
import { addEvent } from './event';

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
  const { type, props, ref } = VNode;
  let dom;

  // 1. 創建元素
  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return getDomByForwardRefFunction(VNode);
  }
  if (
    typeof type === 'function' &&
    type.IS_CLASS_COMPONENT &&
    VNode.$$typeof === REACT_ELEMENT
  ) {
    // 類組件
    return getDomByClassComponent(VNode);
  }
  if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT) {
    // 函數式組件
    return getDomByFunctionComponent(VNode);
  }
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
  VNode.dom = dom; // 真實DOM
  ref && (ref.current = dom);

  return dom;
}

/**
 * 處理類組件
 */
function getDomByClassComponent(VNode) {
  const { type, props, ref } = VNode;
  const instance = new type(props);

  const renderVNode = instance.render();
  instance.oldVNode = renderVNode; // 當前的虛擬DOM，也相當於是舊的虛擬DOM
  ref && (ref.current = instance);

  // 測試 setState 功能用，後續記得刪除
  // setTimeout(() => {
  //   instance.setState({ testState: 'child444444' });
  // }, 3000);

  if (!renderVNode) return null;

  return createDOM(renderVNode);
}

/**
 * 處理函數式組件
 */
function getDomByFunctionComponent(VNode) {
  const { type, props } = VNode;
  const renderVNode = type(props);
  if (!renderVNode) return null;

  return createDOM(renderVNode);
}

function getDomByForwardRefFunction(VNode) {
  const { type, props, ref } = VNode;
  const renderVNode = type.render(props, ref);
  if (!renderVNode) return null;
  return createDOM(renderVNode);
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
      // 事件處理
      addEvent(dom, key.toLowerCase(), VNodeProps[key]);
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

/**
 * 取得真實DOM
 * @param {*} VNode
 * @returns
 */
export function findDomByVNode(VNode) {
  if (!VNode) return;
  if (VNode.dom) return VNode.dom;
}

/**
 * 更新真實DOM
 * @param {*} oldDOM
 * @param {*} newVNode
 */
export function updateDomTree(oldDOM, newVNode) {
  const parentNode = oldDOM.parentNode;
  parentNode.removeChild(oldDOM);
  parentNode.appendChild(createDOM(newVNode));
}

const ReactDOM = {
  render,
};

export default ReactDOM;
