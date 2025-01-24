/**
 * Cell code
 */
export type CellCode = {
	language: string;
	code: string;
};

/**
 * Cell text output
 */
export type OutText = {
	type: 'text';
	level: 'info' | 'warn' | 'error';
	value: string;
};

/**
 * Cell image output
 */
export type OutImage = {
	type: 'image';
	value: string;
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
