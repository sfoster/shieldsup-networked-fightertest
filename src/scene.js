const freezeThaw = require("./freezeThaw.js");

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

// document.addEventListener("DOMContentLoaded", () => {
//   initScene();
// });

module.exports = {
  initScene,
};
