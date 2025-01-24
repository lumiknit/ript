import { GeminiClient } from './gemini';
import { OpenAIClient } from './openai';
import { store } from '../../store';

/**
 * Create a client from local settings.
 */
export const createLLMClientWithLocalSettings = async () => {
	const s = store.localSettings;
	if (!s) return;
	switch (s['ai.defaultService']) {
		case 'gemini': {
			const client = new GeminiClient();
			client.apiKey = s['ai.gemini.apiKey'];
			client.model = s['ai.gemini.model'];
			return client;
		}
		case 'openai': {
			const client = new OpenAIClient();
			client.apiKey = s['ai.openai.apiKey'];
			client.model = s['ai.openai.model'];
			return client;
		}
		case 'groq': {
			// Groq is compatible with OpenAI
			const client = new OpenAIClient();
			client.endpoint = 'https://api.groq.com/openai/v1';
			client.apiKey = s['ai.groq.apiKey'];
			client.model = s['ai.groq.model'];
			return client;
		}
	}
};
