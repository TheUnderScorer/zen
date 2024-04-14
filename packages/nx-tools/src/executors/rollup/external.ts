import { ExecutorContext } from 'nx/src/config/misc-interfaces';
import { RollupOptions } from 'rollup';
import { PackageJson } from 'nx/src/utils/package-json';
import { DependentBuildableProjectNode } from '@nx/js/src/utils/buildable-libs-utils';
import invariant from 'tiny-invariant';

export function makeExternal(
  context: ExecutorContext,
  rollupOptions: RollupOptions,
  projectPackageJson: PackageJson,
  dependencies: DependentBuildableProjectNode[],
  npmDeps: string[]
) {
  const { projectGraph, projectName, targetName } = context;

  invariant(projectGraph, 'Project graph is required');
  invariant(projectName, 'Project name is required');
  invariant(targetName, 'Target name is required');

  const external = Array.isArray(rollupOptions.external)
    ? rollupOptions.external
    : [];

  const mappedDeps = dependencies.map((d) => d.name) as Array<string | RegExp>;
  const externalPackages = mappedDeps
    .concat(external)
    .concat(Object.keys(projectPackageJson.dependencies || {}));

  return (id: string) => {
    return (
      externalPackages.some(
        (name) => id === name || id.startsWith(`${name}/`)
      ) || npmDeps.some((name) => id === name || id.startsWith(`${name}/`))
    );
  };
}
