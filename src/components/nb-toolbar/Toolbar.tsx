import {
	TbDeviceFloppy,
	TbPlayerPlay,
	TbPlayerStop,
	TbPlus,
} from 'solid-icons/tb';
import { Component, JSX } from 'solid-js';
import toast from 'solid-toast';

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
	const s = () => store.notebookState;

	const handleSave = async () => {
		toast.promise(s().save(), {
			loading: 'Saving...',
			success: 'Saved',
			error: (e) => {
				console.error(e);
				return 'Failed to save';
			},
		});
	};

	return (
		<div class="nb-toolbar">
			<Btn class="is-primary" onClick={handleSave}>
				<TbDeviceFloppy />
			</Btn>

			<Btn class="" onClick={() => s().addEmptyCell()}>
				<TbPlus />
			</Btn>

			<Btn class="is-success" onClick={() => s().runCellsBefore()}>
				<TbPlayerPlay />
			</Btn>

			<Btn class="is-danger" onClick={() => s().resetContext()}>
				<TbPlayerStop />
			</Btn>
		</div>
	);
};

export default Toolbar;
