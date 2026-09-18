// Saved project settings are authoritative; legacy projects without scale stay at 1x.
export function exportOptions(settings) {
  const {scale = 1, imageFormat = 'png', jpegQuality = 90} = settings.export ?? {};
  if (!Number.isFinite(scale) || scale <= 0 || scale > 16) throw new Error('Export scale must be greater than 0 and at most 16.');
  if (![settings.width * scale, settings.height * scale].every(Number.isInteger)) throw new Error('Scaled output dimensions must be whole pixels.');
  if (!Number.isInteger(jpegQuality) || jpegQuality < 0 || jpegQuality > 100) throw new Error('JPEG quality must be an integer from 0 to 100.');
  if (imageFormat !== 'png') throw new Error('Transparent caption overlays require PNG frames. JPEG cannot preserve alpha; jpegQuality is reserved for explicitly opaque JPEG workflows.');
  // jpegQuality is invalid with PNG in Remotion, so never pass it here.
  return {codec: 'prores', proResProfile: '4444', pixelFormat: 'yuva444p10le', imageFormat, scale};
}
