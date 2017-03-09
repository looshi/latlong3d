import THREE from 'three'
import Helpers from 'helpers'
/*
WorldView.Arc
  Arc between two latitude/longitude points on the surface of Earth.
*/
export default class Arc extends THREE.Line {
  constructor (fromLat, fromLong, toLat, toLong, color) {
    if (!color) {
      color = 0xffffff  // default to white if no color specified
    }

    let a = Helpers.latLongToVector3(fromLat, fromLong)
    let b = Helpers.latLongToVector3(toLat, toLong)

    let m1 = Helpers.getPointInBetween(a, b, 0.4)
    let m2 = Helpers.getPointInBetween(a, b, 0.6)

    // extend offset higher if the points are further away
    let offset = Math.exp(0.5 * Helpers.getDistance(a, b))

    m1 = new THREE.Vector3(offset * m1.x, offset * m1.y, offset * m1.z)
    m2 = new THREE.Vector3(offset * m2.x, offset * m2.y, offset * m2.z)

    let curve = new THREE.CubicBezierCurve3(a, m1, m2, b)
    let geometry = new THREE.Geometry()
    geometry.vertices = curve.getPoints(100)
    let material = new THREE.LineBasicMaterial({color: color, linewidth: 2, fog: true})

    super(geometry, material)
  }

  getPoint (percentDistance) {
    this.curve.getPoint(percentDistance / 100)
  }
}
