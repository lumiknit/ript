import { CellOutput, CellStruct, OutLine } from './cells';
import { bitmapToDataURL } from './image';

export const notebookVersion = 1;

export type FrozenCell = CellStruct<string, string>;

/**
 * Frozen notebook struct.
 * This struct can be serialized to JSON.
 */
export type NotebookDoc = {
	_id: string;
	version: number;
	name: string;
	updatedAt: string;
	cells: CellStruct<string, string>[];
};

export const freezeCell = async (cell: CellStruct): Promise<FrozenCell> => {
	let output: undefined | CellOutput<string, string> = undefined;
	if (cell.output) {
		const lines: OutLine<string>[] = [];
		for (const line of cell.output.lines) {
			let l: OutLine<string>;
			switch (line.type) {
				case 'text': {
					l = {
						type: 'text',
						level: line.level,
						value: line.value,
					};
					break;
				}
				case 'image': {
					const img = await bitmapToDataURL(line.value);
					l = {
						type: 'image',
						level: line.level,
						value: img,
					};
					break;
				}
			}
			lines.push(l);
		}
		output = {
			index: cell.output.index,
			startAt: cell.output.startAt.toISOString(),
			endAt: cell.output.endAt?.toISOString(),
			lines,
		};
	}
	return {
		...cell,
		output,
	};
};

export const thawCell = async (cell: FrozenCell): Promise<CellStruct> => {
	let output: undefined | CellOutput<Date, ImageBitmap> = undefined;
	if (cell.output) {
		const lines: OutLine<ImageBitmap>[] = [];
		for (const line of cell.output.lines) {
			let l: OutLine<ImageBitmap>;
			switch (line.type) {
				case 'text': {
					l = {
						type: 'text',
						level: line.level,
						value: line.value,
					};
					break;
				}
				case 'image': {
					const img = await createImageBitmap(new Blob([line.value]));
					l = {
						type: 'image',
						level: line.level,
						value: img,
					};
					break;
				}
			}
			lines.push(l);
		}
		output = {
			index: cell.output.index,
			startAt: new Date(cell.output.startAt),
			endAt: cell.output.endAt ? new Date(cell.output.endAt) : undefined,
			lines,
		};
	}
	return {
		...cell,
		output,
	};
};
