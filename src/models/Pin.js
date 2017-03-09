import THREE from 'three'
/*
TODO : make this a tear drop shape.
*/
export default class Pin extends THREE.Mesh {
  constructor (options) {
    let {lat, long, color, opacity} = options

    let geom = new THREE.SphereGeometry(1, 16, 16)
    let mat = new THREE.MeshPhongMaterial({ color: color })
    mat.transparent = true
    mat.opacity = opacity

    geom.applyMatrix(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(90)))
    geom.faces.forEach((face) => {
      face.color.setHex(color)
    })

    super(geom, mat)
    this.lat = lat
    this.long = long
  }
}
