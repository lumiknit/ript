import { createStore, StoreSetter } from 'solid-js/store';
import toast from 'solid-toast';

import { settingsTx } from './lib/idb';
import { NotebookState } from './lib/notebook_state';
import { fillLocalSettings, LocalSettings } from './lib/settings';

type GlobalStore = {
	/**
	 * Current open notebook state.
	 */
	notebookState: NotebookState;

	/**
	 * Local (browser-based) settings.
	 */
	localSettings?: LocalSettings;
};

/**
 * Global store for the application.
 */
export const [store, setStore] = createStore<GlobalStore>({
	notebookState: new NotebookState(),
});

export const getLocalSettings = () => store.localSettings;
export const setLocalSettings = (
	v: StoreSetter<LocalSettings | undefined, ['localSettings']>
) => {
	setStore('localSettings', v);
	const settings = getLocalSettings();
	if (!settings) return;
	console.log('[Store] Saving local settings');
	settingsTx<LocalSettings>().then((tx) =>
		tx.put({
			...settings,
			_id: 'current',
		})
	);
};

// Initialize the store.
(async () => {
	// Load local settings.
	(async () => {
		console.log('[Store] Loading local settings');
		try {
			const s = await settingsTx<LocalSettings>();
			const v = await s.get('current');
			setStore('localSettings', fillLocalSettings(v ?? {}));
		} catch (e) {
			toast.error('Failed to load local settings');
			console.error('Failed to load local settings', e);
		}
	})();
	// Done
})();
