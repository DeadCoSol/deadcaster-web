const bs58 = require('bs58');

// JSON private key as a list of integers
const jsonPrivateKey = [
    144, 214, 191, 67, 75, 20, 250, 157, 71, 174, 168, 44, 176, 158, 100, 12,
    183, 48, 88, 180, 135, 207, 245, 85, 33, 253, 243, 126, 255, 6, 32, 13,
    181, 58, 58, 72, 53, 10, 200, 195, 55, 143, 247, 126, 218, 135, 141, 43,
    201, 12, 140, 21, 15, 162, 254, 103, 190, 110, 71, 30, 203, 112, 93, 155
];

// Convert the list of integers to a Buffer
const privateKeyBuffer = Buffer.from(jsonPrivateKey);

// Encode the buffer to a base58 string
const privateKeyBase58 = bs58.encode(privateKeyBuffer);
console.log(privateKeyBase58);
