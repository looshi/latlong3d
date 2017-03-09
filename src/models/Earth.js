import THREE from 'three'
/*
3D model of the Earth with image texture.
doneLoading callback is invoked after the image texture is loaded
*/
export default class Earth {
  constructor (imagepath, doneLoading) {
    this.earthGeometry = new THREE.SphereGeometry(100, 64, 64)
    this.earthMaterial = new THREE.MeshPhongMaterial()
    this.earthMaterial.map = THREE.ImageUtils.loadTexture(
      imagepath,
      THREE.UVMapping,
      doneLoading)
    this.earth = new THREE.Mesh(this.earthGeometry, this.earthMaterial)
    return this.earth
  }
}
