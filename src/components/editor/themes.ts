import { Extension } from '@codemirror/state';

const loadedThemes: { [key: string]: Extension } = {};

const defaultThemes = new Set(['defaultLight', 'defaultDark']);

const loadDefaultTheme = async (
	name: string
): Promise<Extension | undefined> => {
	if (!defaultThemes.has(name)) return undefined;
	const tm = await import('./theme_default');
	const theme = (tm as any)[name];
	loadedThemes[name] = theme;
	return theme;
};

const themeMirrorThemes = new Set([
	'amy',
	'ayuLight',
	'barf',
	'bespin',
	'birdsOfParadise',
	'boysAndGirls',
	'clouds',
	'cobalt',
	'coolGrow',
	'dracula',
	'espresso',
	'noctisLilac',
	'rosePineDawn',
	'smoothy',
	'solarizedLight',
	'tomorrow',
]);

const loadThemeMirrorTheme = async (
	name: string
): Promise<Extension | undefined> => {
	if (!themeMirrorThemes.has(name)) return undefined;
	const tm = await import('thememirror');
	const theme = (tm as any)[name];
	if (!theme) {
		return undefined;
	}
	loadedThemes[name] = theme;
	return theme;
};

/** All available themes */
export const AVAILABLE_THEMES = [
	...Array.from(defaultThemes),
	...Array.from(themeMirrorThemes),
];

export const cmThemeExt = async (
	themeName: string
): Promise<undefined | Extension> => {
	// Check if the theme is already loaded
	if (loadedThemes[themeName]) {
		return loadedThemes[themeName];
	}

	// Check default themes
	const dt = await loadDefaultTheme(themeName);
	if (dt) {
		return dt;
	}

	// Check themeMirror themes
	const tt = await loadThemeMirrorTheme(themeName);
	if (tt) {
		return tt;
	}

	return undefined;
};
