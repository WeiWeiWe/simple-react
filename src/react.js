import {
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  REACT_MEMO,
  toVNode,
  shallowCompare,
} from './utils';
import { Component } from './Component';

function createElement(type, properties = {}, children) {
  const ref = properties.ref || null; // 與 DOM 相關的操作
  const key = properties.key || null; // 與 DOM DIFF 相關的操作

  /**
   * 除了 ref 和 key 兩個需要特殊處理的屬性單獨拆開以外，還會有多餘的 __self 和 __source 屬性，
   * 基本上用不到，所以可以直接刪除即可！
   */
  ['ref', 'key', '__self', '__source'].forEach((key) => {
    delete properties[key];
  });

  const props = { ...properties };

  if (arguments.length > 3) {
    // 多個子節點時，需要從 arguments 的第三個索引開始提取所有子節點，並轉換成陣列存取
    props.children = Array.prototype.slice.call(arguments, 2).map(toVNode);
  } else {
    // 單個子節點時，直接從 children 提取子節點文字內容
    props.children = toVNode(children);
  }

  return {
    $$typeof: REACT_ELEMENT, // 代表這是個 React 元素，是唯一的標示，指的是 React 中的虛擬 DOM
    type, // 虛擬 DOM 的元素類型
    ref,
    key,
    props,
  };
}

function createRef() {
  return { current: null };
}

function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render,
  };
}

class PureComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowCompare(this.props, nextProps) ||
      !shallowCompare(this.state, nextState)
    );
  }
}

function memo(type, compare = shallowCompare) {
  return {
    $$typeof: REACT_MEMO,
    type,
    compare,
  };
}

const React = {
  createElement,
  Component, // 類組件
  createRef,
  forwardRef,
  PureComponent,
  memo,
};

export default React;
