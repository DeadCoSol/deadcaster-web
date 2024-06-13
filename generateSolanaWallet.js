const crypto = require('crypto');
const bip39 = require('bip39');
const { derivePath } = require('ed25519-hd-key');
const { Keypair } = require('@solana/web3.js');

// Static encryption key (must be 32 bytes for AES-256)
const encryptionKey = crypto.createHash('sha256').update('4d6f6e6b65794261726b3132333435363738393031323334353637383930313233').digest('hex');
console.log('Encryption Key:', encryptionKey);

// Generate a new mnemonic
const mnemonic = bip39.generateMnemonic();
console.log('Mnemonic:', mnemonic);

// Derive the seed from the mnemonic
const seed = bip39.mnemonicToSeedSync(mnemonic);

// Derive the key pair using the path for Solana
const derivationPath = "m/44'/501'/0'/0'"; // Standard derivation path for Solana
const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key;
const keypair = Keypair.fromSeed(derivedSeed);

// Get the private and public keys
const privateKey = Array.from(keypair.secretKey);
const publicKey = keypair.publicKey.toBase58();

// Function to encrypt data
const encrypt = (text, key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Function to decrypt data
const decrypt = (text, key) => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// Encrypt the mnemonic and private key
const encryptedMnemonic = encrypt(mnemonic, encryptionKey);
const encryptedPrivateKey = encrypt(JSON.stringify(privateKey), encryptionKey);

console.log('Encrypted Mnemonic:', encryptedMnemonic);
console.log('Encrypted Private Key:', encryptedPrivateKey);

// Decrypt the mnemonic and private key
const decryptedMnemonic = decrypt(encryptedMnemonic, encryptionKey);
const decryptedPrivateKey = JSON.stringify(decrypt(encryptedPrivateKey, encryptionKey));

console.log('Decrypted Mnemonic:', decryptedMnemonic);
console.log('Decrypted Private Key:', decryptedPrivateKey);
console.log('Public Key:', publicKey);
