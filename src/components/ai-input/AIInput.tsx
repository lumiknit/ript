import { Component } from 'solid-js';
import toast from 'solid-toast';

import { store } from '../../store';

type Props = {
	_?: never;
};

const AIInput: Component<Props> = () => {
	let inputRef: HTMLInputElement;

	const handleSend = async () => {
		toast.promise(store.notebookState.addCellWithAI(inputRef!.value), {
			loading: 'Sending to AI...',
			success: 'AI response received',
			error: 'Failed to send to AI',
		});
	};

	return (
		<div class="field is-grouped">
			<p class="control is-expanded">
				<input
					ref={inputRef!}
					class="input"
					type="text"
					placeholder="Request to AI"
				/>
			</p>
			<p class="control">
				<button class="button is-primary" onClick={handleSend}>
					Send
				</button>
			</p>
		</div>
	);
};

export default AIInput;
