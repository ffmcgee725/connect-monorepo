import { defineConfig } from 'tsup';
import pkg from './package.json';

const deps = Object.keys((pkg as any).dependencies || {});
const peerDeps = Object.keys((pkg as any).peerDependencies || {});
const external = [...deps, ...peerDeps];
const entryName = (pkg as any).name.replace('@metamask/', '');

export default defineConfig([
  {
    entry: { [entryName]: 'src/index.ts' },
    outDir: 'dist/browser/es',
    format: 'esm',
    platform: 'browser',
    bundle: true,
    clean: true,
    splitting: false,
    sourcemap: true,
    external,
    tsconfig: './tsconfig.json',
    esbuildOptions: (o) => {
      o.platform = 'browser';
      o.mainFields = ['browser', 'module', 'main'];
      o.conditions = ['browser'];
      o.outExtension = { '.js': '.mjs' };
    },
  },
  {
    entry: { index: 'src/index.ts' },
    outDir: 'dist/types',
    tsconfig: './tsconfig.types.json',
    dts: { only: true },
  },
]);
