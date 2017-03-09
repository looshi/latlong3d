import THREE from 'three'
import Helpers from '../helpers.js'

/*
WorldView.Cone
  Cone shaped object
*/
export default class Cone extends THREE.Mesh {
  constructor (options) {
    let {lat, long, color} = options

    let size = Helpers.getObjectGrowScale(options)
    let geom = new THREE.CylinderGeometry(0, size.y, size.z, 20)

    geom.applyMatrix(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(90)))
    geom.faces.forEach((face) => {
      face.color.setHex(color)
    })

    super(geom)
    this.lat = lat
    this.long = long
  }
}
