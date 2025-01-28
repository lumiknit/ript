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
	const [running, setRunning] = createSignal(false);
	let inputRef: HTMLTextAreaElement;

	const handleSend = async () => {
		const v = inputRef!.value.trim();
		if (!v) return;

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
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.isComposing || e.keyCode === 229) return;
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
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
