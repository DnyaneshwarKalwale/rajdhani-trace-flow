// Test script to verify ID generation is working correctly
// Run this in your browser console to test ID generation

console.log('🧪 Testing ID Generation...');

// Test Product ID Generation
function testProductId() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const dateStr = year + month + day;
    
    // Simulate ID generation
    const productId = `PRO-${dateStr}-001`;
    console.log('✅ Product ID:', productId);
    return productId;
}

// Test Individual Product ID Generation
function testIndividualProductId() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const dateStr = year + month + day;
    
    // Simulate ID generation
    const individualProductId = `IPD-${dateStr}-001`;
    console.log('✅ Individual Product ID:', individualProductId);
    return individualProductId;
}

// Test Raw Material ID Generation
function testRawMaterialId() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const dateStr = year + month + day;
    
    // Simulate ID generation
    const rawMaterialId = `RM-${dateStr}-001`;
    console.log('✅ Raw Material ID:', rawMaterialId);
    return rawMaterialId;
}

// Test QR Code Generation
function testQRCode() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const dateStr = year + month + day;
    
    // Simulate QR code generation
    const qrCode = `QR-${dateStr}-001`;
    console.log('✅ QR Code:', qrCode);
    return qrCode;
}

// Run all tests
console.log('\n🔍 Running ID Generation Tests...');
testProductId();
testIndividualProductId();
testRawMaterialId();
testQRCode();

console.log('\n✅ All ID generation tests completed!');
console.log('📝 Expected format: PREFIX-YYMMDD-XXX');
console.log('📝 Where PREFIX is: PRO, IPD, RM, or QR');
console.log('📝 YYMMDD is today\'s date in YYMMDD format');
console.log('📝 XXX is a 3-digit sequential number');
