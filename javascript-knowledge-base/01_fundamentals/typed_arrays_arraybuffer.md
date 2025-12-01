# Typed Arrays, ArrayBuffer, DataView: Binary Data Handling

Typed arrays provide efficient ways to work with binary data in JavaScript, essential for performance-critical applications.

## ArrayBuffer

**ArrayBuffer** is a fixed-length binary data buffer.

### Creating ArrayBuffer

```javascript
// Create ArrayBuffer
const buffer = new ArrayBuffer(16);  // 16 bytes
console.log(buffer.byteLength);      // 16

// ArrayBuffer is immutable
// Cannot directly read/write
```

## Typed Arrays

**Typed Arrays** are views over ArrayBuffer for reading/writing binary data.

### Typed Array Types

```javascript
// Signed integers
Int8Array      // 1 byte, -128 to 127
Int16Array     // 2 bytes, -32768 to 32767
Int32Array     // 4 bytes, -2147483648 to 2147483647

// Unsigned integers
Uint8Array     // 1 byte, 0 to 255
Uint16Array    // 2 bytes, 0 to 65535
Uint32Array    // 4 bytes, 0 to 4294967295

// Float
Float32Array   // 4 bytes, 32-bit float
Float64Array   // 8 bytes, 64-bit float

// Special
Uint8ClampedArray  // 1 byte, 0 to 255 (clamped)
BigInt64Array      // 8 bytes, bigint
BigUint64Array     // 8 bytes, unsigned bigint
```

### Creating Typed Arrays

```javascript
// From length
const arr = new Int8Array(8);  // 8 elements

// From ArrayBuffer
const buffer = new ArrayBuffer(16);
const view = new Int8Array(buffer);  // View over buffer

// From array
const arr = new Int8Array([1, 2, 3, 4]);

// From another typed array
const arr2 = new Int8Array(arr);
```

## DataView

**DataView** provides flexible read/write access to ArrayBuffer.

### Creating DataView

```javascript
const buffer = new ArrayBuffer(16);
const view = new DataView(buffer);

// Read methods
view.getInt8(0);      // Read 8-bit signed integer at offset 0
view.getUint8(0);     // Read 8-bit unsigned integer
view.getInt16(0);     // Read 16-bit signed integer (little-endian)
view.getInt16(0, true);  // big-endian
view.getInt32(0);      // Read 32-bit signed integer
view.getFloat32(0);    // Read 32-bit float
view.getFloat64(0);    // Read 64-bit float

// Write methods
view.setInt8(0, 127);
view.setUint8(0, 255);
view.setInt16(0, 32767);
view.setInt32(0, 2147483647);
view.setFloat32(0, 3.14);
view.setFloat64(0, 3.14159);
```

## Real-World Examples

### Example 1: Binary Data Processing

```javascript
// Process binary data
const buffer = new ArrayBuffer(16);
const view = new DataView(buffer);

// Write data
view.setInt32(0, 42);
view.setFloat32(4, 3.14);
view.setInt16(8, 100);

// Read data
const intValue = view.getInt32(0);      // 42
const floatValue = view.getFloat32(4);  // 3.14
const shortValue = view.getInt16(8);    // 100
```

### Example 2: Image Processing

```javascript
// Process image data
function processImage(imageData) {
    const data = new Uint8ClampedArray(imageData.data);
    
    // Invert colors
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];         // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
        // data[i + 3] is alpha, keep unchanged
    }
    
    return new ImageData(data, imageData.width, imageData.height);
}
```

### Example 3: Network Protocol

```javascript
// Parse binary protocol
function parsePacket(buffer) {
    const view = new DataView(buffer);
    
    const header = {
        version: view.getUint8(0),
        type: view.getUint8(1),
        length: view.getUint16(2),
        timestamp: view.getUint32(4)
    };
    
    const payload = new Uint8Array(buffer, 8, header.length);
    
    return { header, payload };
}
```

## Endianness

```javascript
// Endianness: Byte order
const buffer = new ArrayBuffer(4);
const view = new DataView(buffer);

// Write 32-bit integer
view.setInt32(0, 0x12345678);

// Read as bytes
const bytes = new Uint8Array(buffer);
// Little-endian (default): [0x78, 0x56, 0x34, 0x12]
// Big-endian: [0x12, 0x34, 0x56, 0x78]

// Specify endianness
view.setInt32(0, 0x12345678, true);  // big-endian
view.getInt32(0, true);              // big-endian read
```

## Best Practices

1. **Use Typed Arrays**: For performance-critical operations
2. **DataView**: For flexible byte-level access
3. **Endianness**: Be aware of byte order
4. **Memory**: Typed arrays are more memory-efficient
5. **Compatibility**: Check browser support

## Summary

**Typed Arrays & Binary Data:**

1. **ArrayBuffer**: Fixed-length binary buffer
2. **Typed Arrays**: Views for reading/writing
3. **DataView**: Flexible byte-level access
4. **Endianness**: Byte order matters
5. **Best Practice**: Use for performance, binary protocols

**Key Takeaway:**
ArrayBuffer provides binary data storage. Typed arrays are efficient views over ArrayBuffer. DataView provides flexible byte-level access. Be aware of endianness for network protocols. Use typed arrays for performance-critical operations and binary data processing.

**Binary Strategy:**
- Use typed arrays for performance
- DataView for flexibility
- Understand endianness
- Memory efficient
- Binary protocols

**Next Steps:**
- Learn [Memory Model](memory_model_garbage_collection.md) for memory
- Study [Performance](../21_performance_optimization/) for optimization
- Master [WebAssembly](../25_interop_native_advanced/wasm_basics.md) for native performance

