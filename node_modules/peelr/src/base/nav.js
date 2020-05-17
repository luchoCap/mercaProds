import PeelrValue from "./value";

export default class PeelrNav extends PeelrValue {
  constructor(selector, extractor, options = {}) {
    super(selector, options);

    this.buildRequest = options.buildRequest || (x => x);
    this.extractor = extractor;
  }

  async getValue($selection, ctx) {
    let { buildRequest, extractor } = this;

    let requestParams = await this.getRequestParams($selection);
    let finalParams = await buildRequest(requestParams);
    let derivedCtx = await ctx.derive(finalParams);

    return await extractor.extract(derivedCtx);
  }
}
