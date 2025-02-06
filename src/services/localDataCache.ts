/**
 * Local Data Cache service for managing prompt data using Chrome's Storage API.
 * Implements encryption for sensitive data using Web Crypto API.
 */

import { PromptData } from "../types/prompt";

async function getKey(): Promise<CryptoKey> {
    const passphrase = "default-passphrase"; // Temporary passphrase. Replace with a secure mechanism.
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(passphrase),
        "PBKDF2",
        false,
        ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode("unique-salt"),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

export { getKey, encryptData, decryptData };

async function encryptData(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(data)
    );
    const combined = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.byteLength);
    // Convert to base64 for storage
    let binary = "";
    for (let i = 0; i < combined.byteLength; i++) {
        binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
}

async function decryptData(encrypted: string, key: CryptoKey): Promise<string> {
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
    );
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}

// Fallback for chrome.storage.local in non-Chrome environments using in-memory storage.
let memoryStorage: Record<string, any> = {};
const storage = (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local)
    ? chrome.storage.local
    : {
          get: (keys: string | string[] | object, callback: (result: any) => void) => {
              let keyArray: string[] = [];
              if (typeof keys === "string") {
                  keyArray = [keys];
              } else if (Array.isArray(keys)) {
                  keyArray = keys;
              } else {
                  keyArray = Object.keys(keys);
              }
              const result: Record<string, any> = {};
              for (const key of keyArray) {
                  result[key] = memoryStorage[key];
              }
              callback(result);
          },
          set: (obj: any, callback: () => void) => {
              Object.assign(memoryStorage, obj);
              callback();
          },
          remove: (keys: string | string[], callback: () => void) => {
              let keyArray: string[] = [];
              if (typeof keys === "string") {
                  keyArray = [keys];
              } else {
                  keyArray = keys;
              }
              for (const key of keyArray) {
                  delete memoryStorage[key];
              }
              callback();
          }
      };

export async function savePromptData(prompt: PromptData): Promise<void> {
    const key = await getKey();
    const data = JSON.stringify(prompt);
    const encryptedData = await encryptData(data, key);
    // Save using chrome.storage.local API, using prompt.id as key
    storage.set({ [prompt.id]: encryptedData }, () => {
        if (chrome && chrome.runtime && chrome.runtime.lastError) {
            console.error("Error saving prompt data:", chrome.runtime.lastError);
        }
    });
}

export async function getPromptData(promptId: string): Promise<PromptData | null> {
    return new Promise((resolve, reject) => {
        storage.get([promptId], async (result: any) => {
            if (chrome && chrome.runtime && chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            const encryptedData = result[promptId];
            if (!encryptedData) {
                return resolve(null);
            }
            try {
                const key = await getKey();
                const decryptedData = await decryptData(encryptedData, key);
                const prompt: PromptData = JSON.parse(decryptedData);
                resolve(prompt);
            } catch (error) {
                reject(error);
            }
        });
    });
}

export async function deletePromptData(promptId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        storage.remove([promptId], () => {
            if (chrome && chrome.runtime && chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve();
        });
    });
}