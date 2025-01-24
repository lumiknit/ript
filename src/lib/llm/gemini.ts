import { LLMClient } from './interface';

type GeminiContent = {
	parts: {
		text: string;
	}[];
	role: string;
};

type GenerateContentCandidate = {
	avgLogprobs: number;
	content: GeminiContent;
	finishReason: string;
};

type GeminiGeneateContentResponse = {
	candidates: GenerateContentCandidate[];
	modelVersion: string;
	usageMetadata: {
		candidatesTokenCount: number;
		promptTokenCount: number;
		totalTokenCount: number;
	};
};

export class GeminiClient implements LLMClient {
	endpoint: string = 'https://generativelanguage.googleapis.com/v1beta';
	model: string = 'gemini-1.5-flash';
	apiKey: string = '';

	async singleChat(systemPrompt: string, userPrompt: string) {
		const url = `${this.endpoint}/models/${this.model}:generateContent?key=${this.apiKey}`;
		const resp = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text:
									'Importants:\n' +
									systemPrompt +
									'\n\nUser:\n' +
									userPrompt,
							},
						],
					},
				],
			}),
		});
		if (!resp.ok) {
			throw new Error(
				`Failed to generate content: ${resp.status} ${resp.statusText}`
			);
		}
		const json: GeminiGeneateContentResponse = await resp.json();
		return json.candidates[0].content.parts[0].text;
	}
}
