/**
 * Background JS Executor
 */

import { type Message, RunReqMsg } from './messages';
import { OutLine } from '../notebook/cells';

type LineCallback = (lines: OutLine[]) => void;

/**
 * JS Executor Context
 */
export class Context {
	/**
	 * Background js worker
	 */
	worker: Worker = null!;

	/**
	 * Is the worker running flag
	 */
	running: boolean = false;

	/**
	 * Resolve run promise.
	 * When the worker finishes, this promise will be resolved with the output.
	 */
	resolveRun: (v: OutLine[]) => void = () => {};

	/**
	 * Line callback.
	 * When the worker sends some output lines, this callback will be called.
	 */
	lineCallback: LineCallback = () => {};

	constructor() {
		this.createInstance();
	}

	private onMessage(e: MessageEvent) {
		const d = e.data as Message;
		switch (d.type) {
			case '<int-out':
				{
					// Intermediate output.
					this.lineCallback(d.lines);
				}
				break;

			case '<run': {
				this.running = false;
				this.resolveRun(d.output);
				console.log('<run', d);

				// Reset callbacks
				this.resolveRun = () => {};
				this.lineCallback = () => {};
				break;
			}
		}
	}

	createInstance() {
		this.worker = new Worker(new URL('./worker.ts', import.meta.url));
		this.worker.onmessage = this.onMessage.bind(this);
		this.worker.onerror = (e) => {
			console.error('Worker error', e);
		};
	}

	terminateInstance() {
		this.worker.terminate();
		this.resolveRun([]);
		this.createInstance();
	}

	run(code: string, lineCallback?: LineCallback): Promise<OutLine[]> {
		if (this.running) {
			throw new Error('Worker is already running');
		}

		const ev: RunReqMsg = {
			type: '>run',
			code,
		};

		this.lineCallback = lineCallback ?? (() => {});

		this.worker.postMessage(ev);

		return new Promise<OutLine[]>((resolve) => {
			this.resolveRun = resolve;
		});
	}
}
