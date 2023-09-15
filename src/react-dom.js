import {
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  REACT_TEXT,
  CREATE,
  MOVE,
} from './utils';
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
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.text);
  } else if (type && VNode.$$typeof === REACT_ELEMENT) {
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
  VNode.classInstance = instance;
  ref && (ref.current = instance);

  const renderVNode = instance.render();
  instance.oldVNode = renderVNode; // 當前的虛擬DOM，也相當於是舊的虛擬DOM

  if (!renderVNode) return null;
  const dom = createDOM(renderVNode);
  if (instance.componentDidMount) instance.componentDidMount();

  return dom;
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
    children[i].index = i;
    mount(children[i], parent);
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
export function updateDomTree(oldVNode, newVNode, oldDOM) {
  const typeMap = {
    NO_OPERATE: !oldVNode && !newVNode,
    ADD: !oldVNode && newVNode,
    DELETE: oldVNode && !newVNode,
    REPLACE: oldVNode && newVNode && oldVNode.type !== newVNode.type, // 類型不同
  };
  const UPDATE_TYPE = Object.keys(typeMap).filter((key) => typeMap[key])[0];

  switch (UPDATE_TYPE) {
    case 'NO_OPERATE':
      break;
    case 'DELETE':
      removeVNode(oldVNode);
      break;
    case 'ADD':
      oldDOM.parentNode.appendChild(createDOM(newVNode));
      break;
    case 'REPLACE':
      removeVNode(oldVNode);
      oldDOM.parentNode.appendChild(createDOM(newVNode));
      break;
    default:
      deepDOMDiff(oldVNode, newVNode);
      break;
  }
}

function removeVNode(vNode) {
  const currentDOM = findDomByVNode(vNode);
  if (currentDOM) currentDOM.remove();
  if (vNode.classInstance && vNode.classInstance.componentWillUnmount) {
    vNode.classInstance.componentWillUnmount();
  }
}

function deepDOMDiff(oldVNode, newVNode) {
  const diffTypeMap = {
    ORIGIN_NODE: typeof oldVNode.type === 'string',
    CLASS_COMPONENT:
      typeof oldVNode.type === 'function' && oldVNode.type.IS_CLASS_COMPONENT,
    FUNCTION_COMPONENT: typeof oldVNode.type === 'function',
    TEXT: oldVNode.type === REACT_TEXT,
  };
  const DIFF_TYPE = Object.keys(diffTypeMap).filter(
    (key) => diffTypeMap[key]
  )[0];

  switch (DIFF_TYPE) {
    case 'ORIGIN_NODE':
      const currentDOM = (newVNode.dom = findDomByVNode(oldVNode));
      setPropsForDOM(currentDOM, newVNode.props);
      updateChildren(
        currentDOM,
        oldVNode.props.children,
        newVNode.props.children
      );
      break;
    case 'CLASS_COMPONENT':
      updateClassComponent(oldVNode, newVNode);
      break;
    case 'FUNCTION_COMPONENT':
      updateFunctionComponent(oldVNode, newVNode);
      break;
    case 'TEXT':
      newVNode.dom = findDomByVNode(oldVNode);
      newVNode.dom.textContent = newVNode.props.text;
      break;
    default:
      break;
  }
}

function updateChildren(parentDOM, oldVNodeChildren, newVNodeChildren) {
  oldVNodeChildren = (
    Array.isArray(oldVNodeChildren) ? oldVNodeChildren : [oldVNodeChildren]
  ).filter(Boolean);
  newVNodeChildren = (
    Array.isArray(newVNodeChildren) ? newVNodeChildren : [newVNodeChildren]
  ).filter(Boolean);

  let lastNotChangedIndex = -1;
  const oldKeyChildMap = {};
  oldVNodeChildren.forEach((oldVNode, index) => {
    const oldKey = oldVNode && oldVNode.key ? oldVNode.key : index;
    oldKeyChildMap[oldKey] = oldVNode;
  });

  const actions = [];
  newVNodeChildren.forEach((newVNode, index) => {
    newVNode.index = index;
    const newKey = newVNode.key ? newVNode.key : index;
    const oldVNode = oldKeyChildMap[newKey];

    if (oldVNode) {
      deepDOMDiff(oldVNode, newVNode);
      if (oldVNode.index < lastNotChangedIndex) {
        actions.push({
          type: MOVE,
          oldVNode,
          newVNode,
          index,
        });
      }
      delete oldKeyChildMap[newKey];
      lastNotChangedIndex = Math.max(lastNotChangedIndex, oldVNode.index);
    } else {
      actions.push({
        type: CREATE,
        newVNode,
        index,
      });
    }
  });

  const VNodeToMove = actions
    .filter((action) => action.type === MOVE)
    .map((action) => action.oldVNode);
  const VNodeToDelete = Object.values(oldKeyChildMap);
  VNodeToMove.concat(VNodeToDelete).forEach((oldVChild) => {
    const currentDOM = findDomByVNode(oldVChild);
    currentDOM.remove();
  });

  actions.forEach((action) => {
    const { type, oldVNode, newVNode, index } = action;
    const childNodes = parentDOM.childNodes;

    const getDomForInsert = () => {
      if (type === CREATE) {
        return createDOM(newVNode);
      }
      if (type === MOVE) {
        return findDomByVNode(oldVNode);
      }
    };

    const childNode = childNodes[index];
    if (childNode) {
      parentDOM.insertBefore(getDomForInsert(), childNode);
    } else {
      parentDOM.appendChild(getDomForInsert());
    }
  });
}

function updateClassComponent(oldVNode, newVNode) {
  const classInstance = (newVNode.classInstance = oldVNode.classInstance);
  classInstance.updater.launchUpdate();
}

function updateFunctionComponent(oldVNode, newVNode) {
  const oldDOM = (newVNode.dom = findDomByVNode(oldVNode));
  if (!oldDOM) return;
  const { type, props } = newVNode;
  const newRenderVNode = type(props);
  updateDomTree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
  newVNode.oldRenderVNode = newRenderVNode;
}

const ReactDOM = {
  render,
};

export default ReactDOM;
