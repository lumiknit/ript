import { Accessor, batch, createSignal, Setter, Signal } from 'solid-js';

import { Context } from './bg_exec';
import { CellOutput, CellStruct, cellStructToMD, OutLine } from './cells';
import { createLLMClientWithLocalSettings } from './llm/helper_settings';
import addCellPrompt from '../prompts/add_cell.tpl?raw';
import genTitlePrompt from '../prompts/gen_title.tpl?raw';

export type NotebookDoc = {
	version: number;
	name: string;
	cells: CellStruct[];
};

/**
 * Notebook status
 */
export class NotebookState {
	name: Accessor<string>;
	setName: Setter<string>;

	cells: Accessor<Signal<CellStruct>[]>;
	setCells: Setter<Signal<CellStruct>[]>;

	focused: Accessor<number>;
	setFocused: Setter<number>;

	workerCtx: Context;

	execCnt: number = 0;
	execQueue: number[] = [];
	executing: boolean = false;
	cancel: () => void = () => {};

	constructor(doc?: NotebookDoc) {
		[this.name, this.setName] = createSignal(doc?.name ?? 'Untitled');
		[this.cells, this.setCells] = createSignal(
			(doc?.cells ?? []).map((c) => createSignal(c))
		);
		[this.focused, this.setFocused] = createSignal(-1);
		this.workerCtx = new Context();
	}

	resetContext() {
		if (this.cancel) this.cancel();

		this.workerCtx.terminateInstance();
		this.workerCtx = new Context();
		this.execCnt = 0;
		this.execQueue = [];
		this.cancel = () => {};

		batch(() => {
			this.cells().forEach((cell, i) => {
				cell[1]((c) => ({ ...c, output: undefined }));
			});
		});
	}

	addCell(cell: CellStruct, index?: number) {
		if (index === undefined) {
			index = this.focused() + 1;
		}
		index = Math.min(Math.max(index, 0), this.cells().length);

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

	runCellsBefore(index?: number) {
		if (index === undefined) index = this.cells().length;
		for (let i = 0; i < this.cells().length && i < index; i++) {
			this.runCell(i);
		}
	}

	runCell(index: number) {
		const cell = this.cells()[index];
		if (!cell) return;
		cell[1]((c) => ({ ...c, output: undefined }));

		// Push to the execution queue
		this.execQueue.push(index);
		this.execute();
	}

	private async execute() {
		if (this.executing) return;
		this.executing = true;

		while (this.execQueue.length > 0) {
			const cellIndex = this.execQueue.shift();
			if (cellIndex === undefined) continue;

			const index = ++this.execCnt;

			const cellSig = this.cells()[cellIndex];
			if (!cellSig) continue;

			const [cell, setCell] = cellSig;
			const startAt = new Date();

			const res = await this.workerCtx.run(
				cell().code.code,
				(newLines: OutLine[]) => {
					setCell((c) => {
						const l = [...(c.output?.lines ?? []), ...newLines];
						return {
							...c,
							output: {
								index,
								startAt,
								lines: l,
							},
						};
					});
				}
			);

			// Update the cell
			const output: CellOutput = {
				index,
				startAt,
				endAt: new Date(),
				lines: res,
			};
			setCell((c) => ({ ...c, output }));
		}

		this.executing = false;
	}

	async addCellWithAI(request: string) {
		const llm = await createLLMClientWithLocalSettings();
		if (!llm) throw new Error("Couldn't create LLM client");

		const systemPrompt = addCellPrompt;

		const cellMDs = [];
		for (const cell of this.cells()) {
			cellMDs.push(cellStructToMD(cell[0]()));
		}

		const userPrompt =
			cellMDs.join('\n\n') +
			'\n\n' +
			`# Current Cell Request\n` +
			request;

		console.log('System', systemPrompt);
		console.log('User', userPrompt);

		let code = await llm.singleChat(systemPrompt, userPrompt);
		console.log('Output', code);

		const idx = code.indexOf('```javascript');
		if (idx >= 0) {
			code = code.slice(idx + '```javascript'.length);
			const end = code.indexOf('```');
			if (end >= 0) {
				code = code.slice(0, end);
			}
		}
		code = code.trim();

		const cell: CellStruct = {
			code: {
				language: 'javascript',
				code,
			},
		};
		this.addCell(cell);
	}

	async aiTitle() {
		const llm = await createLLMClientWithLocalSettings();
		if (!llm) throw new Error("Couldn't create LLM client");

		const systemPrompt = genTitlePrompt;

		const cellMDs = [];
		for (const cell of this.cells()) {
			cellMDs.push(cellStructToMD(cell[0]()));
		}

		const userPrompt = cellMDs.join('\n\n');

		console.log('System', systemPrompt);
		console.log('User', userPrompt);

		const title = await llm.singleChat(systemPrompt, userPrompt);
		console.log('Generated Title', title);

		this.setName(title.trim());
	}
}
