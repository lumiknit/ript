import { OutLine } from '../cells';

export type RunReqMsg = {
	type: '>run';
	code: string;
};

export type IntermediateOutMsg = {
	type: '<int-out';
	lines: OutLine[];
};

export type RunRespMsg = {
	type: '<run';
	output: OutLine[];
};

export type Message = RunReqMsg | IntermediateOutMsg | RunRespMsg;
