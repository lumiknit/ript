import { Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { OutLine, OutText } from '../../lib/cells';

type Props = {
	out: OutLine;
};

const textClasses: Record<string, string> = {
	info: 'cell-out-info',
	error: 'cell-out-error',
	warn: 'cell-out-warn',
};

const CellOutText: Component<Props> = (props) => {
	const o = () => props.out as OutText;
	return (
		<div class={`cell-out-text ${textClasses[o().level] || ''}`}>
			{o().value}
		</div>
	);
};

const CellOutImage: Component<Props> = () => {
	return <div> Unimplemented </div>;
};

const cells = {
	text: CellOutText,
	image: CellOutImage,
};

const CellOutLine: Component<Props> = (props) => {
	return <Dynamic component={cells[props.out.type]} {...props} />;
};

export default CellOutLine;
