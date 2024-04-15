import { RollupExecutorOptions } from '@nx/rollup/src/executors/rollup/schema';

export interface RollupExecutorSchema extends RollupExecutorOptions {
  name: string;
  additionalPeerDeps?: string[];
  inputFiles: string[];
}
