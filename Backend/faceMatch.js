/**
 * Face Matching Utility using face-api.js
 * Detects faces in images and compares face descriptors
 */

// Import TensorFlow.js BEFORE face-api to use pure JS backend
require('@tensorflow/tfjs');

const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');
const fs = require('fs');

// Patch face-api with node-canvas
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Models directory
const MODELS_PATH = path.join(__dirname, 'models');

// Track if models are loaded
let modelsLoaded = false;

/**
 * Download models if they don't exist
 */
async function ensureModels() {
    if (!fs.existsSync(MODELS_PATH)) {
        fs.mkdirSync(MODELS_PATH, { recursive: true });
    }

    // Check if models exist by looking for a key file
    const manifestFile = path.join(MODELS_PATH, 'ssd_mobilenetv1_model-weights_manifest.json');

    if (!fs.existsSync(manifestFile)) {
        console.log('📦 Models not found. Please download models manually.');
        console.log('   Run: node downloadModels.js');
        console.log('   Or download from: https://github.com/vladmandic/face-api/tree/master/model');
        return false;
    }
    return true;
}

/**
 * Load face detection and recognition models
 */
async function loadModels() {
    if (modelsLoaded) return true;

    try {
        console.log('🔄 Loading face-api models...');

        const hasModels = await ensureModels();
        if (!hasModels) {
            console.log('⚠️ Models not available. Face matching will be skipped.');
            return false;
        }

        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);

        modelsLoaded = true;
        console.log('✅ Face-api models loaded successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error loading face-api models:', error.message);
        return false;
    }
}

/**
 * Load image from file path
 */
async function loadImage(imagePath) {
    const img = await canvas.loadImage(imagePath);
    return img;
}

/**
 * Detect face in an image and extract descriptor
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<{descriptor: Float32Array, detection: object} | null>}
 */
async function detectFace(imagePath) {
    try {
        if (!modelsLoaded) {
            const loaded = await loadModels();
            if (!loaded) return null;
        }

        console.log(`🔍 Detecting face in: ${path.basename(imagePath)}`);

        const img = await loadImage(imagePath);

        // Detect all faces with landmarks and descriptors
        const detections = await faceapi
            .detectAllFaces(img)
            .withFaceLandmarks()
            .withFaceDescriptors();

        if (detections.length === 0) {
            console.log('   ❌ No face detected');
            return null;
        }

        // Use the largest face (most prominent)
        const largest = detections.reduce((prev, current) => {
            const prevArea = prev.detection.box.width * prev.detection.box.height;
            const currArea = current.detection.box.width * current.detection.box.height;
            return currArea > prevArea ? current : prev;
        });

        console.log(`   ✓ Face detected (confidence: ${(largest.detection.score * 100).toFixed(1)}%)`);

        return {
            descriptor: largest.descriptor,
            detection: {
                score: largest.detection.score,
                box: largest.detection.box
            }
        };
    } catch (error) {
        console.error(`   ❌ Face detection error: ${error.message}`);
        return null;
    }
}

/**
 * Compare two face descriptors
 * @param {Float32Array} descriptor1 - First face descriptor
 * @param {Float32Array} descriptor2 - Second face descriptor
 * @returns {number} - Euclidean distance (lower = more similar, <0.6 is typically a match)
 */
function compareFaces(descriptor1, descriptor2) {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    return distance;
}

/**
 * Full face matching pipeline
 * @param {string} imagePath1 - Path to first image (e.g., Aadhaar)
 * @param {string} imagePath2 - Path to second image (e.g., live capture)
 * @param {number} threshold - Match threshold (default 0.6)
 * @returns {Promise<{match: boolean, distance: number, error?: string}>}
 */
async function matchFaces(imagePath1, imagePath2, threshold = 0.6) {
    console.log('\n🔄 Starting face matching...');

    // Detect faces
    const face1 = await detectFace(imagePath1);
    const face2 = await detectFace(imagePath2);

    if (!face1) {
        return { match: false, distance: -1, error: 'No face detected in first image (Aadhaar)' };
    }

    if (!face2) {
        return { match: false, distance: -1, error: 'No face detected in second image (Live capture)' };
    }

    // Compare
    const distance = compareFaces(face1.descriptor, face2.descriptor);
    const match = distance < threshold;

    console.log(`📊 Face comparison result:`);
    console.log(`   Distance: ${distance.toFixed(4)}`);
    console.log(`   Threshold: ${threshold}`);
    console.log(`   Match: ${match ? '✅ YES' : '❌ NO'}`);

    return {
        match,
        distance,
        confidence1: face1.detection.score,
        confidence2: face2.detection.score
    };
}

/**
 * Check if models are available
 */
function areModelsLoaded() {
    return modelsLoaded;
}

module.exports = {
    loadModels,
    detectFace,
    compareFaces,
    matchFaces,
    areModelsLoaded
};
