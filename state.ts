/** Reactive state. */
export class Reactive {
  #value: any;
  _listeners: ((data: any) => void)[] = [];
  _listenersData: any[] = [];

  constructor (value: any) {
    this.#value = value;
  }

  _addChangeListener(cb: (data: any) => void | (() => void), data?: any) {
    this._listeners.push(cb);
    this._listenersData.push(data);
  }

  get value() {
    return this.#value;
  }

  set value(newValue: any) {
      if (this.#value == newValue) return;
      this.#value = newValue;
        
      this._listeners.forEach((cb, index) => {
      cb(this._listenersData[index]);
    });
  }
}

/** {@link Reactive} */
export const reactive = (value: any) => {
  return new Reactive(value);
};

/** Detect when {@link Reactive} state changes */
export const onChange = (r: Reactive, cb: () => void) => {
  r._addChangeListener(cb);
};
