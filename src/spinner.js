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
