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