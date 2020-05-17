import PeelrCustom from "./extractors/custom";
import PeelrForm from "./extractors/form";
import PeelrHash from "./extractors/hash";
import PeelrList from "./extractors/list";
import PeelrLink from "./extractors/link";
import {
  PeelrAttr,
  PeelrData,
  PeelrHasClass,
  PeelrHtml,
  PeelrIs,
  PeelrText,
  PeelrVal
} from "./extractors/dom";

function exportCtors(ctors) {
  return ctors.reduce((obj, Ctor) => {
    let { name } = Ctor;
    let short = name.replace(/^Peelr(.)/, function(m, p1) {
      return p1.toLowerCase();
    });

    obj[name] = Ctor;
    obj[short] = function() {
      return new Ctor(...arguments);
    };

    return obj;
  }, {});
}

export default exportCtors([
  PeelrAttr,
  PeelrCustom,
  PeelrData,
  PeelrForm,
  PeelrHasClass,
  PeelrHash,
  PeelrHtml,
  PeelrIs,
  PeelrLink,
  PeelrList,
  PeelrText,
  PeelrVal
]);
