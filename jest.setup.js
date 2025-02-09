const originalEmitWarning = process.emitWarning;

process.emitWarning = (warning, type, code, ...args) => {
  // Suppress warnings regarding the deprecated punycode module (DEP0040)
  if (code === 'DEP0040' && typeof warning === 'string' && warning.includes('punycode')) {
    return;
  }
  return originalEmitWarning(warning, type, code, ...args);
};
