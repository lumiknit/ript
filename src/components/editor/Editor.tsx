import { Compartment, EditorState, Extension } from '@codemirror/state';
import { placeholder } from '@codemirror/view';
import { createMediaQuery } from '@solid-primitives/media';
import { EditorView } from 'codemirror';
import {
	Component,
	createEffect,
	JSX,
	onCleanup,
	onMount,
	splitProps,
} from 'solid-js';
import toast from 'solid-toast';

import { configToExtension, EditorConfig, myBasicConfig } from './config';
import './index.scss';
import { cmLangExt } from './langs';
import { store } from '../../store';

type Props = JSX.HTMLAttributes<HTMLDivElement> & {
	config?: EditorConfig;
	language?: string;

	content?: string;

	placeholder?: string;

	onModified?: (value: string) => void;
	onKeyDown?: (event: KeyboardEvent) => void;
	onFocus?: (event: FocusEvent) => void;
	onBlur?: (event: FocusEvent) => void;
};

const Editor: Component<Props> = (props_) => {
	const [props, divProps] = splitProps(props_, [
		'config',
		'language',
		'content',
		'placeholder',
		'onModified',
		'onKeyDown',
		'onFocus',
		'onBlur',
	]);

	let root: HTMLDivElement;
	const language = new Compartment();
	let view: EditorView;
	let state: EditorState;

	const cfgCompartment = new Compartment();
	const fontCompartment = new Compartment();

	const updateConfig = async (newCfg: EditorConfig) => {
		const ext = await configToExtension(newCfg);
		view.dispatch({
			effects: cfgCompartment.reconfigure(ext),
		});
	};

	const updateLanguage = async (lang: Extension) => {
		view.dispatch({
			effects: language.reconfigure(lang),
		});
	};

	onMount(async () => {
		console.log('Mounted');
		const updateListener = EditorView.updateListener.of((e) => {
			if (e.docChanged) {
				const s = e.state.doc.toString();
				props.onModified?.(s);
			}
		});

		state = EditorState.create({
			doc: props.content ?? '',
			extensions: [
				updateListener,
				myBasicConfig,
				props.placeholder ? placeholder(props.placeholder) : [],
				language.of([]),
				cfgCompartment.of([]),
				fontCompartment.of([]),
			],
		});

		view = new EditorView({
			state,
			parent: root!,
		});

		updateConfig(props.config ?? {});

		if (props.onKeyDown) {
			root!.addEventListener('keydown', props.onKeyDown, {
				capture: true,
			});
		}
		if (props.onFocus) {
			view.contentDOM.addEventListener('focus', props.onFocus);
		}
		if (props.onBlur) {
			view.contentDOM.addEventListener('blur', props.onBlur);
		}
	});

	onCleanup(() => {
		if (view) {
			view.destroy();
		}
	});

	// Dark mode detect
	const colorSchemeChanges = createMediaQuery('(prefers-color-scheme: dark)');
	createEffect(() => {
		colorSchemeChanges();
		updateConfig(props.config ?? {});
	});

	// Language change detect
	createEffect(async () => {
		if (props.language) {
			const ext = await cmLangExt(props.language);
			if (ext) {
				updateLanguage(ext);
			} else {
				toast.error(`Language ${props.language} not found`);
			}
		} else {
			updateLanguage([]);
		}
	});

	// Local settings change detect
	createEffect(() => {
		const s = store.localSettings;
		if (!s) return;
		const fontFamily = s['editor.fontFamily'] ?? 'monospace';
		const fontSize = s['editor.fontSize'] ?? '16px';
		console.log('Font family:', fontFamily);
		const effect = fontCompartment.reconfigure(
			EditorView.theme({
				'*': {
					fontFamily: fontFamily,
					fontSize: `${fontSize}px`,
				},
			})
		);
		view.dispatch({
			effects: [effect],
		});
	});

	// Content change detect
	createEffect(() => {
		const pc = props.content;
		const lastContent = view.state.doc.toString();
		if (pc === lastContent) return;
		// Transfer content() to dispatch
		view.dispatch({
			changes: {
				from: 0,
				to: view.state.doc.length,
				insert: pc ?? '',
			},
		});
	});

	return <div ref={root!} {...divProps} />;
};

export default Editor;
