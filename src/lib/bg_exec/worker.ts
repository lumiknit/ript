// Loop for wait for the worker to finish

import { OutLine } from '../cells';
import { Message } from './messages';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
sleep(0);

(() => {
	const cloneImageBitmap = (img: ImageBitmap | OffscreenCanvas) => {
		const os = new OffscreenCanvas(img.width, img.height);
		const ctx = os.getContext('2d');
		ctx!.drawImage(img, 0, 0);
		return os.transferToImageBitmap();
	};

	const globalContext = {};

	type LogLevel = 'info' | 'warn' | 'error';

	class Console {
		outputs: OutLine[] = [];
		transfers: Transferable[] = [];

		private flushText(level: LogLevel, text: string) {
			if (text === '') return;
			const l: OutLine = {
				type: 'text',
				level,
				value: text,
			};
			this.outputs.push(l);
			postMessage({
				type: '<int-out',
				lines: [l],
			});
		}

		private flushImage(
			level: LogLevel,
			img: OffscreenCanvas | ImageBitmap
		) {
			const i1 = cloneImageBitmap(img);
			this.outputs.push({
				type: 'image',
				level,
				value: i1,
			});
			this.transfers.push(i1);

			const i2 = cloneImageBitmap(img);
			self.postMessage(
				{
					type: '<int-out',
					lines: [
						{
							type: 'image',
							level,
							value: i2,
						},
					],
				},
				[i2] as any
			);
		}

		private logWithLevel(level: 'info' | 'warn' | 'error', ...args: any[]) {
			let texts = [];
			for (const arg of args) {
				if (
					arg instanceof OffscreenCanvas ||
					arg instanceof ImageBitmap
				) {
					console.log('42');
					// Flush the current textx
					this.flushText(level, texts.join(' '));
					texts = [];

					// Clone the image
					this.flushImage(level, arg);
				} else if (arg instanceof Error) {
					texts.push(arg.stack);
				} else {
					texts.push(String(arg));
				}
			}
			this.flushText(level, texts.join(' '));
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

	Console.toString = () => 'function Console() { [native code] }';

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
						console.error('[Worker] Error while executing code', e);
						con.error(e);
					}
					console.log(con.outputs);
					self.postMessage(
						{
							type: '<run',
							output: con.outputs,
						},
						con.transfers as any
					);
				}
				break;
			default:
				throw new Error(`Unknown message type: ${msg.type}`);
		}
	};

	console.log('Workers ready');
})();
