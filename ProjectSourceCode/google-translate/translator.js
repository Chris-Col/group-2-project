const { Translate } = require('@google-cloud/translate').v2;
const path = require('path');

// Load API Key
const CREDENTIALS = path.join(__dirname, 'google-translate-key.json');

// Initialize Translate Client
const translate = new Translate({ keyFilename: CREDENTIALS });

async function translateText(text, targetLanguage) {
    try {
        let [translations] = await translate.translate(text, targetLanguage);
        console.log(`Original: ${text}`);
        console.log(`Translated: ${translations}`);
        return translations;
    } catch (error) {
        console.error("Error translating text:", error);
    }
}

// Test the function
translateText("Hello, how are you?", "es");