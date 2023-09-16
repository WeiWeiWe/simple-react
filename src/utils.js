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

export const deepClone = (data) => {
  const type = getType(data);
  let resultValue;

  if (!(type === 'array' || type === 'object')) return data;

  if (type === 'array') {
    resultValue = [];
    data.forEach((item) => {
      resultValue.push(deepClone(item));
    });
    return resultValue;
  } else if (type === 'object') {
    resultValue = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        resultValue[key] = deepClone(data[key]);
      }
    }
    return resultValue;
  }
};

function getType(obj) {
  const typeMap = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
  };
  return typeMap[Object.prototype.toString.call(obj)];
}
