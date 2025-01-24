import { Accessor, createSignal, Setter, Signal } from 'solid-js';

import { Context } from './bg_exec';
import { CellOutput, CellStruct, OutLine } from './cells';

/**
 * Notebook status
 */
export class NotebookState {
	name: Accessor<string>;
	setName: Setter<string>;

	cells: Accessor<Signal<CellStruct>[]>;
	setCells: Setter<Signal<CellStruct>[]>;

	workerCtx: Context;

	execQueue: number[] = [];
	executing: boolean = false;

	constructor() {
		[this.name, this.setName] = createSignal('');
		[this.cells, this.setCells] = createSignal<Signal<CellStruct>[]>([]);
		this.workerCtx = new Context();
	}

	addCell(cell: CellStruct, index?: number) {
		index = index ?? this.cells().length;

		const cellSig = createSignal(cell);

		this.setCells((cs) => {
			return [...cs.slice(0, index), cellSig, ...cs.slice(index)];
		});

		// Update queue
		this.execQueue = this.execQueue.map((v) => (v >= index ? v + 1 : v));
	}

	addEmptyCell(index?: number) {
		const emptyCell: CellStruct = {
			code: {
				language: 'javascript',
				code: '',
			},
		};
		this.addCell(emptyCell, index);
	}

	removeCell(index: number) {
		this.setCells((cs) => cs.filter((_, i) => i !== index));

		// Update queue
		this.execQueue.map((v) => {
			if (v > index) return v - 1;
			else if (v === index) return -1;
			return v;
		});
	}

	updateCell(index: number, v: CellStruct | ((c: CellStruct) => CellStruct)) {
		const cellSig = this.cells()[index];
		if (!cellSig) return;
		cellSig[1](v);
	}

	runCell(index: number) {
		const cell = this.cells()[index];
		if (!cell) return;

		// Push to the execution queue
		this.execQueue.push(index);
		this.execute();
	}

	private async execute() {
		if (this.executing) return;
		this.executing = true;

		while (this.execQueue.length > 0) {
			const index = this.execQueue.shift();
			if (index === undefined) continue;

			const cellSig = this.cells()[index];
			if (!cellSig) continue;

			const [cell, setCell] = cellSig;

			const res = await this.workerCtx.run(
				cell().code.code,
				(lines: OutLine[]) => {
					setCell((c) => ({
						...c,
						output: { index: 0, timestamp: new Date(), lines },
					}));
				}
			);

			// Update the cell
			const output: CellOutput = {
				index: 0,
				timestamp: new Date(),
				lines: res,
			};
			setCell((c) => ({ ...c, output }));
		}

		this.executing = false;
	}
}
