# PropChain Backend - Identity Verification Service

This backend service provides AI-powered identity verification for property registration using OCR and face matching.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Download face-api models (required for face matching)
node downloadModels.js

# Start the server
npm run dev
```

The server will run on `http://localhost:8000`

---

## 📁 Project Structure

```
Backend/
├── server.js           # Main Express server with verification logic
├── faceMatch.js        # Face detection and comparison module
├── downloadModels.js   # Script to download face-api.js models
├── models/             # Face-api.js model files (auto-downloaded)
├── uploads/            # Temporary file uploads (auto-cleaned)
├── .env                # Environment configuration
├── .gitignore          # Git ignore rules
└── package.json        # Dependencies and scripts
```

---

## 🔐 API Endpoints

### POST `/verify_identity`

Verify user identity using Aadhaar OCR and face matching.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `full_name` (string): User's full name
  - `govt_id_number` (string): 12-digit Aadhaar number
  - `files` (array): Image files
    - `*_id.*` - Aadhaar card image (required)
    - `*_live.*` - Live capture photo (for face matching)

**Example Response (Success):**
```json
{
  "success": true,
  "message": "Identity verification successful! Face similarity: 85.6%",
  "details": {
    "name_provided": "Ayan Tripathi",
    "id_format_valid": true,
    "documents_received": 2,
    "ocr_extracted_id": "592963974906",
    "ocr_matched": true,
    "face_match_score": 0.1437,
    "face_match_passed": true
  }
}
```

**Example Response (Failure):**
```json
{
  "success": false,
  "message": "Verification failed: Aadhaar number mismatch",
  "details": {
    "name_provided": "Test User",
    "id_format_valid": true,
    "documents_received": 2,
    "ocr_extracted_id": "123456789012",
    "ocr_matched": false,
    "face_match_score": null,
    "face_match_passed": null
  }
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "identity-verification",
  "face_models_loaded": true
}
```

---

## 🔍 Verification Logic

The verification process follows two steps:

### Step 1: OCR Verification (Tesseract.js)

1. **Extract Text**: Uses Tesseract.js to perform OCR on the Aadhaar image
2. **Find Aadhaar Numbers**: Searches for patterns:
   - Spaced format: `XXXX XXXX XXXX` (e.g., `5929 6397 4906`)
   - Continuous: 12 consecutive digits
3. **Match Verification**: Uses multiple strategies:
   - **Exact match**: Number found exactly in text
   - **Spaced format match**: Parts of number found in order
   - **Substring match**: 8+ consecutive digits found
   - **Position match**: 6+ digits match in same position

### Step 2: Face Matching (face-api.js)

1. **Detect Face**: Find face in Aadhaar image
2. **Detect Face**: Find face in live capture
3. **Extract Descriptors**: Get 128-dimensional face vectors
4. **Compare**: Calculate Euclidean distance
5. **Threshold**: Distance < 0.6 = Match

```
Face Match Score:
- 0.0 - 0.4: Strong match (same person)
- 0.4 - 0.6: Possible match
- 0.6 - 1.0: Different person
```

### Final Decision

| OCR Result | Face Result | Final |
|------------|-------------|-------|
| ✓ Pass     | ✓ Pass      | ✅ Verified |
| ✓ Pass     | ✗ Fail      | ❌ Rejected |
| ✗ Fail     | ✓ Pass      | ❌ Rejected |
| ⚠️ Skip    | ✓ Pass      | ✅ Verified (lenient) |

---

## ⚙️ Environment Variables

Create a `.env` file in the Backend directory:

```env
# Server Configuration
PORT=8000

# Face Match Threshold (0.0 - 1.0, lower = stricter)
FACE_MATCH_THRESHOLD=0.6

# Enable/disable features
ENABLE_OCR=true
ENABLE_FACE_MATCH=true

# File upload limits
MAX_FILE_SIZE_MB=10
MAX_FILES=5

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web server framework |
| `cors` | Cross-origin resource sharing |
| `multer` | File upload handling |
| `tesseract.js` | OCR for text extraction |
| `face-api.js` | Face detection and recognition |
| `@tensorflow/tfjs` | TensorFlow.js core |
| `canvas` | Canvas support for Node.js |
| `dotenv` | Environment variable loading |

---

## 🤖 Face-API Models

The following models are required (downloaded by `downloadModels.js`):

| Model | Purpose | Size |
|-------|---------|------|
| `ssd_mobilenetv1` | Face detection | ~5MB |
| `face_landmark_68` | Facial landmarks | ~350KB |
| `face_recognition` | Face descriptors | ~6MB |

Models are downloaded from: `https://github.com/justadudewhohacks/face-api.js/tree/master/weights`

---

## 🛠️ Troubleshooting

### OCR Not Extracting Correctly

- Ensure image is clear and well-lit
- Aadhaar number should be visible
- Image should not be rotated

### Face Matching Not Working

1. Check if models are loaded:
   ```bash
   curl http://localhost:8000/health
   # Should show: "face_models_loaded": true
   ```

2. Re-download models:
   ```bash
   rm -rf models/
   node downloadModels.js
   ```

### TensorFlow Warnings

The warning about `tfjs-node` can be ignored. We use pure JavaScript TensorFlow for compatibility with Node.js v24+.

---

## 📝 File Naming Convention

For the verification to work correctly, files should be named:

| File Type | Pattern | Example |
|-----------|---------|---------|
| Aadhaar | `*_id.*` | `john_id.jpg` |
| Live Capture | `*_live.*` | `john_live.jpg` |
| Property Deed | `*_deed.*` | `john_deed.pdf` |

---

## 🔒 Security Notes

1. **File Cleanup**: Uploaded files are automatically deleted after processing
2. **No Storage**: Aadhaar data is NOT stored permanently
3. **CORS**: Configure `FRONTEND_URL` for production
4. **Rate Limiting**: Consider adding rate limiting for production

---

## 📄 License

MIT License - Part of PropChain Blockchain Real Estate Platform
