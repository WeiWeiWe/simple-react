export const REACT_ELEMENT = Symbol('react.element'); // 唯一標示，表示 react 元素
export const REACT_FORWARD_REF = Symbol('react.forward_ref');
export const REACT_TEXT = Symbol('react.text');
export const MOVE = Symbol('react.dom.diff.move');
export const CREATE = Symbol('react.dom.diff.create');

export const toVNode = (node) => {
  return typeof node === 'string' || typeof node === 'number'
    ? {
        type: REACT_TEXT,
        props: { text: node },
      }
    : node;
};
