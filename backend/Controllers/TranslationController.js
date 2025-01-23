import translate from 'google-translate-api';
import axios from 'axios';

// Get Supported Languages
export const getLanguages = async (req, res) => {
  try {
    // `google-translate-api` doesn't provide a direct method to fetch language codes,
    // but they are available in `translate.languages`
    const languages = translate.languages;

    // Filter out only valid language codes and names
    const supportedLanguages = Object.entries(languages).filter(
      ([code, name]) => typeof name === 'string'
    );

    const result = supportedLanguages.map(([code, name]) => ({ code, name }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching languages:", error);
    res.status(500).json({ error: "Failed to fetch supported languages." });
  }
};

// Translate Text
export const translateText = async (req, res) => {
  const { text, code } = req.body;

  try {
    // Prepare the translation API URL
    const url = `https://translate.google.so/translate_a/t?client=any_client_id_works&sl=auto&tl=${code}&q=${encodeURIComponent(text)}&tbb=1&ie=UTF-8&oe=UTF-8`;

    // Make a request using Axios
    const response = await axios.get(url);

    if (response.status === 200) {
      // Assuming the translation is the first element in the response
      const translatedText = response.data;
      
      // Send the translated text as the response
      res.status(200).json({
        translatedText: translatedText[0][0],
        sourceLanguage: response.data[0][1], // Source language code (detected)
      });
    } else {
      throw new Error('Translation API request failed.');
    }
  } catch (error) {
    console.error("Error in translation:", error);
    res.status(500).json({
      success: false,
      message: "Translation failed. Please try again.",
      error: error.message,
    });
  }
};