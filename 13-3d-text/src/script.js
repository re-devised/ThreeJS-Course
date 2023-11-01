import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'


THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes helper
// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('textures/matcaps/3.png')


// Fonts

const fontLoader = new FontLoader()
fontLoader.load('fonts/helvetiker_regular.typeface.json', font => {
    const textGeometry = new TextGeometry('RE:DEVISED', {
        font: font,
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    })
    // textGeometry.computeBoundingBox()
    // textGeometry.translate(
    //     -1 * (textGeometry.boundingBox.max.x - 0.02) / 2, //-0.02 is the bevel on the edges
    //     -1 * (textGeometry.boundingBox.max.y - 0.02) / 2,
    //     -1 * (textGeometry.boundingBox.max.z - 0.03) / 2
    // )
    textGeometry.center()
    
    const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
    const text = new THREE.Mesh(textGeometry, material)
    scene.add(text)


    const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
    for(let i = 0; i < 500; i++){
        const donut = new THREE.Mesh(donutGeometry, material)

        const paddingFromCenter = 0.5
        const posX = (Math.random() - 0.5) * 15 
        const posY = (Math.random() - 0.5) * 15
        const posZ = (Math.random() - 0.5) * 15
        donut.position.x = posX > 0 ? posX+paddingFromCenter : posX-paddingFromCenter
        donut.position.y = posY > 0 ? posY+paddingFromCenter : posY-paddingFromCenter
        donut.position.z = posZ > 0 ? posZ+paddingFromCenter : posZ-paddingFromCenter

        donut.rotation.x = Math.random() * Math.PI
        donut.rotation.y = Math.random() * Math.PI

        const scale = Math.random()
        donut.scale.set(scale, scale, scale)

        scene.add(donut)
    }
})



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()