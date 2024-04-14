import { rollup, RollupBuild } from 'rollup';
import { ExecutorContext } from 'nx/src/config/misc-interfaces';
import invariant from 'tiny-invariant';
import { calculateProjectDependencies } from '@nx/js/src/utils/buildable-libs-utils';
import * as path from 'path';
import * as fs from 'fs';
import {
  NormalizedRollupExecutorOptions,
  normalizeRollupExecutorOptions,
} from '@nx/rollup/src/executors/rollup/lib/normalize';
import { updatePackageJson } from './packageJson';
import { makeExternal } from './external';
import { RollupExecutorSchema } from './schema';
import { buildRollupConfig } from './rollupConfig';

export default async function runExecutor(
  options: RollupExecutorSchema,
  context: ExecutorContext
) {
  const projectGraph = context.projectGraph?.nodes?.[context.projectName ?? ''];
  invariant(projectGraph, 'Project graph is required');

  const normalizedOptions = normalizeRollupExecutorOptions(
    options,
    context,
    projectGraph.data.sourceRoot ?? ''
  ) as NormalizedRollupExecutorOptions & RollupExecutorSchema;

  let error: Error | undefined;

  const bundles: RollupBuild[] = [];

  const packageJsonPath = path.join(projectGraph.data.root, 'package.json');
  const packageJson = fs.existsSync(packageJsonPath)
    ? await import(packageJsonPath).then((mod) => mod.default)
    : {};
  // eslint-disable-next-line @nx/enforce-module-boundaries
  const rootPackageJson = await import('../../../../../package.json');

  invariant(context.projectGraph, 'Project graph is required');
  invariant(context.projectName, 'Project name is required');
  invariant(context.targetName, 'Target name is required');
  invariant(projectGraph.data.sourceRoot, 'Source root is required');

  const { dependencies } = calculateProjectDependencies(
    context.projectGraph,
    context.root,
    context.projectName,
    context.targetName,
    context.configurationName ?? ''
  );

  const projectGraphDependencies =
    context.projectGraph.dependencies[context.projectName] ?? [];
  const npmDeps = projectGraphDependencies
    .filter((d) => d.target.startsWith('npm:'))
    .map((d) => d.target.slice(4));

  const rollupConfig = buildRollupConfig(
    normalizedOptions,
    context,
    projectGraph.data.sourceRoot,
    projectGraph.data.root,
    options.outputPath,
    packageJson
  );

  if (fs.existsSync(options.outputPath)) {
    fs.rmSync(options.outputPath, { recursive: true });
  }

  try {
    for (const configItem of rollupConfig) {
      const updatedConfig = {
        ...configItem,
        external: makeExternal(
          context,
          configItem,
          packageJson,
          dependencies,
          npmDeps
        ),
      };
      const bundle = await rollup(updatedConfig);

      bundles.push(bundle);

      const output = Array.isArray(configItem.output)
        ? configItem.output
        : [configItem.output];

      for (const outputItem of output) {
        if (outputItem) {
          await bundle.write(outputItem);
        }
      }
    }

    await updatePackageJson(
      normalizedOptions,
      rollupConfig,
      packageJson,
      rootPackageJson,
      context,
      dependencies
    );
  } catch (err) {
    error = err as Error;
  } finally {
    await Promise.all(
      bundles.map((bundle) => {
        return bundle.close();
      })
    );
  }

  if (error) {
    throw error;
  }

  return {
    success: true,
  };
}
