import { findDomByVNode, updateDomTree } from './react-dom';

export const updaterQueue = {
  isBatch: false,
  updaters: new Set(),
};

export function flushUpdaterQueue() {
  updaterQueue.isBatch = false;
  for (const updater of updaterQueue.updaters) {
    updater.launchUpdate();
  }
  updaterQueue.updaters.clear();
}

class Updater {
  constructor(ClassComponentInstance) {
    this.ClassComponentInstance = ClassComponentInstance;
    this.pendingStates = [];
  }

  addState(partialState) {
    this.pendingStates.push(partialState);
    this.preHandleForUpdate();
  }

  preHandleForUpdate() {
    if (updaterQueue.isBatch) {
      updaterQueue.updaters.add(this);
    } else {
      this.launchUpdate();
    }
  }

  launchUpdate() {
    const { ClassComponentInstance, pendingStates } = this;
    if (pendingStates.length === 0) return;

    ClassComponentInstance.state = this.pendingStates.reduce(
      (preState, newState) => {
        return { ...preState, ...newState };
      },
      ClassComponentInstance.state
    );
    this.pendingStates.length = 0;

    ClassComponentInstance.update();
  }
}

export class Component {
  static IS_CLASS_COMPONENT = true; // 表示是類組件，用來跟函數組件區分

  constructor(props) {
    this.state = {};
    this.props = props;
    this.updater = new Updater(this);
  }

  setState(partialState) {
    this.updater.addState(partialState);
  }

  update() {
    const oldVNode = this.oldVNode; // 當前的虛擬DOM
    const oldDOM = findDomByVNode(oldVNode); // 取得當前的真實DOM

    // 1. 獲取重新執行 render 函數後的新虛擬DOM
    const newVNode = this.render();
    // 2. 根據新虛擬DOM 生成新的真實DOM
    // 3. 將真實DOM 掛載到頁面上
    updateDomTree(oldDOM, newVNode);

    this.oldVNode = newVNode; // 真實DOM 掛載完後，替換當前的虛擬DOM
  }
}
