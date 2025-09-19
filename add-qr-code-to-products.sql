-- Add QR code field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN products.qr_code IS 'QR code data URL for the main product';
