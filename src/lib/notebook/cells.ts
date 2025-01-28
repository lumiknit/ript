/**
 * Cell code
 */
export type CellCode = {
	language: string;
	code: string;
};

/**
 * Output Level
 */
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
export type OutImage<Img = ImageBitmap> = OutBase & {
	type: 'image';
	value: Img;
};

/**
 * Cell a single line output
 */
export type OutLine<Img = ImageBitmap> = OutText | OutImage<Img>;

/**
 * Cell Output
 */
export type CellOutput<Dt = Date, Img = ImageBitmap> = {
	/**
	 * The order in which the cell was executed
	 */
	index: number;

	/**
	 * Execution start timestamp
	 */
	startAt: Dt;

	/**
	 * Execution end timestamp
	 */
	endAt?: Dt;

	/**
	 * Output lines
	 */
	lines: OutLine<Img>[];
};

/**
 * Cell struct
 */
export type CellStruct<Dt = Date, Img = ImageBitmap> = {
	/** Actual code */
	code: CellCode;

	/** Output of the code */
	output?: CellOutput<Dt, Img>;
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
