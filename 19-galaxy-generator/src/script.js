import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

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

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 3
parameters.branchDensity = 2
parameters.densityFalloff = 1
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

let particlesGeometry = null
let particlesMaterial = null
let particles = null

const generateGalaxy = () => {
    // Destroy old galaxy
    if(particles !== null){
        particlesGeometry.dispose()
        particlesMaterial.dispose()
        scene.remove(particles)
    }
    
    particlesGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    let areOutOfBounds = false
    let smallest = 0
    let largest = 0
    for(let i = 0; i < parameters.count; i++){
        const i3 = i * 3

        // Position
        const radius = Math.pow(Math.random(), parameters.densityFalloff) * parameters.radius
        // const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI*2

        // const randomX = Math.pow(Math.random(), parameters.branchDensity) * (Math.random() < 0.5 ? 1 : -1) * (parameters.randomness / radius)
        // const randomY = Math.pow(Math.random(), parameters.branchDensity) * (Math.random() < 0.5 ? 1 : -1) * (parameters.randomness / radius)
        // const randomZ = Math.pow(Math.random(), parameters.branchDensity) * (Math.random() < 0.5 ? 1 : -1) * (parameters.randomness / radius) 
        // (parameters.randomness / (radius > 1 ? radius + 1 : 1))
        // const densityFalloffMultiplicator = (radius > 1 ? (parameters.randomness / radius) : 1)  
        const densityFalloffMultiplicator = (parameters.densityFalloff / (radius+1) < 1 ? (parameters.densityFalloff / (radius+1)) : 1)
        if(densityFalloffMultiplicator > 1 || densityFalloffMultiplicator < 0) areOutOfBounds = true
        if(densityFalloffMultiplicator > largest) largest = densityFalloffMultiplicator
        if(densityFalloffMultiplicator < smallest) smallest = densityFalloffMultiplicator
        const randomX = Math.pow(Math.random(), parameters.branchDensity) * (Math.random() < 0.5 ? 1 : -1) * densityFalloffMultiplicator * parameters.randomness
        const randomY = Math.pow(Math.random(), parameters.branchDensity) * (Math.random() < 0.5 ? 1 : -1) * densityFalloffMultiplicator * parameters.randomness
        const randomZ = Math.pow(Math.random(), parameters.branchDensity) * (Math.random() < 0.5 ? 1 : -1) * densityFalloffMultiplicator * parameters.randomness

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    console.log(areOutOfBounds, smallest, largest)
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    
    particlesMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })
    particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)
}

generateGalaxy()

const starsFolder = gui.addFolder('Stars').close()
starsFolder.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
starsFolder.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)

const galaxyFolder = gui.addFolder('Galaxy')
galaxyFolder.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)

const starArrangementFolder = gui.addFolder('Star Arrangement')
starArrangementFolder.add(parameters, 'randomness').min(0).max(10).step(0.1).onFinishChange(generateGalaxy)
starArrangementFolder.add(parameters, 'branchDensity').min(1).max(10).step(0.1).onFinishChange(generateGalaxy)
starArrangementFolder.add(parameters, 'densityFalloff').min(0).max(10).step(0.01).onFinishChange(generateGalaxy)

const colorsFolder = gui.addFolder('Colors').close()
colorsFolder.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
colorsFolder.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)










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
camera.position.x = 3
camera.position.y = 3
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()