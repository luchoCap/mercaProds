import PeelrValue from "../base/value";

export default class PeelrCustom extends PeelrValue {
  constructor(selector, getter, options = {}) {
    super(selector, options);
    this.getter = getter;
  }

  async getValue($selection) {
    let { getter } = this;
    return await getter($selection);
  }
}
