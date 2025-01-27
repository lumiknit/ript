import { Accessor, batch, createSignal, Setter, Signal } from 'solid-js';

import { Context } from './bg_exec';
import { notebooksTx } from './idb';
import { createLLMClientWithLocalSettings } from './llm/helper_settings';
import {
	CellOutput,
	CellStruct,
	cellStructToMD,
	OutLine,
} from './notebook/cells';
import addCellPrompt from '../prompts/add_cell.tpl?raw';
import genTitlePrompt from '../prompts/gen_title.tpl?raw';
import {
	freezeCell,
	FrozenCell,
	NotebookDoc,
	thawCell,
} from './notebook/notebook';
import { longRandomString } from './random';

/**
 * Current UI Notebook State.
 *
 * This class contains the current state of the notebook.
 */
export class NotebookState {
	_id: string;

	// Notebook name
	name: Accessor<string>;
	setName: Setter<string>;

	// Notebook cells
	cells: Accessor<Signal<CellStruct>[]>;
	setCells: Setter<Signal<CellStruct>[]>;

	// Current focused cell index.
	focused: Accessor<number>;
	setFocused: Setter<number>;

	/**
	 * Current worker context
	 */
	workerCtx: Context;

	/**
	 * Execution index counter
	 */
	execCnt: number = 0;

	/**
	 * Execution queue.
	 * This queue contains the indexes of the cells that are to be
	 */
	execQueue: number[] = [];

	/**
	 * Execution status
	 */
	executing: boolean = false;

	/**
	 * Cancel function for the current execution
	 */
	cancel: () => void = () => {};

	constructor() {
		this._id = longRandomString();
		[this.name, this.setName] = createSignal('Untitled');
		[this.cells, this.setCells] = createSignal<Signal<CellStruct>[]>([]);
		[this.focused, this.setFocused] = createSignal(-1);
		this.workerCtx = new Context();
	}

	/**
	 * Freeze the current notebook state.
	 */
	async freeze(): Promise<NotebookDoc> {
		const cells: FrozenCell[] = await Promise.all(
			this.cells().map(async (cell) => await freezeCell(cell[0]()))
		);
		return {
			_id: this._id,
			version: 1,
			name: this.name(),
			updatedAt: new Date().toISOString(),
			cells,
		};
	}

	/**
	 * Thaw the notebook state from a frozen state.
	 */
	async thaw(doc: NotebookDoc) {
		this.resetContext();

		const cells: CellStruct[] = await Promise.all(doc.cells.map(thawCell));
		this._id = doc._id;
		this.setName(doc.name);
		this.setCells(cells.map((c) => createSignal(c)));
	}

	/**
	 * Save to idb
	 */
	async save() {
		const doc = await this.freeze();
		const tx = await notebooksTx<NotebookDoc>();
		await tx.put(doc);
	}

	/**
	 * Load from idb
	 */
	async load(id: string) {
		const tx = await notebooksTx<NotebookDoc>();
		const doc = await tx.get(id);
		if (!doc) return;
		await this.thaw(doc);
	}

	/**
	 * Reset current working context.
	 * If there is an ongoing execution, it will be cancelled.
	 */
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

	/**
	 * Insert a cell at the specified index.
	 */
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

		this.setFocused(index);
	}

	/**
	 * Add an empty cell at the specified index.
	 */
	addEmptyCell(index?: number) {
		const emptyCell: CellStruct = {
			code: {
				language: 'javascript',
				code: '',
			},
		};
		this.addCell(emptyCell, index);
	}

	/**
	 * Remove a cell at the specified index.
	 */
	removeCell(index: number) {
		this.setCells((cs) => cs.filter((_, i) => i !== index));

		// Update queue
		this.execQueue.map((v) => {
			if (v > index) return v - 1;
			else if (v === index) return -1;
			return v;
		});
	}

	/**
	 * Update a cell at the specified index.
	 */
	updateCell(index: number, v: CellStruct | ((c: CellStruct) => CellStruct)) {
		const cellSig = this.cells()[index];
		if (!cellSig) return;
		cellSig[1](v);
	}

	/**
	 * Execute all cells before the specified index.
	 * If the index is not specified, all cells will be executed.
	 */
	runCellsBefore(index?: number) {
		if (index === undefined) index = this.cells().length;
		for (let i = 0; i < this.cells().length && i < index; i++) {
			this.runCell(i);
		}
	}

	/**
	 * Execute a cell at the specified index.
	 */
	runCell(index: number) {
		const cell = this.cells()[index];
		if (!cell) return;
		cell[1]((c) => ({ ...c, output: undefined }));

		// Push to the execution queue
		this.execQueue.push(index);
		this.execute();
	}

	/**
	 * Execute cell loop.
	 */
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

	/**
	 * Generate a code and add a cell with the LLM.
	 */
	async genNewCell(request: string) {
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

	/**
	 * Generate a title with the LLM.
	 */
	async genTitle() {
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
