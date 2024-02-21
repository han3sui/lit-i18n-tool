declare module "vscode" {
  export namespace window {
    export let outputChannel: any;
    export let statusBarItem: any;
  }
}

export interface Pos {
  startLine: number;
  endLine: number;
}

export interface Config {
  localesPaths: string;
  replace1: string;
  replace2: string;
  replace3: string;
}
