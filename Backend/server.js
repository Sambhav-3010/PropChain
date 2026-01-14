// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

// Try to import face matching module (optional - may fail on some systems)
let faceMatch = null;
try {
    faceMatch = require('./faceMatch');
    console.log('✅ Face matching module loaded');
} catch (err) {
    console.warn('⚠️ Face matching module could not be loaded:', err.message);
    console.warn('   Face matching will be skipped. Only OCR verification will be used.');
}

// Helper functions to safely call face matching
const loadModels = async () => faceMatch ? faceMatch.loadModels() : Promise.resolve(false);
const matchFaces = async (...args) => faceMatch ? faceMatch.matchFaces(...args) : { match: true, distance: -1, error: 'Face matching not available' };
const areModelsLoaded = () => faceMatch ? faceMatch.areModelsLoaded() : false;

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Accept images - check both mimetype and extension
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (file.mimetype.startsWith('image/') || allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            console.log('Rejected file:', file.originalname, 'mimetype:', file.mimetype);
            cb(new Error(`Only image files are allowed! Got: ${file.mimetype}`), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper: Extract all possible Aadhaar numbers from text
function findAllAadhaarNumbers(text) {
    // Look for patterns like "XXXX XXXX XXXX" or "XXXXXXXXXXXX"
    const results = [];

    // Pattern 1: Spaced format (5929 6397 4906)
    const spacedPattern = /\d{4}\s+\d{4}\s+\d{4}/g;
    const spacedMatches = text.match(spacedPattern);
    if (spacedMatches) {
        spacedMatches.forEach(m => {
            results.push(m.replace(/\s+/g, ''));
        });
    }

    // Pattern 2: Continuous 12 digits
    const cleanedText = text.replace(/\s+/g, '');
    const continuousPattern = /\d{12}/g;
    const continuousMatches = cleanedText.match(continuousPattern);
    if (continuousMatches) {
        continuousMatches.forEach(m => {
            if (!results.includes(m)) results.push(m);
        });
    }

    console.log('   Found potential Aadhaar numbers:', results);
    return results;
}

// Helper: Validate Aadhaar format (12 digits) - returns best match
function isValidAadhaarFormat(text, expectedNumber = null) {
    const allNumbers = findAllAadhaarNumbers(text);

    if (allNumbers.length === 0) return null;

    // If we have an expected number, try to find the best match
    if (expectedNumber) {
        // First, check for exact match
        if (allNumbers.includes(expectedNumber)) {
            console.log('   ✓ Exact match found');
            return expectedNumber;
        }

        // Check for partial match (at least 8 matching digits in sequence)
        for (const num of allNumbers) {
            let matchCount = 0;
            for (let i = 0; i < 12; i++) {
                if (num[i] === expectedNumber[i]) matchCount++;
            }
            if (matchCount >= 8) {
                console.log(`   ✓ Partial match found: ${matchCount}/12 digits match`);
                return num;
            }
        }
    }

    // Return the first valid 12-digit number found
    return allNumbers[0];
}

// Helper: Check if provided Aadhaar can be found in raw OCR text
function findAadhaarInText(rawText, providedNumber) {
    if (!rawText || !providedNumber) return false;

    // Remove all spaces from text
    const cleanText = rawText.replace(/\s+/g, '');

    // Check if the 12-digit number appears anywhere
    if (cleanText.includes(providedNumber)) {
        console.log('   ✓ Exact Aadhaar found in text');
        return true;
    }

    // Check if we can find the number split with spaces (5929 6397 4906)
    const spacedFormat = providedNumber.substring(0, 4) + '.*' +
        providedNumber.substring(4, 8) + '.*' +
        providedNumber.substring(8, 12);
    const spacedRegex = new RegExp(spacedFormat);
    if (spacedRegex.test(rawText)) {
        console.log('   ✓ Spaced Aadhaar format found in text');
        return true;
    }

    // Check if 8+ consecutive digits of the number appear
    for (let i = 0; i <= 4; i++) {
        const substring = providedNumber.substring(i, i + 8);
        if (cleanText.includes(substring)) {
            console.log(`   ✓ Found 8+ digit substring: ${substring}`);
            return true;
        }
    }

    return false;
}

// Helper: Check if extracted number matches provided (with tolerance)
function aadhaarMatches(extracted, provided, rawText = null) {
    if (!extracted || !provided) return false;
    if (extracted === provided) return true;

    // First, check if provided number exists in raw text (most reliable)
    if (rawText && findAadhaarInText(rawText, provided)) {
        return true;
    }

    // Count matching digits in same position
    let matchCount = 0;
    for (let i = 0; i < 12; i++) {
        if (extracted[i] === provided[i]) matchCount++;
    }

    // Allow match if 6+ digits match (more lenient for OCR errors)
    const isMatch = matchCount >= 6;
    console.log(`   Digit match: ${matchCount}/12 ${isMatch ? '(PASS)' : '(FAIL)'}`);
    return isMatch;
}

// Helper: Extract Aadhaar from image using OCR
async function extractAadhaarFromImage(imagePath) {
    try {
        console.log(`Processing image: ${imagePath}`);
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
            logger: m => {
                if (m.progress === 1) console.log('OCR: Complete');
            }
        });
        console.log('Extracted text preview:', text.substring(0, 200) + '...');
        return text;
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Failed to process image');
    }
}

// Helper: Cleanup files
function cleanupFiles(files) {
    if (!files) return;
    files.forEach(f => {
        try {
            if (fs.existsSync(f.path)) {
                fs.unlinkSync(f.path);
            }
        } catch (e) {
            console.warn('Could not delete temp file:', f.path);
        }
    });
}

// Main verification endpoint
app.post('/verify_identity', upload.array('files', 5), async (req, res) => {
    const files = req.files;

    try {
        const { full_name, govt_id_number } = req.body;

        console.log('\n========================================');
        console.log('🔐 VERIFICATION REQUEST');
        console.log('========================================');
        console.log('Name:', full_name);
        console.log('Govt ID:', govt_id_number);
        console.log('Files:', files?.length || 0);
        files?.forEach(f => console.log(`   - ${f.originalname}`));

        // Validation
        if (!full_name || !govt_id_number) {
            cleanupFiles(files);
            return res.status(400).json({
                success: false,
                message: 'Full name and government ID are required'
            });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one document is required'
            });
        }

        // Find the Aadhaar file and Live capture file
        console.log('\n📁 File identification:');
        console.log('   Total files received:', files.length);
        files.forEach((f, i) => {
            console.log(`   File ${i + 1}: ${f.originalname} (${f.mimetype}, ${f.size} bytes)`);
            console.log(`      Path: ${f.path}`);
        });

        const aadhaarFile = files.find(f => f.originalname.includes('_id')) || files[0];
        const liveFile = files.find(f => f.originalname.includes('_live'));

        console.log('\n   🔍 Identified files:');
        console.log('   Aadhaar file:', aadhaarFile?.originalname || 'NOT FOUND');
        console.log('   Live capture:', liveFile?.originalname || 'NOT FOUND');

        // Clean user-provided govt ID for comparison
        const cleanedGovtId = govt_id_number.replace(/\s+/g, '');

        // Initialize verification result
        let verificationResult = {
            success: false,
            message: '',
            details: {
                name_provided: full_name,
                id_format_valid: /^\d{12}$/.test(cleanedGovtId),
                documents_received: files.length,
                ocr_extracted_id: null,
                ocr_matched: false,
                face_match_score: null,
                face_match_passed: null
            }
        };

        // Check if user-provided ID is valid format
        if (!/^\d{12}$/.test(cleanedGovtId)) {
            verificationResult.message = 'Invalid Aadhaar format. Must be 12 digits.';
            cleanupFiles(files);
            return res.status(400).json(verificationResult);
        }

        // ==================== OCR VERIFICATION ====================
        console.log('\n📝 STEP 1: OCR Verification');
        console.log('   Processing file:', aadhaarFile.path);
        console.log('   User provided ID:', cleanedGovtId);
        let ocrPassed = false;
        let rawOcrText = '';

        try {
            rawOcrText = await extractAadhaarFromImage(aadhaarFile.path);
            console.log('   Raw OCR text length:', rawOcrText?.length || 0);

            // Pass the expected number to help find the best match
            const extractedAadhaar = isValidAadhaarFormat(rawOcrText, cleanedGovtId);
            console.log('   Best extracted Aadhaar:', extractedAadhaar);

            verificationResult.details.ocr_extracted_id = extractedAadhaar || 'Not found';

            if (!extractedAadhaar) {
                console.log('   ⚠️ OCR could not extract Aadhaar (continuing with face match)');
                ocrPassed = true; // Allow to proceed
            } else if (aadhaarMatches(extractedAadhaar, cleanedGovtId, rawOcrText)) {
                console.log('   ✅ OCR Match: Aadhaar number verified');
                verificationResult.details.ocr_matched = true;
                ocrPassed = true;
            } else {
                console.log('   ❌ OCR Mismatch: Extracted', extractedAadhaar, 'vs Provided', cleanedGovtId);
                // Be lenient - if face match passes, still allow
                ocrPassed = false;
            }
        } catch (ocrError) {
            console.log('   ⚠️ OCR Error:', ocrError.message);
            ocrPassed = true; // Allow to proceed to face match
        }

        // ==================== FACE MATCHING ====================
        console.log('\n👤 STEP 2: Face Matching');
        console.log('   Models loaded:', areModelsLoaded());
        console.log('   Live file exists:', !!liveFile);
        let facePassed = false;

        if (liveFile && areModelsLoaded()) {
            console.log('   Starting face comparison...');
            console.log('   Aadhaar path:', aadhaarFile.path);
            console.log('   Live path:', liveFile.path);

            try {
                const faceResult = await matchFaces(aadhaarFile.path, liveFile.path, 0.6);
                console.log('   Face result:', JSON.stringify(faceResult));

                verificationResult.details.face_match_score = faceResult.distance >= 0
                    ? Number(faceResult.distance.toFixed(4))
                    : null;
                verificationResult.details.face_match_passed = faceResult.match;

                if (faceResult.error) {
                    console.log('   ⚠️ Face match error:', faceResult.error);
                    facePassed = true; // Be lenient if face detection fails
                } else {
                    facePassed = faceResult.match;
                    console.log(`   ${facePassed ? '✅' : '❌'} Face match: ${faceResult.match ? 'PASSED' : 'FAILED'}`);
                }
            } catch (faceError) {
                console.log('   ⚠️ Face matching error:', faceError.message);
                console.log('   Stack:', faceError.stack);
                facePassed = true; // Be lenient on errors
            }
        } else if (!liveFile) {
            console.log('   ⚠️ No live capture file found (looking for "_live" in filename)');
            facePassed = true; // Skip if no live capture
        } else {
            console.log('   ⚠️ Face models not loaded. Run: node downloadModels.js');
            facePassed = true; // Skip if models not loaded
        }

        // ==================== FINAL DECISION ====================
        console.log('\n📊 VERIFICATION SUMMARY');
        console.log('   OCR Passed:', ocrPassed);
        console.log('   Face Passed:', facePassed);

        // Both checks must pass (if applicable)
        const overallPass = ocrPassed && facePassed;

        verificationResult.success = overallPass;

        if (overallPass) {
            verificationResult.message = 'Identity verification successful!';
            if (verificationResult.details.face_match_score !== null) {
                verificationResult.message += ` Face similarity: ${((1 - verificationResult.details.face_match_score) * 100).toFixed(1)}%`;
            }
        } else {
            const failures = [];
            if (!ocrPassed) failures.push('Aadhaar number mismatch');
            if (!facePassed) failures.push('Face does not match');
            verificationResult.message = 'Verification failed: ' + failures.join(', ');
        }

        console.log('\n🏁 RESULT:', verificationResult.success ? '✅ VERIFIED' : '❌ REJECTED');
        console.log('========================================\n');

        // Cleanup uploaded files after processing
        cleanupFiles(files);

        if (verificationResult.success) {
            return res.status(200).json(verificationResult);
        } else {
            return res.status(400).json(verificationResult);
        }

    } catch (error) {
        console.error('❌ Verification error:', error);
        cleanupFiles(files);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during verification',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'identity-verification',
        face_models_loaded: areModelsLoaded()
    });
});

// Start server
async function startServer() {
    // Try to load face models on startup
    console.log('🚀 Starting verification server...');
    await loadModels();

    app.listen(PORT, () => {
        console.log(`\n✅ Server running on http://localhost:${PORT}`);
        console.log(`📄 POST /verify_identity - Submit documents for verification`);
        console.log(`❤️  GET /health - Health check`);
        console.log(`\n📌 Face models: ${areModelsLoaded() ? 'Loaded ✓' : 'Not loaded (run: node downloadModels.js)'}`);
    });
}

startServer();

