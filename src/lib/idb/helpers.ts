import { SimpleIDB } from './client';

const settingsIDB = new SimpleIDB('local', 'settings', 1);

export const settingsTx = async <T>() => {
	return await settingsIDB.transaction<T>('readwrite');
};

const notebooksIDB = new SimpleIDB('local-nb', 'notebooks', 1);

export const notebooksTx = async <T>() => {
	return await notebooksIDB.transaction<T>('readwrite');
};
