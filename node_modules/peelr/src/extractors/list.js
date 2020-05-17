import PeelrValue from "../base/value";

export default class PeelrList extends PeelrValue {
  constructor(selector, list, options = {}) {
    super(selector, options);
    this.list = list;
  }

  async getValue($selection, ctx) {
    let { list } = this;
    let $ = await ctx.cheerio();

    return await Promise.all(
      list.map(
        async val =>
          await val.transform(
            val.selector === "::root"
              ? await val.getValue($selection, ctx)
              : await val.getValue($(val.selector, $selection), ctx),
            ctx
          )
      )
    );
  }
}
