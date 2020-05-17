import PeelrNav from "../base/nav";

const MULTIPART = "multipart/form-data";
const URLENCODED = "application/x-www-form-urlencoded";

export default class PeelrForm extends PeelrNav {
  constructor(selector, extractor, options = {}) {
    super(selector, extractor, options);

    this.fields = options.fields || {};
  }

  getRequestParams($selection) {
    let { fields } = this;

    let params = {
      uri: $selection.attr("action") || "",
      method: ($selection.attr("method") || "GET").toUpperCase()
    };

    for (let fieldSelector in fields) {
      let value = fields[fieldSelector];
      let $target = $selection.find(fieldSelector);

      if (value === true) {
        $target.attr("checked", "");
      } else if (value === false) {
        $target.removeAttr("checked");
      } else {
        $target.val(value);
      }
    }

    if (params.method === "POST") {
      let enctype = $selection.attr("enctype") || URLENCODED;
      let data = $selection.serializeArray().reduce((data, item) => {
        data[item.name] = item.value;
        return data;
      }, {});

      if (enctype === MULTIPART) {
        params.formData = data;
      } else if (enctype === URLENCODED) {
        params.form = data;
      } else {
        throw new Error(`Unsupported form enctype: '${enctype}'`);
      }
    } else {
      let qs = $selection.serialize();
      let sep = params.uri.indexOf("?") !== -1 ? "&" : "?";
      params.uri = `${params.uri}${sep}${qs}`;
    }

    return params;
  }
}
