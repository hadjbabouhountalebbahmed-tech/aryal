// Fix: added .ts extension
import { Financials, EncryptedData } from '../types.ts';

// --- Helper functions for encoding/decoding ---
const bufferToBase64 = (buffer: BufferSource): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer as ArrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const base64ToBuffer = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

// --- Core cryptographic functions ---

const getPasswordKey = (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const textEncoder = new TextEncoder();
    return window.crypto.subtle.importKey(
        'raw',
        textEncoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    ).then(baseKey => 
        window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        )
    );
};

export const encryptData = async (data: Financials, password: string): Promise<string> => {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await getPasswordKey(password, salt);
    
    const textEncoder = new TextEncoder();
    const encodedData = textEncoder.encode(JSON.stringify(data));
    
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedData
    );
    
    const encryptedData: EncryptedData = {
        ciphertext: bufferToBase64(encryptedContent),
        salt: bufferToBase64(salt),
        iv: bufferToBase64(iv)
    };
    
    return JSON.stringify(encryptedData);
};

export const decryptData = async (encryptedJson: string, password: string): Promise<Financials> => {
    try {
        const encryptedData: EncryptedData = JSON.parse(encryptedJson);
        const salt = base64ToBuffer(encryptedData.salt);
        const iv = base64ToBuffer(encryptedData.iv);
        const ciphertext = base64ToBuffer(encryptedData.ciphertext);
        
        const key = await getPasswordKey(password, salt);
        
        const decryptedContent = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            ciphertext
        );
        
        const textDecoder = new TextDecoder();
        const decryptedString = textDecoder.decode(decryptedContent);
        
        return JSON.parse(decryptedString) as Financials;
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Mot de passe incorrect ou données corrompues.");
    }
};