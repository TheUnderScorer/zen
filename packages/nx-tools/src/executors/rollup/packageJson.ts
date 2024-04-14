import { ModuleFormat, RollupOptions } from 'rollup';
import { PackageJson } from 'nx/src/utils/package-json';
import { ExecutorContext } from 'nx/src/config/misc-interfaces';
import { DependentBuildableProjectNode } from '@nx/js/src/utils/buildable-libs-utils';
import * as path from 'path';
import { isDevDependency } from './deps';
import * as fs from 'fs';
import { logger } from 'nx/src/utils/logger';
import { RollupExecutorSchema } from './schema';

function resolveExportsFormat(format: ModuleFormat, fileName?: string) {
  switch (format) {
    case 'es':
    case 'esm': {
      if (fileName?.endsWith('.d.ts')) {
        return 'types';
      }

      return 'import';
    }

    case 'commonjs':
    case 'cjs': {
      return 'require';
    }

    default:
      return null;
  }
}

interface PackageExportsMetadata {
  types?: string;
  require?: string;
  import?: string;
}

export async function updatePackageJson(
  options: RollupExecutorSchema,
  rollupOptions: RollupOptions[],
  projectPackageJson: PackageJson,
  rootPackageJson: PackageJson,
  context: ExecutorContext,
  dependencies: DependentBuildableProjectNode[]
) {
  const exports = {} as Record<string, PackageExportsMetadata>;

  const result = {
    dependencies: {},
    peerDependencies: {},
    exports,
    ...projectPackageJson,
  };

  rollupOptions.forEach((option) => {
    const inputs = Array.isArray(option.input) ? option.input : [option.input];
    const outputs = Array.isArray(option.output)
      ? option.output
      : [option.output];

    inputs.forEach((input) => {
      const inputPath = path.parse(input as string);

      outputs.forEach((output) => {
        if (output && output.file && output.format) {
          const relativePath = path.relative(options.outputPath, output.file);
          const parsedPath = path.parse(relativePath);

          const mappedExports = outputs.reduce((acc, output) => {
            if (!output?.format) {
              return acc;
            }

            const filePath = `.${parsedPath.dir}/${parsedPath.base}`;

            const format = resolveExportsFormat(output.format, output.file);

            if (format === 'require') {
              result.main = filePath;
            }

            if (!format) {
              return acc;
            }

            return {
              ...acc,
              [format]: filePath,
            };
          }, {} as PackageExportsMetadata);

          const key = inputPath.name === 'index' ? '.' : `./${inputPath.name}`;

          if (exports[key]) {
            exports[key] = {
              ...exports[key],
              ...mappedExports,
            };
          } else {
            exports[key] = mappedExports;
          }
        }
      });
    });
  });

  const packageJsons = [rootPackageJson, projectPackageJson];

  for (const dep of dependencies) {
    switch (dep.node.type) {
      case 'npm':
        if (isDevDependency(dep.name, packageJsons)) {
          continue;
        }

        if (options.additionalPeerDeps?.includes(dep.name)) {
          result.peerDependencies[dep.name] = `^${dep.node.data.version}`;
          continue;
        }

        result.dependencies[dep.name] = `^${dep.node.data.version}`;
        break;

      case 'lib': {
        const libPackageJsonPath = path.join(
          process.cwd(),
          dep.node.data.root,
          'package.json'
        );
        const libPackageJson = fs.existsSync(libPackageJsonPath)
          ? await import(libPackageJsonPath)
          : undefined;

        if (!libPackageJson) {
          continue;
        }

        result.peerDependencies[dep.name] = `^${libPackageJson.version}`;
      }
    }
  }

  const packageJsonPath = path.join(options.outputPath, 'package.json');

  logger.info(`Writing package.json to ${packageJsonPath}...`);

  fs.writeFileSync(packageJsonPath, JSON.stringify(result, null, 2));

  logger.info(`Done writing package.json to ${packageJsonPath}.`);
}
