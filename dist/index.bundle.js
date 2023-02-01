/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/asteroid-field.js":
/*!*******************************!*\
  !*** ./src/asteroid-field.js ***!
  \*******************************/
/***/ (() => {


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


/***/ }),

/***/ "./src/follow-rotation.js":
/*!********************************!*\
  !*** ./src/follow-rotation.js ***!
  \********************************/
/***/ (() => {

/* global AFRAME */
AFRAME.registerComponent('follow-rotation', {
  schema: {
    target: {
      type: "selector",
      default: false,
    },
    damp: {
      type: "number",
      default: 0.1,
    },
  },
  init: function () {
    // the resting state we want to return to
    this.startRotationV3 = new THREE.Vector3( 0, 0, 0 );
    // our current rotation
    this.currentRotationV3 = this.startRotationV3.clone();
    // the last rotation of the target
    this.previousRotationV3 = new THREE.Vector3( 0, 0, 0 );
    // the current target rotation
    this.targetRotationV3 = new THREE.Vector3( 0, 0, 0 );
    // temporary delta rotation
    this.deltaV3 = new THREE.Vector3( 0, 0, 0 );
  },
  __didRotationChange(a, b) {
    return !a || !b || a.distanceToSquared(b) > 0.001;
  },
  didRotationChange(a, b, label="") {
    let retValue = false;
    if (!a || !b) {
      console.log("didRotationChange: a || b falsey", label);
      retValue = true;
    } else if (a.distanceToSquared(b) > 0.001) {
      retValue = true;
    }
    if (retValue) console.log("didRotationChange", label);

    return retValue;
  },
  v3ToString(v3) {
    const accuracy = 1000;
    return `x: ${ Math.round(v3.x * 1000) / 1000}, y: ${ Math.round(v3.y * 1000) / 1000}, z: ${ Math.round(v3.z * 1000) / 1000}`;
  },
  tick() {
    if (!this.data.target) {
      return;
    }
    // we want to lag the rotation
    // and trend back towards the start rotation
    this.targetRotationV3.setFromEuler(this.data.target.object3D.rotation);
    this.currentRotationV3.setFromEuler(this.el.object3D.rotation);

    if (this.didRotationChange(this.targetRotationV3, this.previousRotationV3, "target-rotation")) {
      this.deltaV3.copy(this.previousRotationV3);
      this.deltaV3.sub(this.targetRotationV3);
      this.currentRotationV3.add(this.deltaV3);
      this.currentRotationV3.lerp(this.startRotationV3, 0.05);
      this.el.object3D.rotation.setFromVector3(this.currentRotationV3);
      this.previousRotationV3.copy(this.targetRotationV3);
    } else if (
      this.didRotationChange(this.currentRotationV3, this.startRotationV3, "current-start")
    ) {
      this.currentRotationV3.lerp(this.startRotationV3, this.data.damp);
      this.el.object3D.rotation.setFromVector3(this.currentRotationV3);
    }
  }
});


/***/ }),

/***/ "./src/freezeThaw.js":
/*!***************************!*\
  !*** ./src/freezeThaw.js ***!
  \***************************/
/***/ ((module) => {

var sceneData = null;

function generateId(elem) {
  return "e-"+Math.floor(Math.random() * Date.now() * 1000);
}

function generatePath(elem) {
  let parts = [];
  while (elem && elem.localName != "a-scene") {
    parts.unshift(elem.id ? `#${elem.id}` : elem.localName);
    elem = elem.parentNode;
  }
  return parts.join(" > ");
}

function visitElement(elem, parentElem) {
  let match = elem.localName.match(/^a-(.+)/);
  if (match) {
    let entity = {
      "a-type": match[1]
    };
    for (let attr of elem.attributes) {
      entity[attr.name] = attr.value;
    }
    if (!entity.id) {
      entity.id = elem.id = generateId(elem);
    }
    entity["a-path"] = generatePath(elem);
    if (parentElem && parentElem.id) {
      entity.parentId = parentElem.id;
    }
    console.log("adding entity: ", entity);
    sceneData.entities.push(entity);
  }
  if (elem.childElementCount) {
    for (child of elem.children) {
      visitElement(child, elem);
    }
  }
}

function visitAssets(elem) {
  console.log("visitAssets:", elem.childElementCount);
  for (let assetItem of elem.children) {
    sceneData.assets.push({
      id: assetItem.id || generateId(elem),
      src: assetItem.getAttribute("src"),
    });
    console.log("Adding asset:", sceneData.assets[sceneData.assets.length-1]);
  }
}

function walkScene() {
  sceneData = {
    assets: [],
    entities: [],
  };
  let sceneElem = document.querySelector("a-scene");
  for (let child of sceneElem.children) {
    console.log("visiting scene child", child);
    if (child.localName == "a-assets") {
      visitAssets(child);
    } else {
      visitElement(child);
    }
  }
  return sceneData;
}

function addAssets(assetsList, sceneElem) {
  console.log("addAssets:", assetsList);
  if (!sceneElem) {
    sceneElem = document.querySelector("a-scene");
  }
  let frag = document.createDocumentFragment();
  console.log("adding scene assets:", assetsList);
  // assets
  for (let assetInfo of assetsList) {
    let elem = document.createElement("a-assets-item");
    for (let [name, value] of Object.entries(assetInfo)) {
      elem.setAttribute(name, value);
    }
    frag.appendChild(elem);
  }
  let assetElem = sceneElem.querySelector("a-assets");
  assetElem.appendChild(frag);
}

function addEntities(entityList, sceneElem) {
  console.log("addEntities:", entityList);
  if (!sceneElem) {
    sceneElem = document.querySelector("a-scene");
  }
  let fragment = document.createDocumentFragment();
  let excludeAttributeProperties = new Set(["a-type", "a-path", "_depth"])

  for (let entity of entityList) {
    let elem = document.createElement("a-" + entity["a-type"]);
    let parentNode;
    if (entity.parentId) {
      // try the fragment first
      parentNode = fragment.getElementById(entity.parentId);
      if (!parentNode) {
        parentNode = document.getElementById(entity.parentId);
      }
      if (!parentNode) {
        console.warn("Missing parentNode for child", entity["a-path"], entity.parentId);
        continue;
      }
    } else {
      parentNode = fragment;
    }
    for (let [name, value] of Object.entries(entity)) {
      if (excludeAttributeProperties.has(name)) {
        continue;
      }
      elem.setAttribute(name, value);
    }
    parentNode.appendChild(elem);
  }
  if (fragment.childElementCount) {
    sceneElem.appendChild(fragment);
  }
}

function sortEntities(remoteEntities) {
  console.log("remoteEntities:", remoteEntities);
  let sortedEntities = [];
  for (let entity of remoteEntities) {
    if (!entity._depth) {
      entity._depth = entity["a-path"].split(" > ").length;
    }
    sortedEntities.push(entity);
  }
  sortedEntities.sort((a, b) => {
    return a._depth > b._depth;
  });
  return sortedEntities;
}

module.exports = { walkScene, addAssets, addEntities, sortEntities };

/***/ }),

/***/ "./src/scene.js":
/*!**********************!*\
  !*** ./src/scene.js ***!
  \**********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const freezeThaw = __webpack_require__(/*! ./freezeThaw.js */ "./src/freezeThaw.js");
__webpack_require__(/*! ./asteroid-field.js */ "./src/asteroid-field.js");
__webpack_require__(/*! ./follow-rotation.js */ "./src/follow-rotation.js");
__webpack_require__(/*! ./spinner.js */ "./src/spinner.js");

function requestSceneData(filename) {
  const dataURL = new URL(filename, window.location.href);
  console.log(`fetching ${dataURL}`);

  return fetch(dataURL, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then(resp => resp.json()).catch(err => console.log("fetch error:", err));
}

function initScene(sceneData) {
  let dataLoaded = requestSceneData("scene.json");
  let sceneLoaded = new Promise((resolve) => {
    if (document.readyState == "complete") {
      resolve({ target: document.querySelector("a-scene") });
      return;
    }
    window.addEventListener("DOMContentLoaded", () => {
      const sceneElem = document.querySelector("a-scene");
      sceneElem.addEventListener("loaded", resolve, { once: true });
    });
  });
  Promise.all([dataLoaded, sceneLoaded]).then(([sceneData, loadedEvent]) => {
    let { assets, entities } = sceneData;
    let sceneElem = loadedEvent.target;
    freezeThaw.addAssets(assets, sceneElem);
    let sortedEntities = freezeThaw.sortEntities(entities);
    freezeThaw.addEntities(sortedEntities, sceneElem);
  });
}

module.exports = {
  initScene,
};


/***/ }),

/***/ "./src/spinner.js":
/*!************************!*\
  !*** ./src/spinner.js ***!
  \************************/
/***/ (() => {

AFRAME.registerComponent('spinner', {
  schema:{
    axes:{type: 'vec3', default: {x: 0, y: 0, z: 0}}
  },
  init: function () {
    let spinaxes = this.el.components.spinner.axes; 
    console.log("spinner init", this.data);
  },
  tick: function(){ // called every frame
    let rot = this.el.getAttribute('rotation');
    let spinaxes = this.data.axes;
    this.el.setAttribute('rotation', {
      x: rot.x + spinaxes.x*1, 
      y: rot.y + spinaxes.y*1,
      z: rot.z + spinaxes.z*1
    });
  }      
});      


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__(/*! ./freezeThaw.js */ "./src/freezeThaw.js");
__webpack_require__(/*! ./scene.js */ "./src/scene.js");

})();

/******/ })()
;
//# sourceMappingURL=index.bundle.js.map