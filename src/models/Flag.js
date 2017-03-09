import THREE from 'three'
import Text from 'Text.js'
/*
  Flag shape with text on it.
*/
export default class Flag extends THREE.Group {
  constructor (options) {
    let {lat, long, color, opacity, label} = options

    let text = new Text(label, 0xffffff, false, 0.0001)

    let padding = 0.4  // Adds padding around the text inside the rectangle.
    let rectW = text.width + (padding * 2.5)
    let rectH = text.height + (padding * 2)
    let flagH = 1
    let flagW = 0.5

    let flagShape = new THREE.Shape()
    flagShape.moveTo(0, 0)
    flagShape.lineTo(0, flagH + rectH)
    flagShape.lineTo(rectW, flagH + rectH)
    flagShape.lineTo(rectW, flagH)
    flagShape.lineTo(flagW, flagH)
    flagShape.lineTo(0, 0)

    let geometry = new THREE.ShapeGeometry(flagShape)
    let sMat = new THREE.MeshPhongMaterial({color: color, side: THREE.DoubleSide})
    let shapeMesh = new THREE.Mesh(geometry, sMat)
    sMat.transparent = true
    sMat.opacity = opacity

    super()
    this.add(shapeMesh)
    this.add(text)
    shapeMesh.position.set(0, 0, 0.01)
    text.position.set(padding, flagH + padding, 0.02)
    this.lat = lat
    this.long = long
  }
}
