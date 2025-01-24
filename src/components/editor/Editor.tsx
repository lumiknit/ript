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

type Props = JSX.HTMLAttributes<HTMLDivElement> & {
	config?: EditorConfig;
	language?: string;

	content?: string;

	placeholder?: string;

	onModified?: (value: string) => void;
	onKeyDown?: (event: KeyboardEvent) => void;
};

const Editor: Component<Props> = (props_) => {
	const [props, divProps] = splitProps(props_, [
		'config',
		'language',
		'content',
		'placeholder',
		'onModified',
		'onKeyDown',
	]);

	let root: HTMLDivElement;
	const language = new Compartment();
	let view: EditorView;
	let state: EditorState;

	const cfgCompartment = new Compartment();

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
			],
		});

		view = new EditorView({
			state,
			parent: root!,
		});

		updateConfig(props.config ?? {});

		if (props.onKeyDown) {
			root.addEventListener('keydown', props.onKeyDown, {
				capture: true,
			});
		}
	});

	onCleanup(() => {
		view.destroy();
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
