import { Component } from 'solid-js';

import { store } from '../../store';

type Props = {
	_?: never;
};

const Toolbar: Component<Props> = () => {
	const s = () => store.notebookState;
	return (
		<div>
			<button class="button is-small is-primary"> Run </button>
			<button class="button is-small is-danger"> Restart </button>
			<button class="button is-small is-danger"> Restart </button>
		</div>
	);
};

export default Toolbar;
