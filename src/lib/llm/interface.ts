export interface LLMClient {
	singleChat: (systemPrompt: string, userPrompt: string) => Promise<string>;
}
