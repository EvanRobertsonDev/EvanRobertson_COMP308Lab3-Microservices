import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
//
export default defineConfig({
plugins: [
react(),
federation({
name: 'shellApp',
remotes: {
userApp: 'http://localhost:3001/assets/remoteEntry.js',
vitalsignsApp: 'http://localhost:3002/assets/remoteEntry.js',
},
shared: ['react', 'react-dom', '@apollo/client', 'graphql'],
}),
],
});