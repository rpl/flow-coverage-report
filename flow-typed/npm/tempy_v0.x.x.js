// flow-typed signature: 26cb5563f33a7f9d88f78ddf7b33ad0b
// flow-typed version: 56b4548fe9/tempy_v0.x.x/flow_>=v0.47.x

type $npm$tempy$Options = {
  extension?: string,
  name?: string
};

declare module "tempy" {
  declare module.exports: {
    directory: () => string,
    file: (options?: $npm$tempy$Options) => string,
    root: string
  };
}
