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
	 * Executed timestamp
	 */
	timestamp: Date;

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
