import { Component } from 'solid-js';

import LocalSettingsEdit from '../components/settings/local/LocalSettingsEdit';

const SettingsPage: Component = () => {
	return (
		<div class="container">
			<LocalSettingsEdit />
		</div>
	);
};

export default SettingsPage;
