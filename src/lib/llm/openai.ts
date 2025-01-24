import { LLMClient } from './interface';

/**
 * Openai (or OpenAI Compatible)
 */
export class OpenAIClient implements LLMClient {
	endpoint: string = 'https://api.openai.com/v1';
	model: string = 'gpt-4o-mini';
	apiKey: string = '';

	async singleChat(systemPrompt: string, userPrompt: string) {
		const url = `${this.endpoint}/chat/completions`;
		const resp = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: this.model,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
			}),
		});
		if (!resp.ok) {
			throw new Error(
				`Failed to generate content: ${resp.status} ${resp.statusText}`
			);
		}
		const json = await resp.json();
		return json.choices[0].message.content;
	}
}
