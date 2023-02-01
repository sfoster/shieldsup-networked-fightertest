
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

class PseudoRNG {
  constructor(seedStr) {
    // Create cyrb128 state:
    let seed = this.seed = cyrb128(seedStr);
    // Four 32-bit component hashes provide the seed for sfc32.
    this.rand = sfc32(seed[0], seed[1], seed[2], seed[3]);
  }
  randomWithinBounds(lbound, ubound, coef=1) {
    const n = this.rand();
    let result = ((ubound - lbound) * n + lbound) * coef;
    return result;
  }
  randomIntWithinBounds(lbound, ubound, coef=1) {
    return Math.floor(this.randomWithinBounds(lbound, ubound, 1)) * coef;
  }
}

class _PseudoRNG {
  constructor() {
    this._nextIndex = 0;
  }
  rand() {
    const val = pool[this._nextIndex++];
    if (this._nextIndex >= pool.length) {
      this._nextIndex = 0;
    }
    return val;
  }
  randomWithinBounds(lbound, ubound, coef=1) {
    const n = this.rand();
    let result = ((ubound - lbound) * n + lbound) * coef;
    return result;
  }
  randomIntWithinBounds(lbound, ubound, coef=1) {
    return Math.floor(this.randomWithinBounds(lbound, ubound, 1)) * coef;
  }
}

console.log("Registering asteroid-field");

class XYZBoundsType {
  constructor(defaultValues) {
    this.default = defaultValues;
    this.type = "array";
  }
  parse(value) {
    // parse out 3 triplets into x, y, z properties
    if (typeof value == "string") {
      // e.g. "0:10 -3:6, -1:1"
      const triplets = value.split(/\s+/).map(s => s.trim());
      const returnValue = {
        x: triplets[0] ? triplets[0].split(":").map(n => Number(n)): this.default.x,
        y: triplets[1] ? triplets[1].split(":").map(n => Number(n)): this.default.y,
        z: triplets[2] ? triplets[2].split(":").map(n => Number(n)): this.default.z,
      };
      console.log("parsed XYZBoundsType:", value, returnValue);
      return returnValue;
    }
    return value;
  }
  stringify(value) {
    let str = [
      value.x.join(":"),
      value.y.join(":"),
      value.z.join(":"),
    ].join(" ");
  }
}

AFRAME.registerComponent('asteroid-field', {
  schema:{
    count:{type: 'int', default: 12},
    asset: { type: "asset" },
    seed: { type: "string", default: "asteroids" },
    modelScale: { type: "number", default: 0.5 },
    positionBounds: new XYZBoundsType({ x: [0, 1], y: [0, 1], z: [0, 1] }), 
    rotationBounds: new XYZBoundsType({ x: [0, 360], y: [0, 360], z: [0, 360] }), 
  },
  generateId() {
    if (!this._nextId) this._nextId = 0;
    return ("asteroid-"+(++this._nextId));
  },
  init: function () {
    console.log("asteroid-field, init with data:", this.data);
    const modelScale = this.data.modelScale;
    this.asteroids = {};
    this.rng = new PseudoRNG(this.data.seed);
    this.spinRng = new PseudoRNG(this.data.seed + "-spinner");
    const frag = document.createDocumentFragment();
    for (let i=0; i<this.data.count; i++) {
      let id = this.generateId();
      let ent = this.asteroids[id] = document.createElement("a-entity");
      if (this.data.asset) {
        ent.setAttribute("gltf-model", this.data.asset);
      }
      ent.id = id;
      let positionValue = [
        this.rng.randomWithinBounds(...this.data.positionBounds.x),
        this.rng.randomWithinBounds(...this.data.positionBounds.y),
        this.rng.randomWithinBounds(...this.data.positionBounds.z),
      ].join(" ");
      ent.setAttribute("position", positionValue);
      ent.object3D.scale.set(modelScale, modelScale, modelScale);
      let rotationValue = [
        this.rng.randomWithinBounds(...this.data.rotationBounds.x),
        this.rng.randomWithinBounds(...this.data.rotationBounds.y),
        this.rng.randomWithinBounds(...this.data.rotationBounds.z),
      ];
      ent.setAttribute("rotation", rotationValue);
      // console.log("asteroid-field, prepared rotation:", rotationValue);

      // set the per-axis spin speed 
      let spinnerValue = "axes: " + [
        this.spinRng.randomWithinBounds(0, 4),
        this.spinRng.randomWithinBounds(0, 4),
        this.spinRng.randomWithinBounds(0, 4),
      ].join(" ");
      ent.setAttribute("spinner", spinnerValue);
      // console.log("asteroid-field, prepared spinner:", spinnerValue);
      frag.appendChild(ent);
    }
    // console.log("asteroid-field, appending fragment:", frag.childNodes);
    this.el.appendChild(frag);
  },
  remove() {
    for(let [id] of Object.keys(this.asteroids)) {
      let ent = this.el.querySelector("#"+id);
      if (ent) {
        ent.parentNode.removeChild(ent);
      } else {
        console.warn("No asteroid entity found for id: ", id);
      }
    }
  }
});      
