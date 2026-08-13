import QRCode from 'qrcode';

/**
 * Generate a Data URL (base64 image) from string/object
 */
export async function generateDataUrl(textOrObj) {
  try {
    const text = typeof textOrObj === 'string' ? textOrObj : JSON.stringify(textOrObj);
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f766e',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return null;
  }
}
