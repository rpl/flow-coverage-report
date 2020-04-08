// flow-typed signature: 9c00839fc21beedd52e40f15ef3343f2
// flow-typed version: <<STUB>>/mkdirp_v^1.0.4/flow_v0.72.0

declare module 'mkdirp' {
  declare type Options = number | { mode?: number; fs?: mixed };

  declare type Callback = (err: ?Error, path: ?string) => void;

  declare module.exports: {
    (path: string, options?: Options): Promise<?string>;
    sync(path: string, options?: Options): void;
  };
}
