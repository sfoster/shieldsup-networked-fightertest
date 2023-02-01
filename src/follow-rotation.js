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
