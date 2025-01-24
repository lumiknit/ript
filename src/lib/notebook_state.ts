import { Accessor, createSignal, Setter, Signal } from 'solid-js';

import { Context } from './bg_exec';
import { CellOutput, CellStruct, OutLine } from './cells';
import { createLLMClientWithLocalSettings } from './llm/helper_settings';

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

	workerCtx: Context;

	execQueue: number[] = [];
	executing: boolean = false;

	constructor(doc?: NotebookDoc) {
		[this.name, this.setName] = createSignal(doc?.name ?? 'Untitled');
		[this.cells, this.setCells] = createSignal(
			(doc?.cells ?? []).map((c) => createSignal(c))
		);
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

	async addCellWithAI(request: string) {
		const llm = await createLLMClientWithLocalSettings();
		if (!llm) throw new Error("Couldn't create LLM client");

		const systemPrompt = `
# Requirements
- Your whole answer should be a valid JavaScript code.
  - Text description is not required. Only code is enough.
  - For clarity, you may use markdown codeblock \`\`\`javascript ... \`\`\`.
- Note the following javascript spec:
  - Using modern JS features, write short and clean code. (Modern browser)
    - Keep code short. Do not use 'async' if not necessary.
  - DO NOT reimplement 'sleep: (ms: number) => Promise<void>'. Just use if you need.
  - You can use 'console.log', 'console.error', 'console.warn' to show the output to user.
  - '$' is a context object for sharing data between cells. e.g. '$.data = 10; console.log($["data"])'.
  - It'll run in a Web Worker.
  - You cannot use DOM APIs. e.g. document
  - You can use all built-in APIs in the browser. For example, console, window, OffscreenCanvas, WebAssembly, etc.
  - Your code will be wrapped with 'async () => { ... }' automatically. So, you can use 'await' at the top level.
  - When you call async function at the top-level, you MUST use 'await'. e.g. 'await run(...)', 'await main(...)', 'await testCode(...)'.

- Please add descriptive comments to your code, in user's language.

- User will give cells (code and its output) and their requests.
- You should give a code which satisfies the request.
		`.trim();

		const cells = this.cells().map((c) => c[0]());
		const str = cells.map((c, i) => {
			const code = c.code.code;
			let output: string | undefined = undefined;
			if (c.output) {
				output = c.output.lines.map((l) => '// ' + l.value).join('\n');
			}
			let b = `// *** Cell ${i} ***\n${code}\n`;
			if (output) {
				b += `// *** Outputs ***\n${output}\n`;
			}
			return b;
		});

		const userPrompt = `${str}\n//---\nRequest: ${request}`;
		console.log('System', systemPrompt);
		console.log('User', userPrompt);

		let code = await llm.singleChat(systemPrompt, userPrompt);
		console.log(code);

		const idx = code.indexOf('```javascript');
		if (idx >= 0) {
			code = code.slice(idx + '```javascript'.length);
			const end = code.indexOf('```');
			if (end >= 0) {
				code = code.slice(0, end);
			}
		}
		code.trim();

		const cell: CellStruct = {
			code: {
				language: 'javascript',
				code,
			},
		};
		this.addCell(cell);
	}
}
