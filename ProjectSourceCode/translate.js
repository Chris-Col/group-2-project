async function translateText(input, sourceLang, targetLang) {
    const apiKey = 'AIzaSyB7XbwEAL8hqWD0fCt9hgse_4_Xzhz34mI'; //Google Cloud API key
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const data = {
        q: input,
        source: sourceLang,
        target: targetLang,
        format: 'text'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const translatedText = result.data.translations[0].translatedText;
        console.log('Translated text:', translatedText);
        return translatedText;
    } catch (error) {
        console.error('Error during translation:', error);
    }
}

// Example usage:
translateText('We can translate multiple sentences. This is another sentence to demonstrate this.', 'en', 'es'); // Translates from English to French

module.exports = translateText;