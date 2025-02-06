import { describe, it, expect } from 'vitest';
import { getKey, encryptData, decryptData } from '../localDataCache';

describe('Local Data Cache - Encryption', () => {
  it('should encrypt and decrypt data correctly', async () => {
    const key = await getKey();
    const originalData = 'This is a test string for encryption';
    const encrypted = await encryptData(originalData, key);
    expect(encrypted).toBeDefined();
    const decrypted = await decryptData(encrypted, key);
    expect(decrypted).toEqual(originalData);
  });
});