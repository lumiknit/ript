import {
	autocompletion,
	closeBrackets,
	closeBracketsKeymap,
	completionKeymap,
} from '@codemirror/autocomplete';
import {
	defaultKeymap,
	history,
	historyKeymap,
	indentWithTab,
} from '@codemirror/commands';
import {
	bracketMatching,
	foldGutter,
	foldKeymap,
	indentOnInput,
	indentUnit,
} from '@codemirror/language';
import {
	highlightSelectionMatches,
	search,
	searchKeymap,
} from '@codemirror/search';
import { EditorState, Extension } from '@codemirror/state';
import {
	crosshairCursor,
	drawSelection,
	dropCursor,
	EditorView,
	highlightActiveLine,
	highlightActiveLineGutter,
	highlightSpecialChars,
	keymap,
	lineNumbers,
	placeholder,
	rectangularSelection,
} from '@codemirror/view';

import { cmThemeExt } from './themes';

export const myBasicReadonlyConfig: Extension = [
	EditorView.editable.of(false),
	EditorState.readOnly.of(true),
	placeholder('Empty'),
	highlightSpecialChars(),
];

export const myBasicConfig: Extension = [
	crosshairCursor(),
	drawSelection(),
	dropCursor(),
	history(),
	search(),
	highlightSpecialChars(),
	rectangularSelection(),
	indentOnInput(),
	keymap.of([
		...closeBracketsKeymap,
		...defaultKeymap,
		...searchKeymap,
		...historyKeymap,
		indentWithTab,
	]),
];

/** ggjeok's editor configurations */
export type EditorConfig = Partial<{
	'autocomplete.enabled': boolean;

	'bracket.close': boolean;
	'bracket.matching': boolean;

	'indent.size': number;
	'indent.useTab': boolean;

	'highlight.gutter': boolean;
	'highlight.line': boolean;
	'highlight.selection': boolean;

	'gutter.fold': boolean;
	'gutter.lineNumber': boolean;

	theme: string;
	'theme.light': string;
	'theme.dark': string;

	'wrap.line': boolean;
}>;

export const configToExtension = async (
	config: EditorConfig,
	readonly?: boolean
): Promise<Extension> => {
	const extensions: Extension[] = [];

	if (!readonly) {
		if (config['autocomplete.enabled'] ?? true) {
			extensions.push(autocompletion());
			extensions.push(keymap.of(completionKeymap));
		}

		if (config['bracket.close'] ?? true) {
			extensions.push(closeBrackets());
		}

		if (config['highlight.gutter'] ?? true) {
			extensions.push(highlightActiveLineGutter());
		}

		if (config['highlight.line'] ?? true) {
			extensions.push(highlightActiveLine());
		}
	}

	if (config['bracket.matching'] ?? true) {
		extensions.push(bracketMatching());
	}

	if (config['gutter.lineNumber'] ?? true) {
		extensions.push(lineNumbers());
	}

	if (config['highlight.selection']) {
		extensions.push(highlightSelectionMatches());
	}

	if (config['gutter.fold']) {
		extensions.push(foldGutter());
		extensions.push(keymap.of(foldKeymap));
	}

	const indentSize = config['indent.size'] ?? 2;
	extensions.push(EditorState.tabSize.of(indentSize));
	extensions.push(
		indentUnit.of(config['indent.useTab'] ? '\t' : ' '.repeat(indentSize))
	);

	const lightTheme = config['theme.light'] ?? 'defaultLight';
	const darkTheme = config['theme.dark'] ?? 'defaultDark';
	const theme =
		config.theme ??
		(window.matchMedia('(prefers-color-scheme: dark)').matches
			? darkTheme
			: lightTheme);

	const tm = await cmThemeExt(theme);
	if (tm) {
		extensions.push(tm);
	}

	if (config['wrap.line'] ?? true) {
		extensions.push(EditorView.lineWrapping);
	}

	return extensions;
};
