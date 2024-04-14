import { RollupExecutorOptions } from '@nx/rollup/src/executors/rollup/schema';

export interface RollupExecutorSchema extends RollupExecutorOptions {
  additionalPeerDeps?: string[];
  inputFiles: string[];
}
