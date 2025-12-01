# File Handling Mastery: Uploads, Downloads, and Security

Handling file uploads and downloads securely is crucial for production Express.js applications. This guide covers everything from basic uploads to advanced security practices.

## 1. Receiving Files: Multer Middleware

Express.js uses `multer` middleware for handling file uploads.

### Installation

```bash
npm install multer
npm install --save-dev @types/multer  # If using TypeScript
```

### Basic File Upload

```javascript
const multer = require('multer');
const express = require('express');
const app = express();

// Multer configuration: Basic setup for file uploads.
const upload = multer({ dest: 'uploads/' });  // Save to 'uploads/' directory

// Single file upload: Accept one file with field name 'file'.
app.post("/upload", upload.single('file'), (req, res) => {
    // req.file: Contains file information.
    return res.json({
        filename: req.file.filename,  // Generated filename
        originalname: req.file.originalname,  // Original filename
        mimetype: req.file.mimetype,  // MIME type
        size: req.file.size  // File size in bytes
    });
});
```

**Explanation:** `multer` handles multipart/form-data. `upload.single('file')` accepts one file. The file is saved to disk, and file info is available in `req.file`.

### Multiple Files

```javascript
// Multiple files: Accept multiple files with same field name.
app.post("/upload-multiple", upload.array('files', 10), (req, res) => {
    // req.files: Array of file objects (max 10 files).
    const fileInfo = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size
    }));
    
    res.json({ files: fileInfo });
});

// Multiple fields: Accept files from different fields.
app.post("/upload-fields", upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'documents', maxCount: 5 }
]), (req, res) => {
    // req.files.avatar: Single file
    // req.files.documents: Array of files
    res.json({
        avatar: req.files.avatar[0],
        documents: req.files.documents
    });
});
```

## 2. Streaming Uploads (Memory vs Disk)

### Memory Storage (Small Files)

```javascript
// Memory storage: Loads file into memory (good for small files).
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

app.post("/upload-memory", uploadMemory.single('file'), (req, res) => {
    // req.file.buffer: File content as Buffer (in memory).
    const fileBuffer = req.file.buffer;
    
    // Process buffer: Can upload to S3, process, etc.
    // Note: Large files will consume memory!
});
```

### Disk Storage (Large Files)

```javascript
const path = require('path');
const fs = require('fs');

// Disk storage: Saves to disk (good for large files).
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);  // Save to 'uploads/' directory
    },
    filename: (req, file, cb) => {
        // Generate filename: UUID prevents collisions and path traversal.
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const uploadDisk = multer({ storage: diskStorage });
```

## 3. Security: Path Traversal & File Type Validation

**NEVER TRUST USER INPUT**, especially filenames. If a hacker uploads a file named `../../../../windows/system32/hack.exe`, and you blindly use it, you might overwrite critical system files.

### The Fix: Sanitize Filenames

```javascript
const uuid = require('uuid');
const path = require('path');

// Safe upload: Generate UUID filename to prevent path traversal attacks.
const safeStorage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        // Ignore user's filename: Generate UUID to prevent path traversal.
        const extension = path.extname(file.originalname);  // Extract extension
        const safeFilename = `${uuid.v4()}${extension}`;  // UUID prevents attacks
        cb(null, safeFilename);
    }
});

const uploadSafe = multer({ storage: safeStorage });
```

### File Type Validation

```javascript
const fileType = require('file-type');  // npm install file-type

// File type validation: Check actual file type, not just extension.
const fileFilter = (req, file, cb) => {
    // Allowed MIME types: Whitelist allowed file types.
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);  // Accept file
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF allowed.'), false);
    }
};

// Magic number validation: Check file signature (more secure).
async function validateFileType(fileBuffer) {
    const type = await fileType.fromBuffer(fileBuffer);
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!type || !allowedTypes.includes(type.mime)) {
        throw new Error('Invalid file type');
    }
    
    return type;
}

// Upload with validation: Validate file type after upload.
app.post("/upload-safe", uploadMemory.single('file'), async (req, res, next) => {
    try {
        // Validate file type: Check magic numbers (file signature).
        const fileType = await validateFileType(req.file.buffer);
        
        // File is valid: Proceed with processing.
        res.json({ message: 'File uploaded successfully', type: fileType.mime });
    } catch (error) {
        next(error);
    }
});
```

## 4. Serving Files (Downloads)

### Basic File Serving

```javascript
const path = require('path');
const fs = require('fs');

// GET /download/:fileId: Serve file for download.
app.get("/download/:fileId", (req, res, next) => {
    try {
        const filePath = path.join('uploads', req.params.fileId);
        
        // Check if file exists: Validate file exists before serving.
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Set headers: Content-Type and Content-Disposition.
        const fileExtension = path.extname(filePath);
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.png': 'image/png'
        };
        
        res.setHeader('Content-Type', mimeTypes[fileExtension] || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.fileId}"`);
        
        // Stream file: Send file as stream (memory efficient).
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        next(error);
    }
});
```

### Streaming Large Files

```javascript
// Streaming large files: Memory efficient for large files.
app.get("/download-large/:fileId", (req, res, next) => {
    const filePath = path.join('uploads', req.params.fileId);
    
    // Get file stats: For Content-Length header.
    const stats = fs.statSync(filePath);
    res.setHeader('Content-Length', stats.size);
    
    // Stream file: Pipe file stream to response (doesn't load in memory).
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
        next(error);
    });
    
    fileStream.pipe(res);  // Stream file to client
});
```

## 5. Complete Secure File Server Example

```javascript
const multer = require('multer');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const fileType = require('file-type');

// Configuration: File upload limits and validation.
const MAX_FILE_SIZE = 10 * 1024 * 1024;  // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Storage configuration: Safe disk storage with UUID filenames.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate safe filename: UUID prevents path traversal.
        const extension = path.extname(file.originalname);
        const safeFilename = `${uuid.v4()}${extension}`;
        cb(null, safeFilename);
    }
});

// File filter: Validate file type before saving.
const fileFilter = (req, file, cb) => {
    // Check MIME type: Whitelist allowed types.
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

// Multer configuration: Apply limits and validation.
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE  // 10MB limit
    }
});

// Secure image upload: Validates file type using magic numbers.
app.post("/upload-image", upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Read file: Check magic numbers (file signature).
        const fileBuffer = fs.readFileSync(req.file.path);
        const type = await fileType.fromBuffer(fileBuffer);
        
        // Validate actual file type: More secure than just extension.
        if (!type || !ALLOWED_TYPES.includes(type.mime)) {
            // Delete invalid file: Cleanup if validation fails.
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Invalid file type' });
        }
        
        // File is valid: Return file info.
        res.json({
            id: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: type.mime
        });
    } catch (error) {
        next(error);
    }
});

// Download file: Serve file securely.
app.get("/download/:fileId", (req, res, next) => {
    try {
        const filePath = path.join('uploads', req.params.fileId);
        
        // Validate file exists: Check before serving.
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Security: Prevent path traversal (double check).
        const resolvedPath = path.resolve(filePath);
        const uploadsDir = path.resolve('uploads');
        if (!resolvedPath.startsWith(uploadsDir)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Stream file: Serve file as stream.
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.fileId}"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        next(error);
    }
});
```

## Best Practices

### 1. **File Size Limits**
```javascript
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024,  // 10MB
        files: 5  // Max 5 files
    }
});
```

### 2. **Sanitize Filenames**
```javascript
// Always generate your own filename
const safeFilename = `${uuid.v4()}${path.extname(file.originalname)}`;
```

### 3. **Validate File Types**
```javascript
// Check both MIME type and magic numbers
const type = await fileType.fromBuffer(fileBuffer);
```

### 4. **Store Files Securely**
```javascript
// Use cloud storage (S3) for production
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Upload to S3: More secure than local storage.
await s3.upload({
    Bucket: 'my-bucket',
    Key: safeFilename,
    Body: fileBuffer
}).promise();
```

## Summary

File handling in Express.js requires: Using multer for file uploads, validating file types (MIME and magic numbers), sanitizing filenames (UUID), setting size limits, streaming large files, and serving files securely. Never trust user input, always validate file types, and use cloud storage for production.

