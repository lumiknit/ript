import { TbPlus } from 'solid-icons/tb';
import { Component, For } from 'solid-js';

import Cell from '../components/cell/Cell';
import { CellStruct } from '../lib/cells';
import { NotebookState } from '../lib/notebook_state';

const Notebook: Component = () => {
	const s = new NotebookState();

	const handleCodeUpdate = (index: number) => (code: string) => {
		s.updateCell(index, (c: CellStruct) => ({
			...c,
			code: { ...c.code, code },
		}));
	};

	const handleRun = (index: number) => () => {
		s.runCell(index);
	};

	return (
		<div>
			<For each={s.cells()}>
				{(cell, i) => (
					<Cell
						index={i()}
						cell={cell[0]()}
						onCodeUpdate={handleCodeUpdate(i())}
						onRun={handleRun(i())}
					/>
				)}
			</For>

			<div class="columns is-centered">
				<button
					class="button is-small is-primary"
					onClick={() => s.addEmptyCell()}
				>
					<TbPlus />
					Add
				</button>
			</div>
		</div>
	);
};

export default Notebook;
