import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
	base: "./",
	plugins: [solid()],
	css: {
		preprocessorOptions: {
			scss: {
				api: "modern-compiler",
			},
		},
	},
	server: {
		port: 10101,
		proxy: {
			"/api": {
				target: "http://localhost:10102",
				changeOrigin: true,
			},
		},
	},
});
