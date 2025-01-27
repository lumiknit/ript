import { Component } from 'solid-js';

import Title from './Title';
import Toolbar from './Toolbar';

const Header: Component = () => {
	return (
		<div class="nb-header sticky-top">
			<Title />
			<Toolbar />
		</div>
	);
};

export default Header;
