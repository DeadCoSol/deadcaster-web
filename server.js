const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs/cert.pem')),
};

app.prepare().then(() => {
    const server = express();

    // Use helmet to set security headers
    server.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["*"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.google.com", "https://*.stripe.com", "https://*.quiknode.pro", "https://deadcasterdev--deadcasterdev.us-central1.hosted.app"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://*.google.com", "https://*.stripe.com https://deadcasterdev--deadcasterdev.us-central1.hosted.app"],
                    imgSrc: ["'self'", "blob:", "data:", "https:"],
                    connectSrc: [
                        "'self'",
                        "https://api.simplesvg.com",
                        "https://api.iconify.design",
                        "https://deadcasterdev--deadcasterdev.us-central1.hosted.app",
                        "https://*.jup.ag",
                        "https://*.google.com",
                        "https://stripe.com",
                        "https://*.stripe.com",
                        "https://*.arweave.net",
                        "https://*.quiknode.pro",
                        "https://*.audius.co",
                        "https://firestore.googleapis.com",
                        "https://securetoken.googleapis.com",
                        "https://www.googleapis.com",
                        "https://identitytoolkit.googleapis.com",
                        "https://firebasestorage.googleapis.com",
                        "https://api.unisvg.com",
                    ],
                    frameSrc: ["https://www.deadcaster.xyz", "https://deadcasterdev--deadcasterdev.us-central1.hosted.app", "https://localhost", "https://apis.google.com", "https://deadcaster.firebaseapp.com", "https://deadcasterdev.firebaseapp.com", "https://deadcasterdev--deadcasterdev.us-central1.hosted.app", "https://*.google.com", "https://*.stripe.com", "https://*.quiknode.pro"],
                    objectSrc: ["'none'"],
                    upgradeInsecureRequests: [],
                },
            }
        })
);

    if (dev) {
        createServer(httpsOptions, server).listen(443, err => {
            if (err) throw err;
            console.log('> Ready on https://localhost');
        });
    } else {
        server.listen(3000, err => {
            if (err) throw err;
            console.log('> Ready on http://localhost:3000');
        });
    }

    server.all('*', (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });
});
