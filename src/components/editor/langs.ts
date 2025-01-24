import { LanguageSupport, StreamLanguage } from '@codemirror/language';

const langMap: {
	[key: string]: () => Promise<LanguageSupport | StreamLanguage<unknown>>;
} = {
	// CM6 languages
	javascript: () =>
		import('@codemirror/lang-javascript').then((mod) => mod.javascript()),
	typescript: () =>
		import('@codemirror/lang-javascript').then((mod) =>
			mod.javascript({ typescript: true })
		),
	markdown: () =>
		import('@codemirror/lang-markdown').then((mod) => mod.markdown()),
	yaml: () => import('@codemirror/lang-yaml').then((mod) => mod.yaml()),
	toml: () =>
		import('@codemirror/legacy-modes/mode/toml').then((mod) =>
			StreamLanguage.define(mod.toml)
		),
	xml: () =>
		import('@codemirror/legacy-modes/mode/xml').then((mod) =>
			StreamLanguage.define(mod.xml)
		),
};

/** All available languages */
export const AVAILABLE_LANGUAGES = Object.keys(langMap);

const loadedLangs: {
	[key: string]: LanguageSupport | StreamLanguage<unknown>;
} = {};

export const cmLangExt = async (
	langName: string
): Promise<undefined | LanguageSupport | StreamLanguage<unknown>> => {
	// Check if the language is already loaded
	if (loadedLangs[langName]) {
		return loadedLangs[langName];
	}

	const lang = langMap[langName];
	if (!lang) {
		return undefined;
	}
	const l = await lang();
	loadedLangs[langName] = l;
	return l;
};
