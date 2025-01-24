/* @refresh reload */
import { Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';

import './index.scss';
import App from './App.tsx';
import AboutPage from './views/AboutPage';
import NotebookPage from './views/NotebookPage';
import SettingsPage from './views/SettingsPage.tsx';

const root = document.getElementById('root');

render(
	() => (
		<Router root={App}>
			<Route path="/" component={NotebookPage} />
			<Route path="/about" component={AboutPage} />
			<Route path="/settings" component={SettingsPage} />
		</Router>
	),
	root!
);
