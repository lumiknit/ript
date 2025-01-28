/* @refresh reload */
import { Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';

import './index.scss';
import App from './App.tsx';
import { rootPath } from './env.ts';
import AboutPage from './views/AboutPage';
import ListPage from './views/ListPage.tsx';
import NotebookPage from './views/NotebookPage';
import SettingsPage from './views/SettingsPage.tsx';

const root = document.getElementById('root');

render(
	() => (
		<Router root={App}>
			<Route path={`${rootPath}/`} component={NotebookPage} />
			<Route path={`${rootPath}/notebooks`} component={ListPage} />
			<Route path={`${rootPath}/about`} component={AboutPage} />
			<Route path={`${rootPath}/settings`} component={SettingsPage} />
		</Router>
	),
	root!
);
