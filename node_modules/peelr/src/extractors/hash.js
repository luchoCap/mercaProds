import PeelrValue from "../base/value";
import PeelrList from "./list";

function setDeep(target, propertyPath, value) {
  let [key, ...rest] = propertyPath;

  if (rest.length === 0) {
    target[key] = value;
  } else {
    if (!target[key]) {
      target[key] = {};
    }

    setDeep(target[key], rest, value);
  }
}

function parseHash(hash, path = []) {
  let values = [];
  let constants = [];

  for (let key in hash) {
    let val = hash[key];
    let kpath = [].concat(path, [key]);

    if (val instanceof PeelrValue) {
      values.push({ path: kpath, value: val });
    } else if (typeof val === "object") {
      let { values: subv, constants: subc } = parseHash(val, kpath);
      values.push(...subv);
      constants.push(...subc);
    } else {
      constants.push({ path: kpath, value: val });
    }
  }

  return { values, constants };
}

export default class PeelrHash extends PeelrList {
  constructor(selector, hash, options = {}) {
    options = Object.assign({ transform: x => x }, options);

    let { values, constants } = parseHash(hash);
    let { transform: callerTransform } = options;

    super(
      selector,
      values.map(v => v.value),
      Object.assign(options, {
        async transform(results, ctx) {
          let output = {};

          for (let i = 0; i < results.length; i++) {
            setDeep(output, values[i].path, results[i]);
          }

          for (let i = 0; i < constants.length; i++) {
            setDeep(output, constants[i].path, constants[i].value);
          }

          return await callerTransform(output, ctx);
        }
      })
    );
  }
}
