import PeelrContext from "./context";

export default class PeelrValue {
  constructor(selector, options = {}) {
    this.selector = selector;

    this.transform = options.transform || (x => x);

    this.multiple = options.multiple || false;
    this.nextPage = options.nextPage;
    this.offset = options.offset || 0;
    this.limit = options.limit || Infinity;

    this.onRequest = options.onRequest;
  }

  async extract(source) {
    let {
      onRequest,
      selector,
      multiple,
      nextPage,
      offset,
      limit,
      transform
    } = this;

    let ctx = PeelrContext.create(source);
    if (onRequest) {
      ctx.on("request", onRequest);
    }

    let $ = await ctx.cheerio();
    let $target = $(selector);

    if (typeof nextPage === "string") {
      nextPage = new PeelrValue.PeelrAttr(nextPage, "href");
    }

    if (multiple) {
      let items = [];
      while ($target && items.length < limit) {
        items.push(
          ...(await Promise.all(
            $target
              .slice(offset, limit - items.length)
              .map(
                async (index, el) =>
                  await transform(await this.getValue($(el).first(), ctx), ctx)
              )
              .get()
          ))
        );

        offset = Math.max(0, offset - $target.length);

        if (nextPage && items.length < limit) {
          let nextUrl = await nextPage.extract(ctx);
          if (nextUrl) {
            ctx = await ctx.derive(nextUrl);
            $ = await ctx.cheerio();
            $target = $(selector);
          } else {
            $target = null;
          }
        } else {
          $target = null;
        }
      }

      return items;
    } else if ($target.length) {
      return await transform(await this.getValue($target.first(), ctx), ctx);
    }
  }
}
