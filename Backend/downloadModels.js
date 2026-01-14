/**
* Download face-api.js models from GitHub
* Run: node downloadModels.js
*/

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODELS_PATH = path.join(__dirname, 'models');

// Models URL - using justadudewhohacks/face-api.js weights
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// Required model files for face-api.js v0.20.0
const MODEL_FILES = [
    // SSD MobileNet v1 (face detection)
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2',

    // Face Landmark 68 (facial landmarks)
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',

    // Face Recognition (face descriptors)
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);

        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Follow redirect
                https.get(response.headers.location, (redirectResponse) => {
                    redirectResponse.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                }).on('error', reject);
            } else if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function downloadModels() {
    console.log('📦 Downloading face-api.js models...\n');

    // Create models directory
    if (!fs.existsSync(MODELS_PATH)) {
        fs.mkdirSync(MODELS_PATH, { recursive: true });
    }

    let downloaded = 0;
    let failed = 0;

    for (const file of MODEL_FILES) {
        const url = `${BASE_URL}/${file}`;
        const dest = path.join(MODELS_PATH, file);

        // Skip if already exists
        if (fs.existsSync(dest)) {
            console.log(`✓ ${file} (already exists)`);
            downloaded++;
            continue;
        }

        try {
            process.stdout.write(`⏳ Downloading ${file}...`);
            await downloadFile(url, dest);
            console.log(' ✓');
            downloaded++;
        } catch (error) {
            console.log(` ❌ ${error.message}`);
            failed++;
        }
    }

    console.log(`\n📊 Download complete: ${downloaded} succeeded, ${failed} failed`);

    if (failed === 0) {
        console.log('✅ All models downloaded successfully!');
        console.log('   You can now start the server: npm run dev');
    } else {
        console.log('⚠️ Some models failed to download. Please try again or download manually.');
        console.log('   Manual download: https://github.com/vladmandic/face-api/tree/master/model');
    }
}

downloadModels().catch(console.error);
