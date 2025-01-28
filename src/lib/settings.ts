export type LocalSettings = {
	_id: string;

	// Editor Settings
	['editor.fontFamily']: string;
	['editor.fontSize']: number;

	// AI Settings

	['ai.defaultService']: string;

	// AI - OpenAI
	['ai.openai.endpoint']: string;
	['ai.openai.apiKey']: string;
	['ai.openai.model']: string;

	// AI - Gemini
	['ai.gemini.apiKey']: string;
	['ai.gemini.model']: string;

	// AI - Groq
	['ai.groq.apiKey']: string;
	['ai.groq.model']: string;
};

const defaultLocalSettings: LocalSettings = {
	_id: 'current',

	// Editor Settings

	['editor.fontFamily']: 'monospace',
	['editor.fontSize']: 16,

	// AI Settings
	['ai.defaultService']: 'openai',

	// AI - OpenAI
	['ai.openai.endpoint']: 'https://api.openai.com/v1',
	['ai.openai.apiKey']: 'sk-...',
	['ai.openai.model']: 'gpt-4o-mini',

	// AI - Gemini
	['ai.gemini.apiKey']: '',
	['ai.gemini.model']: 'gemini-1.5-flash',

	// AI - Groq
	['ai.groq.apiKey']: '',
	['ai.groq.model']: 'deepseek-r1-distill-llama-70b',
};

export const fillLocalSettings = (
	settings: Partial<LocalSettings>
): LocalSettings => {
	const s = { ...defaultLocalSettings };
	Object.entries(settings).forEach(([key, value]) => {
		if (!value && value !== 0) return;
		(s as any)[key] = value;
	});
	return s;
};
