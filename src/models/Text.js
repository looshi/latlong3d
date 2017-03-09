import THREE from 'three'
/*
Text
Extruded 3d text.
*/
export default class Text extends THREE.Group {
  constructor (text, color, bevel, thickness, center) {
    let width = 1
    let height = 1
    color = color || 0xff0000
    let flat = THREE.FlatShading
    let smooth = THREE.SmoothShading
    let mat = new THREE.MeshFaceMaterial([
      new THREE.MeshPhongMaterial({ color: 0xffffff, shading: flat }),
      new THREE.MeshPhongMaterial({ color: color, shading: smooth })
    ])

    let options = {
      size: 1,
      height: thickness || 1,
      curveSegments: 10,
      font: 'droid sans',
      weight: 'normal',
      style: 'normal',
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelEnabled: bevel || true,
      material: 0,
      extrudeMaterial: 1
    }

    let geom = new THREE.TextGeometry(text, options)
    geom.computeBoundingBox()
    geom.computeVertexNormals()
    width = geom.boundingBox.max.x - geom.boundingBox.min.x
    height = geom.boundingBox.max.y - geom.boundingBox.min.y
    text = new THREE.Mesh(geom, mat)
    text.frustumCulled = false

    if (center) {
      const xOffset = -0.5 * width
      const yOffset = -0.5 * height
      text.position.set(xOffset, yOffset, 0)
    }

    super()
    this.width = width
    this.height = height
    this.color = color
    this.add(text)
  }
}
