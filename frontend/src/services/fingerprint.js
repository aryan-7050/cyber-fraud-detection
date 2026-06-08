// services/fingerprint.js
import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedVisitorId = null;

export const getDeviceFingerprint = async () => {
  if (cachedVisitorId) return cachedVisitorId;
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    cachedVisitorId = result.visitorId;
    return cachedVisitorId;
  } catch (error) {
    console.error('Fingerprint error:', error);
    return `fallback-${Date.now()}-${Math.random()}`;
  }
};

export const attachDeviceInfo = async (data = {}) => {
  const fingerprint = await getDeviceFingerprint();
  // Fix: Use window.screen instead of global screen
  const screenWidth = window.screen ? window.screen.width : 'unknown';
  const screenHeight = window.screen ? window.screen.height : 'unknown';
  
  return {
    ...data,
    deviceFingerprint: fingerprint,
    userAgent: navigator.userAgent,
    screenResolution: `${screenWidth}x${screenHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
  };
};