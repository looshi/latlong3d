import {_} from 'lodash'
import THREE from 'three'

let WorldView = {}
WorldView.CUBE = 'cube'
WorldView.CYLINDER = 'cylinder'
WorldView.SPHERE = 'sphere'
WorldView.CONE = 'cone'
WorldView.PIN = 'pin'
WorldView.FLAG = 'flag'
WorldView.WIDTH = 'width'
WorldView.HEIGHT = 'height'
WorldView.BOTH = 'both'

const VECTOR_ZERO = new THREE.Vector3()  // 0,0,0 point
const DEFAULT_TEXTURE = '/packages/looshi_worldview/assets/earthmap4k.jpg'
const EARTH_RADIUS = 100

export default class World {
  constructor (options = {}) {
    // options setup
    this.earthImagePath = options.earthImagePath || DEFAULT_TEXTURE
    this.domNode = options.renderTo || null
    this.backgroundColor = options.backgroundColor || 0x000000
    this.series = options.series || []

    // renderer setup
    this.renderer = new THREE.WebGLRenderer({antialias: true})
    this.renderer.shadowMapEnabled = true
    this.renderer.autoClear = false
    this.renderer.setClearColor(this.backgroundColor, 1)
    this.mainScene = new THREE.Scene()
    this.zScene = new THREE.Scene()      // zScene renders above mainScene
    this.pins = []
    this.flags = []
    this.camera = null
    this.controls = null
    this.earthParent = null
    this.earth = null

    // geometry which merge objects are merged to
    this.surfaceGeom = new THREE.Geometry()

    if (this.domNode) {
      this.renderTo(this.domNode)
    }

    this.addSeriesObjects(this.series)
  }

  // Renders the scene.  Applies proportional scaling Flag and Pin objects.
  renderCameraMove () {
    // scale pins and flags inversely proportional to zoom
    let zoomScale = 0.01 * this.camera.position.distanceTo(VECTOR_ZERO)

    this.pins.forEach((pin) => {
      pin.scale.set(zoomScale, zoomScale, zoomScale)
    })

    this.flags.forEach((flag) => {
      // manually hide flags when they go behind earth when
      // the angle at Vector Zero for the triangle flag,0,camera > 90 degrees
      let a = WorldView.getDistance(this.camera.position, flag.position)
      let b = WorldView.getDistance(flag.position, VECTOR_ZERO)
      let c = WorldView.getDistance(this.camera.position, VECTOR_ZERO)
      let Angle = (b * b + c * c - a * a) / (2 * b * c)
      // hide around 1.2 radians ( trial and error, 90 degrees = 1.57 radians)
      Angle = Math.acos(Angle)
      if (Angle < 1.2) {
        flag.visible = true
        flag.scale.set(zoomScale, zoomScale, zoomScale)
        flag.setRotationFromQuaternion(this.camera.quaternion)
      } else {
        flag.visible = false
      }
    })
    this.renderScene()
  }
  /*
  * Renders the scene.  Does not apply proportional scaling of flags or pins.
  *
  * Automatically called in all of the 'add' methods, addPin, addFlag, etc.
  * You only need to call this function if you are manually manipulating
  * the scene outside the API calls available.
  *
  * Example
  *
  * myCube = new THREE.Mesh( myGeometry, myMaterial );
  * myWorld.add( myCube );        // scene will be automatically rendered
  * myCube.position.set(3, 3, 3); // make some changes later
  * world.renderScene();          // now you'll need to call render
  */
  renderScene () {
    this.renderer.clear()
    this.renderer.render(this.mainScene, this.camera)
    this.renderer.clearDepth()
    this.renderer.render(this.zScene, this.camera)
  }

  addLighting () {
    const ambientLight = new THREE.AmbientLight(0xcccccc)
    this.camera.add(ambientLight)
    this.zScene.add(ambientLight.clone())
    const light = new THREE.DirectionalLight(0xffffff, 0.5)
    light.castShadow = true
    light.position.set(-300, 80, -100)
    light.castShadow = true
    this.zScene.add(light.clone())
    this.camera.add(light)
  }

  // domNode = the id of the dom element to render in.
  renderTo (domNode) {
    domNode = document.getElementById(domNode)
    domNode.append(this.renderer.domElement)
    let dW = domNode.clientWidth
    let dH = domNode.clientHeight
    this.renderer.setSize(dW, dH)
    let cameraFar = EARTH_RADIUS * 6 // distance from camera to render
    this.camera = new THREE.PerspectiveCamera(45, dW / dH, 1, cameraFar)
    this.camera.position.z = EARTH_RADIUS * 4
    this.controls = new THREE.OrbitControls(this.camera, domNode)
    this.controls.damping = 0.2
    this.controls.addEventListener('change', this.renderCameraMove)
    this.mainScene.add(this.camera)
    this.earthParent = new THREE.Group()
    this.earth = new WorldView.Earth(this.earthImagePath, this.renderCameraMove)
    this.earthParent.add(this.earth)
    this.mainScene.add(this.earthParent)
    this.addLighting()
    this.renderCameraMove()
    return this.earthParent
  }

  // Sets the size of the renderer.
  setSize (width, height) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.renderCameraMove()
  }

  /*
  * Adds a 3D pin object at the given location.
  * Returns the 3D pin object.
  */
  addPin (options) {
    let pin = new WorldView.Pin(options)
    this.pins.push(pin)
    this.addToSurface(pin, options.lat, options.long)
    return pin
  }

  // Returns the 3D pin object or null if no pin exists at this location.
  getPin (lat, long) {
    return _.find(this.pins, (pin) => {
      return pin.lat === lat && pin.long === long
    })
  }

  /*
  * Adds a flag object with text at the given location.
  * Returns the 3D flag object.
  */
  addFlag (options) {
    let flag = new WorldView.Flag(options)
    this.addToSurface(flag, options.lat, options.long, this.zScene)
    this.flags.push(flag)
    return flag
  }

  /*
  * Adds any 3D object to the surface of the earth.
  * Use this method if you need to retain interactivity or move the object
  * after it has been added to the scene.  This method returns the 3D object
  * instance for use later.
  * Returns the 3D object.
  */
  addToSurface (obj, lat, long, scene) {
    scene = scene || this.mainScene
    scene.add(obj)
    let point = WorldView.latLongToVector3(lat, long)
    obj.position.set(point.x, point.y, point.z)
    this.renderCameraMove()
    return obj
  }

  _mergeCube (options) {
    let cube = new WorldView.Cube(options)
    this._mergeToSurface(cube, options.lat, options.long)
    return cube
  }

  _mergeCylinder (options) {
    let cylinder = new WorldView.Cylinder(options)
    this._mergeToSurface(cylinder, options.lat, options.long)
    return cylinder
  }

  _mergeCone (options) {
    let cone = new WorldView.Cone(options)
    this._mergeToSurface(cone, options.lat, options.long)
    return cone
  }

  /*
  * Merges mesh to the surface of the earth.
  * The object properties will no longer be editable.
  */
  _mergeToSurface (obj, lat, long) {
    let zOffset = 0
    let {width, depth, radiusTop, height} = obj.geometry.parameters
    if (depth) { // CUBE
      zOffset = depth / 2 - WorldView.getObjectSurfaceOffset(width)
    } else if (radiusTop && height) { // CYLINDER
      zOffset = height / 2 - WorldView.getObjectSurfaceOffset(radiusTop * 2)
    }

    let point = WorldView.latLongToVector3(lat, long, zOffset)
    obj.position.set(point.x, point.y, point.z)

    WorldView.lookAwayFrom(obj, this.earthParent)
    obj.updateMatrix()

    this.surfaceGeom.merge(obj.geometry, obj.matrix)

    return null
  }

  // Adds any 3D object to the scene.
  add (obj) {
    this.mainScene.add(obj)
    this.renderCameraMove()
  }

  // Removes 3D object from the scene.
  remove (obj) {
    this.mainScene.remove(obj)
    // TODO call .dispose ()
    this.renderCameraMove()
  }

  /*
  * Adds data items to the surface.
  *
  * series objects are in the format :
  *
  * - `name` : String name of series
  * - `type` : String 3D object which represents each data item
  * - `color`: Number Color of 3D object
  * - `data`: Array of series.data Arrays
  *
  * series.data Arrays are in the format (order matters ) :
  *
  * - [latitude,
  * - longitude,
  * - amount(optional),
  * - color(optional),
  * - label (optional),
  *
  * this.method addSeriesObjects
  * this.param {Object} options.series object
  * this.return returns nothing.
  */
  addSeriesObjects (series) {
    let LAT = 0
    let LONG = 1
    let COLOR = 2
    let AMOUNT = 3
    let LABEL = 4
    let max = null
    let min = null
    let itemColor

    series.forEach((s) => {
      if (Array.isArray(s.color)) {
        max = _.max(s.data, (item) => { return item[AMOUNT] })[AMOUNT]
        min = _.min(s.data, (item) => { return item[AMOUNT] })[AMOUNT]
      }

      s.data.forEach((data) => {
        if (data[COLOR]) {
          itemColor = data[COLOR]
        } else if (Array.isArray(s.color)) {
          let percent = (data[AMOUNT] - min) / (max - min)
          itemColor = WorldView.blendColors(s.color[0], s.color[1], percent)
        } else {
          itemColor = s.color
        }

        if (typeof itemColor === 'string') {
          itemColor = WorldView.stringToHex(itemColor)
        }

        const options = {
          lat: data[LAT] || 0,
          long: data[LONG] || 0,
          color: itemColor || 0xffffff,
          amount: data[AMOUNT] || 1,
          label: data[LABEL] || '',
          opacity: s.opacity || 1,
          scale: s.scale || 1,
          grow: s.grow || 'height',
          girth: s.girth || 1,
          height: s.height || 1
        }

        if (s.type === WorldView.PIN) this.addPin(options)
        if (s.type === WorldView.FLAG) this.addFlag(options)
        if (s.type === WorldView.CUBE) this._mergeCube(options)
        if (s.type === WorldView.CYLINDER) this._mergeCylinder(options)
        if (s.type === WorldView.CONE) this._mergeCone(options)
      })
    })

    let surfaceMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      shading: THREE.SmoothShading,
      vertexColors: THREE.VertexColors
    })

    let surfaceMesh = new THREE.Mesh(this.surfaceGeom, surfaceMaterial)
    this.mainScene.add(surfaceMesh)
    this.renderCameraMove()
  }

  /*
  * Draws an arc between two coordinates on the earth.
  * Returns the arc object.
  */
  addArc (fromLat, fromLong, toLat, toLong, color) {
    let arc = new WorldView.Arc(fromLat, fromLong, toLat, toLong, color)
    this.earthParent.add(arc)
    this.renderScene()
    return arc
  }

  // Animates an object along an arc.
  animateObjectOnArc (arc, obj, duration) {
    if (!obj['positionOnArc']) {
      obj.positionOnArc = duration
    }
    let point = arc.getPoint(obj.positionOnArc)
    obj.position.set(point.x, point.y, point.z)
    obj.positionOnArc = obj.positionOnArc - 1
    if (obj.positionOnArc > 0) {
      if (window && window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          this.animateObjectOnArc(arc, obj)
          this.renderScene()
        })
      }
    } else {
      this.earthParent.remove(obj)
      this.renderScene()
    }
  }
}
