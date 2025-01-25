// Loop for wait for the worker to finish

import { OutLine } from '../cells';
import { Message, RunRespMsg } from './messages';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
sleep(0);

const globalContext = {};

class Console {
	outputs: OutLine[] = [];

	private logWithLevel(level: 'info' | 'warn' | 'error', ...args: any[]) {
		const line: OutLine = {
			type: 'text',
			level,
			value: args.join(' '),
		};
		this.outputs.push(line);
		postMessage({
			type: '<int-out',
			lines: [line],
		});
	}

	log(...args: any[]) {
		return this.logWithLevel('info', ...args);
	}

	debug(...args: any[]) {
		return this.logWithLevel('info', ...args);
	}

	warn(...args: any[]) {
		return this.logWithLevel('warn', ...args);
	}

	error(...args: any[]) {
		return this.logWithLevel('error', ...args);
	}
}

self.onmessage = async (e) => {
	const msg = e.data as Message;
	switch (msg.type) {
		case '>run':
			{
				console.log('[Worker] Received run message');
				const code = msg.code;
				const con = new Console();

				try {
					console.log('[Worker] Creating a function from code');
					const fn = new AsyncFunction('$', 'console', code);
					console.log('[Worker] Executing the function');
					await fn(globalContext, con);
					console.log('[Worker] Function executed');
				} catch (e) {
					console.error('[Worker] Error while executing code');
					con.error(e);
				}
				const ret: RunRespMsg = {
					type: '<run',
					output: con.outputs,
				};
				self.postMessage(ret);
			}
			break;
		default:
			throw new Error(`Unknown message type: ${msg.type}`);
	}
};

console.log('Workers ready');
