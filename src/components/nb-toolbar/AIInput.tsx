import { TbSparkles } from 'solid-icons/tb';
import { Component } from 'solid-js';
import toast from 'solid-toast';

import { createLLMClientWithLocalSettings } from '../../lib/llm/helper_settings';
import { store } from '../../store';
import { AutoIncrTextarea } from '../utils';

type Props = {
	_?: never;
};

const AIInput: Component<Props> = () => {
	let inputRef: HTMLTextAreaElement;

	const handleSend = async () => {
		const v = inputRef!.value.trim();
		if (!v) return;

		inputRef!.value = '';

		const llm = await createLLMClientWithLocalSettings();
		if (!llm) {
			toast.error('Failed to create LLM client');
			return;
		}

		toast.promise(
			(async () => await store.notebookState.genNewCell(llm, v))(),
			{
				loading: 'Sending to AI...',
				success: 'AI response received',
				error: 'Failed to send to AI',
			}
		);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			handleSend();
			e.preventDefault();
		}
	};

	return (
		<div class="field is-grouped">
			<p class="control is-expanded">
				<AutoIncrTextarea
					ref={inputRef!}
					class="input"
					placeholder="LLM codegen (Enter to send)"
					onKeyDown={handleKeyDown}
				/>
			</p>
			<p class="control">
				<button class="button is-info" onClick={handleSend}>
					<TbSparkles />
				</button>
			</p>
		</div>
	);
};

export default AIInput;
