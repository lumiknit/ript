import { Component, onMount } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { OutImage, OutLine, OutText } from '../../lib/notebook/cells';

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
	return <div class="cell-out-text">{o().value}</div>;
};

const CellOutImage: Component<Props> = (props) => {
	let canvasRef: HTMLCanvasElement;
	const o = () => props.out as OutImage;

	onMount(() => {
		canvasRef!.width = o().value.width;
		canvasRef!.height = o().value.height;
		const ctx = canvasRef!.getContext('2d');
		ctx!.drawImage(o().value, 0, 0);
	});

	// Offscreen canvas to image
	return (
		<>
			<canvas ref={canvasRef!} />
			(image {o().value.width}x{o().value.height})
		</>
	);
};

const cells = {
	text: CellOutText,
	image: CellOutImage,
};

const CellOutLine: Component<Props> = (props) => {
	return (
		<div class={`cell-out-line ${textClasses[props.out.level] || ''}`}>
			<Dynamic component={cells[props.out.type]} {...props} />
		</div>
	);
};

export default CellOutLine;
