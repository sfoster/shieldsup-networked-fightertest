/* global AFRAME */
const UNDEFINED_VALUE = "undef";
AFRAME.registerComponent('playable', {
  schema: {
    active: {
      type: "boolean",
      default: false,
    },
  },
  inactiveComponentMap: {
    ':self': {
      "gamepad-controls": UNDEFINED_VALUE,
      "keyboard-controls": UNDEFINED_VALUE,
      "movement-controls": UNDEFINED_VALUE,
      "touch-controls": UNDEFINED_VALUE,
      "trackpad-controls": UNDEFINED_VALUE,
      "playable": {active: false},
    },
    '.controls-slot': {
      "camera": {active: false},
      "look-controls": UNDEFINED_VALUE,
    },
  },
  activeComponentMap: {
    '.controls-slot': {
      "camera": {active: true},
      "look-controls": {enabled: true, pointerLockEnabled: false, touchEnabled: true, magicWindowTrackingEnabled: true, reverseMouseDrag: false, reverseTouchDrag: false, mouseEnabled: true},
    },
    ':self': {
      "movement-controls": {fly: true, speed: 0.1, camera: ":id .controls-slot", enabled: true},
      "playable": {active: true},
    },
  },
  init: function () {
    if (!AFRAME.components._typesCache) {
      AFRAME.components._typesCache = {};
    }
  },
  resolvePrefixedSelector(elem, selector) {
    if ((/^:id\b/).test(selector)) {
      let newSelector = `#${elem.id}${selector.substring(":id".length)}`;
      console.log(`replaced selector value: ${selector} to ${newSelector}`);
      return newSelector;
    }
    return selector;
  },
  resolvePropertyValue(elem, component, pname="", pvalue) {
    let type = AFRAME.components._typesCache[`${component}:${pname}`];
    if (!type) {
      type = AFRAME.components[component].isSingleProp ? 
        AFRAME.components[component].schema.type :
        AFRAME.components[component].schema[pname].type;
      AFRAME.components._typesCache[`${component}:${pname}`] = type;
    }
    if (type == "selector") {
      return this.resolvePrefixedSelector(elem, pvalue);
    }
    return pvalue;
  },
  updateComponents(rootEl, componentsValues) {
    for(let [selector, attrs] of Object.entries(componentsValues)) {
      const el = selector == ":self" ? rootEl : rootEl.querySelector(selector);
      if (!el) {
        console.warn("updateComponents: Didn't match selector:", selector);
        continue;
      }
      for (let [component, data] of Object.entries(attrs)) {
        if (data === UNDEFINED_VALUE) {
          console.log("updateComponents: removing component:", component);
          el.removeAttribute(component);
        } else if (typeof data == "object") {
          for (let [pname, pvalue] of Object.entries(data)) {
            let newValue = this.resolvePropertyValue(el, component, pname, pvalue);
            //console.log("updateComponents: updating component:", component, pname, pvalue, newValue);
            el.setAttribute(component, pname, newValue);
          }
        } else {
          let newData = this.resolvePropertyValue(el, component, undefined, data);
          //console.log("updateComponents: updating component:", component, data, newData);
          el.setAttribute(component, newData);
        }
      }
    }
  },
  takeControl: function() {
    // find the element that is currently controlled
    if (this.data.active) {
      console.log(`${this.el.id} is already controlled`);
      return;
    }
    const playables = this.el.sceneEl.querySelectorAll("[playable]");
    const previousRig = Array.from(playables).find(elem => {
      const playableComponent = elem.components.playable;
      if (!playableComponent) {
        console.warn("Matched element that doesnt have the playable component", elem.components);
        return false;
      }
      return playableComponent.data.active;
    });
    // make the previously active playable inactive
    this.updateComponents(previousRig, this.inactiveComponentMap);
    // make this playable active
    this.updateComponents(this.el, this.activeComponentMap);
  }
});

