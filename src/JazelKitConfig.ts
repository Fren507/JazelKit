// src/JazelKitConfig.ts
import type { Loader } from "esbuild";

export interface JazelKitConfig {
  port?: number;
  root?: string; // default: ./src
  assets?: string; // default: ./public
  build?: {
    compile?: boolean; // default: true
    minify?: boolean; // default: true
    sourcemap?: boolean; // default: dev ? true : false
    loaderOptions?: {
      [ext: string]: Loader;
    }; // default: {}
  };
  dev?: boolean; // default: false
  title?: string; // default: "JazelKit App"
  paths?: {
    [key: string]: string;
  }; // default: {}
}
