import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
let currentScene = 'stars'
const guiObject = {
    starsScene: () => currentScene = 'stars',
    scanScene: () => currentScene = 'scan',
    waveScene: () => currentScene = 'wave'
}
gui.add(guiObject, 'starsScene')
gui.add(guiObject, 'scanScene')
gui.add(guiObject, 'waveScene')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/9.png')





// Particles
const particlesGeometry = new THREE.BufferGeometry()
const count = 5000

const positions = new Float32Array(count * 3)
for(let i = 0; i < count*3; i++){
    positions[i] = (Math.random() - 0.5) * 10
}

particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    sizeAttenuation: true,
    transparent: true,
    alphaMap: particleTexture,
    depthWrite: false,
    blending: THREE.AdditiveBlending
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)







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
camera.position.z = 3
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

    // Update particles

    // General rotation animation
    if(currentScene == 'stars'){
        particles.rotation.y = elapsedTime * 0.2
    }

    // Scanner up and down animation
    if(currentScene == 'scan'){
        particles.rotation.y = 0
        for(let i = 0; i < count; i++){
            const i3 = i * 3
            particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime)
        }
        particlesGeometry.attributes.position.needsUpdate = true
    }

    // Wave animation
    if(currentScene == 'wave'){
        particles.rotation.y = 0
        for(let i = 0; i < count; i++){
            const i3 = i * 3
            const x = particlesGeometry.attributes.position.array[i3 + 0]
            particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
        }
        particlesGeometry.attributes.position.needsUpdate = true
    }


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()