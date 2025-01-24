import { SimpleIDB } from './client';

const settingsIDB = new SimpleIDB('local', 'settings', 1);

export const settingsTx = async <T>() => {
	return await settingsIDB.transaction<T>('readwrite');
};

const fileIDB = new SimpleIDB('local', 'files', 1);

export const fileTx = async <T>() => {
	return await fileIDB.transaction<T>('readwrite');
};
