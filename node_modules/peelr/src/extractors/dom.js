import PeelrValue from "../base/value";

class PeelrText extends PeelrValue {
  constructor(selector, options = {}) {
    super(selector, options);
  }

  getValue($selection) {
    return $selection.text();
  }
}

class PeelrAttr extends PeelrValue {
  constructor(selector, attr, options = {}) {
    super(selector, options);
    this.attr = attr;
  }

  getValue($selection) {
    let { attr } = this;
    return $selection.attr(attr);
  }
}

class PeelrData extends PeelrValue {
  constructor(selector, data, options = {}) {
    super(selector, options);
    this.data = data;
  }

  getValue($selection) {
    let { data } = this;
    return $selection.data(data);
  }
}

class PeelrVal extends PeelrValue {
  getValue($selection) {
    return $selection.val();
  }
}

class PeelrHasClass extends PeelrValue {
  constructor(selector, cls, options = {}) {
    super(selector, options);
    this.cls = cls;
  }

  getValue($selection) {
    let { cls } = this;
    return $selection.hasClass(cls);
  }
}

class PeelrIs extends PeelrValue {
  constructor(selector, what, options = {}) {
    super(selector, options);
    this.what = what;
  }

  getValue($selection) {
    let { what } = this;
    return $selection.is(what);
  }
}

class PeelrHtml extends PeelrValue {
  getValue($selection) {
    return $selection.html();
  }
}

// Pass PeelrAttr to PeelrValue for pagination
PeelrValue.PeelrAttr = PeelrAttr;

export {
  PeelrAttr,
  PeelrData,
  PeelrHasClass,
  PeelrHtml,
  PeelrIs,
  PeelrText,
  PeelrVal
};
