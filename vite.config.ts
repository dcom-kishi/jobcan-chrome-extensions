import { defineConfig } from 'vite'
import { crx, defineManifest } from '@crxjs/vite-plugin'

const manifest = defineManifest({
    manifest_version: 3,
    name: 'Jobcan Easy Man-hours Entry',
    version: '1.2.2',
    description:
        'It makes tracking the man-hours management page and man-hour entry easy.',
    icons: {
        '16': 'images/icon-16.png',
        '32': 'images/icon-32.png',
        '48': 'images/icon-48.png',
        '128': 'images/icon-128.png',
    },
    permissions: [
        'declarativeNetRequest',
        'declarativeNetRequestWithHostAccess',
        'storage',
        'tabs',
        'webRequest',
    ],
    host_permissions: ['https://ssl.jobcan.jp/*'],
    action: {
        default_popup: 'index.html',
    },
    background: {
        service_worker: 'src/background.ts',
    },
    content_scripts: [
        {
            matches: ['https://ssl.jobcan.jp/*'],
            js: ['src/content.ts'],
        },
    ],
})

export default defineConfig({
    plugins: [crx({ manifest })],
    publicDir: 'public',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        port: 5173,
        strictPort: true,
        hmr: {
            port: 5173,
        },
    },
})
