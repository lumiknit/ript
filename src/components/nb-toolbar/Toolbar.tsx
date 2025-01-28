import {
	TbArrowBigDownLines,
	TbPlayerPlay,
	TbPlayerStop,
	TbSquarePlus,
	TbSquareX,
} from 'solid-icons/tb';
import { Component, JSX } from 'solid-js';

import { store } from '../../store';

type BtnProps = {
	children: JSX.Element | JSX.Element[];
	class: string;
	onClick: () => void;
};

const Btn: Component<BtnProps> = (props) => {
	return (
		<button
			class={`button is-small ${props.class}`}
			onClick={props.onClick}
		>
			{props.children}
		</button>
	);
};

type Props = {
	_?: never;
};

const Toolbar: Component<Props> = () => {
	const handleRunOne = async () => {
		store.notebookState.runCell(store.notebookState.focused());
		const focused = store.notebookState.focused();
		if (focused + 1 < store.notebookState.cells().length) {
			store.notebookState.setFocused(focused + 1);
		} else {
			store.notebookState.addEmptyCell();
		}
	};

	return (
		<div class="nb-toolbar">
			<Btn class="" onClick={() => store.notebookState.addEmptyCell()}>
				<TbSquarePlus />
			</Btn>

			<Btn
				class="is-danger"
				onClick={() =>
					store.notebookState.removeCell(
						store.notebookState.focused()
					)
				}
			>
				<TbSquareX />
			</Btn>

			<span class="p-1" />

			<Btn class="is-success" onClick={handleRunOne}>
				<TbPlayerPlay />
			</Btn>

			<span class="p-1" />

			<Btn
				class="is-success"
				onClick={() =>
					store.notebookState.runCellsBefore(
						1 + store.notebookState.focused()
					)
				}
			>
				<TbArrowBigDownLines />
			</Btn>

			<Btn
				class="is-danger"
				onClick={() => store.notebookState.resetContext()}
			>
				<TbPlayerStop />
			</Btn>
		</div>
	);
};

export default Toolbar;
