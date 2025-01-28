/**
 * Convert ImageBitmap to base64 blob PNG
 */
export const bitmapToDataURL = (bitmap: ImageBitmap): Promise<string> => {
	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		return Promise.reject(new Error('Failed to create canvas context'));
	}
	ctx.drawImage(bitmap, 0, 0);
	return canvas
		.convertToBlob({ type: 'image/png' })
		.then((blob) => URL.createObjectURL(blob));
};

/**
 * Convert base64 blob PNG to ImageBitmap
 */
export const dataURLToBitmap = (url: string): Promise<ImageBitmap> => {
	const img = new Image();
	img.src = url;
	const canvas = new OffscreenCanvas(img.width, img.height);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		return Promise.reject(new Error('Failed to create canvas context'));
	}
	return new Promise((resolve, reject) => {
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			resolve(canvas.transferToImageBitmap());
		};
		img.onerror = (err) => {
			reject(err);
		};
	});
};
