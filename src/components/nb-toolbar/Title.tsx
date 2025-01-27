import { TbCheck, TbSparkles } from 'solid-icons/tb';
import { Component, createSignal, Match, Switch } from 'solid-js';

import { store } from '../../store';

const Title: Component = () => {
	const [editing, setEditing] = createSignal(false);

	let nameInputRef: HTMLInputElement;

	const applyName = () => {
		store.notebookState.setName(nameInputRef!.value);
		setEditing(false);
	};

	const generateAITitle = async () => {
		await store.notebookState.aiTitle();
		setEditing(false);
	};

	return (
		<div class="mb-2">
			<Switch>
				<Match when={editing()}>
					<div class="field is-grouped">
						<p class="control is-expanded">
							<input
								ref={nameInputRef!}
								class="input"
								placeholder="Notebook Name"
								value={store.notebookState.name()}
								autofocus
							/>
						</p>
						<p class="control">
							<button
								class="button is-info"
								onClick={generateAITitle}
								title="Generate with AI"
							>
								<TbSparkles />
							</button>
						</p>
						<p class="control">
							<button
								class="button is-success"
								onClick={applyName}
								title="Save"
							>
								<TbCheck />
							</button>
						</p>
					</div>
				</Match>
				<Match when>
					<h1 class="title is-1" onClick={() => setEditing(true)}>
						{store.notebookState.name() || 'Untitled'}
					</h1>
				</Match>
			</Switch>
		</div>
	);
};

export default Title;
