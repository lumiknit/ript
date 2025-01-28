import { Component } from 'solid-js';

import Title from './Title';
import Toolbar from './Toolbar';

const Header: Component = () => {
	return (
		<div class="container p-2 nb-header sticky-top blur-background">
			<Title />
			<Toolbar />
		</div>
	);
};

export default Header;
