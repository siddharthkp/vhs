const fs = require('fs');

if (!process.env.CI) {
    require('dotenv').config();
}

const config = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId
};

fs.writeFileSync('config.json', JSON.stringify(config), 'utf8');
