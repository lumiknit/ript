export const randomString = (): string => {
	return Math.random().toString(36).substring(2);
};

export const longRandomString = (): string => {
	return randomString() + randomString();
};
