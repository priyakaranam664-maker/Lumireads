import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default ({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    const apiTarget = env.VITE_API_URL || process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:5001';

    return defineConfig({
        plugins: [
            react(),
            nodePolyfills({
                protocolImports: true,
            }),
        ],
        resolve: {
            alias: {
                crypto: 'crypto-browserify',
                stream: 'stream-browserify',
                util: 'util',
                buffer: 'buffer',
                process: 'process/browser',
                assert: 'assert',
            },
        },
        define: {
            global: 'globalThis',
        },
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: apiTarget,
                    changeOrigin: true,
                },
            },
        },
        build: {
            outDir: 'dist',
            sourcemap: false,
        },
    });
};
