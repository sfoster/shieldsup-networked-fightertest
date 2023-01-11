/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

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
    // console.log("Loaded, result:", result);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initScene();
});

module.exports = {
  initScene,
};


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