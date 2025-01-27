import { TbPlus } from 'solid-icons/tb';
import { Component, For, Show } from 'solid-js';

import AIInput from '../components/ai-input/AIInput';
import Cell from '../components/cell/Cell';
import Title from '../components/nb-toolbar/Title';
import Toolbar from '../components/nb-toolbar/Toolbar';
import { CellStruct } from '../lib/cells';
import { store } from '../store';

const Notebook: Component = () => {
	const handleCodeUpdate = (index: number) => (code: string) => {
		store.notebookState.updateCell(index, (c: CellStruct) => ({
			...c,
			code: { ...c.code, code },
		}));
	};

	const handleRun = (index: number) => () => {
		store.notebookState.runCell(index);
	};

	return (
		<div class="container p-2">
			<Title />

			<Toolbar />

			<Show when={store.notebookState.cells().length === 0}>
				<span> (No Cells) </span>
			</Show>
			<For each={store.notebookState.cells()}>
				{(cell, i) => (
					<Cell
						index={i()}
						cell={cell[0]()}
						onCodeUpdate={handleCodeUpdate(i())}
						onRun={handleRun(i())}
					/>
				)}
			</For>

			<div class="columns is-centered is-mobile">
				<div class="column is-half">
					<button
						class="button is-small is-primary"
						onClick={() => store.notebookState.addEmptyCell()}
					>
						<TbPlus />
						Add
					</button>
				</div>
			</div>

			<AIInput />
		</div>
	);
};

export default Notebook;
