import { Component, For, Show } from 'solid-js';

import AIInput from '../components/ai-input/AIInput';
import Cell from '../components/cell/Cell';
import { Header } from '../components/nb-toolbar';
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
			<Header />

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

			<AIInput />
		</div>
	);
};

export default Notebook;
