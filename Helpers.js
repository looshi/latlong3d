
export default {
  latLongToVector3 (lat, lon, height=0) {
    let radius = WorldView.EARTH_RADIUS
    let phi = (lat)*Math.PI/180
    let theta = (lon-180)*Math.PI/180
    let x = -(radius+height) * Math.cos(phi) * Math.cos(theta)
    let y = (radius+height) * Math.sin(phi)
    let z = (radius+height) * Math.cos(phi) * Math.sin(theta)
    return new THREE.Vector3(x, y, z)
  },

  getPointInBetween (pointA, pointB, percentage) {
    let dir = pointB.clone().sub(pointA)
    let len = dir.length()
    dir = dir.normalize().multiplyScalar(len * percentage)
    return pointA.clone().add(dir)
  },

  getDistance (pointA, pointB) {
    let dir = pointB.clone().sub(pointA)
    return dir.length()
  },

  lookAwayFrom (object, target) {
    let vector = new THREE.Vector3()
    vector.subVectors(object.position, target.position).add(object.position)
    object.lookAt(vector)
  },

  getObjectSurfaceOffset (girth) {
    let r = WorldView.EARTH_RADIUS
    return r - Math.sqrt(r * r - girth * girth / 2)
  },

  getObjectGrowScale (options) {
    let {grow, girth, height, amount, scale} = options
    let amount = amount * scale
    let growScale
    if (grow === 'height') {
      growScale = new THREE.Vector3(girth, girth, amount)
    } else if (grow === 'width') {
      growScale = new THREE.Vector3(amount, amount, height)
    } else if (grow === 'both') {
      growScale = new THREE.Vector3(amount, amount, amount)
    }
    return growScale
  },

  // http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
  blendColors (c0, c1, p) {
    let f = parseInt(c0.slice(1),16)
    let t = parseInt(c1.slice(1),16)
    let R1 = f>>16
    let G1 = f>>8&0x00FF
    let B1 = f&0x0000FF
    let R2 = t>>16
    let G2 = t>>8&0x00FF
    let B2 = t&0x0000FF
    let color = "0x"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1)
    return Number(color)
  },

  stringToHex (color) {
    color = color.substring(1)
    color = '0x' + color
    Number(color)
  }
}
