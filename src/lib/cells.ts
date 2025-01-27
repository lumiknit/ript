/**
 * Cell code
 */
export type CellCode = {
	language: string;
	code: string;
};

export type OutLevel = 'info' | 'warn' | 'error';

/**
 * Cell output base
 */
export type OutBase = {
	type: string;
	level: OutLevel;
};

/**
 * Cell text output
 */
export type OutText = OutBase & {
	type: 'text';
	value: string;
};

/**
 * Cell image output
 */
export type OutImage = OutBase & {
	type: 'image';
	level: 'info' | 'warn' | 'error';
	value: ImageBitmap;
};

/**
 * Cell a single line output
 */
export type OutLine = OutText | OutImage;

/**
 * Cell Output
 */
export type CellOutput = {
	/**
	 * The order in which the cell was executed
	 */
	index: number;

	/**
	 * Execution start timestamp
	 */
	startAt: Date;

	/**
	 * Execution end timestamp
	 */
	endAt?: Date;

	/**
	 * Output lines
	 */
	lines: OutLine[];
};

/**
 * Cell struct
 */
export type CellStruct = {
	/** Actual code */
	code: CellCode;

	/** Output of the code */
	output?: CellOutput;
};

/**
 * Convert a cell struct to markdown format
 */
export const cellStructToMD = (cell: CellStruct): string => {
	const code = cell.code.code;
	let result = `### Code\n` + '```javascript\n' + code + '\n```\n';

	const o = cell.output;
	if (o) {
		const outputs = o.lines.map((l) => l.value).join('\n');
		result += `### Outputs\n` + '```\n' + outputs + '\n```\n';
	}
	return result;
};
