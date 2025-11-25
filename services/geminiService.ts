import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { API_SIMULATION_DELAY_LONG } from '../constants';

const MODEL_NAME = 'gemini-2.5-flash'; // Using the recommended model for basic text tasks

/**
 * Initializes the Gemini API client and sends a text prompt to the model.
 * @param prompt The text prompt for the Gemini model.
 * @returns A promise that resolves with the Gemini API response text.
 */
export const getGeminiResponse = async (prompt: string): Promise<string> => {
  // CRITICAL: Create GoogleGenAI instance right before making an API call
  // to ensure it always uses the most up-to-date API key from the dialog.
  // Do not create GoogleGenAI when the component is first rendered.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        // You can add more config here if needed, e.g., temperature, topK, topP
      },
    });

    const text = response.text;
    if (!text) {
      console.warn('Gemini API returned an empty text response.');
      return 'No response from Gemini API.';
    }
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Attempt to handle specific API key related errors if they manifest as string errors
    if (error instanceof Error && error.message.includes('Requested entity was not found.')) {
      // Simulate API key selection if it fails
      // In a real app, you would prompt the user to re-select API key
      console.warn('Gemini API call failed, possibly due to API key issue. Simulating re-selection.');
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // Assume selection was successful and proceed. Do not add delay.
      }
      return 'API key might be invalid or not selected. Please try again after ensuring a valid API key is selected.';
    }
    return `Failed to get a response from Gemini API. Error: ${(error as Error).message || 'Unknown error'}`;
  }
};


// Example of a mock Gemini service for testing without actual API calls
export const getMockGeminiResponse = async (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let response = '';
      if (prompt.toLowerCase().includes('e-rickshaw')) {
        response = 'E-rickshaws are a popular and eco-friendly mode of transport in India, especially in urban and semi-urban areas. They are battery-operated, reducing air and noise pollution.';
      } else if (prompt.toLowerCase().includes('travel tips')) {
        response = 'When traveling in India, it\'s good to carry local currency, stay hydrated, and try local street food from reputable vendors. Always agree on a fare before starting your journey with an e-rickshaw.';
      } else {
        response = 'This is a simulated response from Gemini based on your prompt: "' + prompt + '".';
      }
      resolve(response);
    }, API_SIMULATION_DELAY_LONG);
  });
};
