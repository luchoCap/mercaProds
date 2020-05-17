import PeelrNav from "../base/nav";

export default class PeelrLink extends PeelrNav {
  constructor(selector, extractor, options = {}) {
    super(selector, extractor, options);

    this.attr = options.attr || "href";
  }

  async getRequestParams($selection) {
    let { attr } = this;

    return $selection.attr(attr);
  }
}
