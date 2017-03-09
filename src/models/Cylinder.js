import THREE from 'three'
import Helpers from '../helpers.js'

export default class Cylinder extends THREE.Mesh {
  constructor (options) {
    let {lat, long, color} = options

    let size = Helpers.getObjectGrowScale(options)
    let geom = new THREE.CylinderGeometry(size.x, size.y, size.z, 20)

    geom.applyMatrix(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(90)))
    geom.faces.forEach((face) => {
      face.color.setHex(color)
    })

    super(geom)
    this.lat = lat
    this.long = long
  }
}
