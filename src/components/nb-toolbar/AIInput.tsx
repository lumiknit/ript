import { TbSparkles } from 'solid-icons/tb';
import { Component, createSignal, Match, Show, Switch } from 'solid-js';
import toast from 'solid-toast';

import { createLLMClientWithLocalSettings } from '../../lib/llm/helper_settings';
import { store } from '../../store';
import { AutoIncrTextarea } from '../utils';

type Props = {
	_?: never;
};

const AIInput: Component<Props> = () => {
	const [addCell, setAddCell] = createSignal(true);
	const [autoSend, setAutoSend] = createSignal(false);
	const [autoRun, setAutoRun] = createSignal(false);
	const [running, setRunning] = createSignal(false);
	let inputRef: HTMLTextAreaElement;

	const handleSend = async () => {
		const v = inputRef!.value.trim();
		if (!v) {
			toast.error('No Contents', {
				duration: 1000000,
			});
			return;
		}

		const llm = await createLLMClientWithLocalSettings();
		if (!llm) {
			toast.error('Failed to create LLM client');
			return;
		}

		if (addCell()) {
			// Insert an empty cell after the current cell
			store.notebookState.addEmptyCell(1 + store.notebookState.focused());
		}

		setRunning(true);
		await toast.promise(
			(async () => {
				await store.notebookState.genCode(llm, v);
				inputRef!.value = '';
				store.notebookState.scrollToCell(store.notebookState.focused());
			})(),
			{
				loading: 'Sending to AI...',
				success: 'AI response received',
				error: 'Failed to send to AI',
			}
		);
		setRunning(false);

		if (autoRun()) {
			store.notebookState.runCell(store.notebookState.focused());
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.isComposing || e.keyCode === 229) return;
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const eos = new Set<string>(['.', '!', '?', ';']);

	const handleInput = (e: InputEvent) => {
		if (!autoSend()) return;

		// Parse the string. Check the sentence finish one of the following characters: .!?; and then add a new line.
		let text = inputRef!.value.trim();
		while (text.length > 1) {
			switch (text[0]) {
				case '"':
				case "'":
				case '`':
					{
						let end = text.indexOf(text[0], 1);
						if (end === -1) end = text.length - 1;
						text = text.slice(end + 1);
					}
					break;
				default:
					text = text.slice(1);
			}
		}
		if (eos.has(text)) {
			handleSend();
		}
	};

	return (
		<>
			<div>
				<label class="checkbox no-user-select">
					<input
						type="checkbox"
						checked={addCell()}
						onChange={(e) => setAddCell(e.currentTarget.checked)}
					/>
					&nbsp;
					<Switch>
						<Match when={addCell()}> Insert Cell Below</Match>
						<Match when> Update Cell</Match>
					</Switch>
				</label>
				<label class="checkbox no-user-select">
					<input
						type="checkbox"
						checked={autoSend()}
						onChange={(e) => setAutoSend(e.currentTarget.checked)}
					/>
					&nbsp;
					<Switch>
						<Match when={autoSend()}>
							Auto send for <code>.?!;</code>
						</Match>
						<Match when>No auto-send</Match>
					</Switch>
				</label>
				<label class="checkbox no-user-select">
					<input
						type="checkbox"
						checked={autoRun()}
						onChange={(e) => setAutoRun(e.currentTarget.checked)}
					/>
					&nbsp;
					<Switch>
						<Match when={autoRun()}>Auto run</Match>
						<Match when>No auto-run</Match>
					</Switch>
				</label>
			</div>
			<Show when={running()}>
				<progress class="progress is-small is-primary" max="100">
					15%
				</progress>
			</Show>
			<div class="field is-grouped">
				<p class="control is-expanded">
					<AutoIncrTextarea
						ref={inputRef!}
						class="input"
						placeholder="LLM codegen (Enter to send)"
						onKeyDown={handleKeyDown}
						onInput={handleInput}
						disabled={running()}
					/>
				</p>
				<p class="control">
					<button class="button is-info" onClick={handleSend}>
						<TbSparkles />
					</button>
				</p>
			</div>
		</>
	);
};

export default AIInput;
