import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  installPackagesTask,
  joinPathFragments,
  Tree,
  logger,
} from '@nx/devkit';
import { LibraryGeneratorOptions } from './schema';
import * as path from 'node:path';
import { addTsConfigPath } from '@nx/js';

export default async function(tree: Tree, schema: LibraryGeneratorOptions) {
  const libraryRoot =
    path.join(
      'packages',
      schema.name
    );
  const importPath = `@theunderscorer/${schema.name}`

  logger.info(`Creating library ${schema.name} in ${libraryRoot}`);

  addProjectConfiguration(
    tree,
    schema.name,
    {
      name: schema.name,
      root: libraryRoot,
      targets: {
        build: {
          executor: 'nx-tools:rollup',
          outputs: [
            '{options.outputPath}'
          ],
          options: {
            outputPath: `dist/packages/${schema.name}`,
            inputFiles: [
              'index.ts'
            ]
          }
        }
      }

    },
  );

  generateFiles(
    tree, // the virtual file system
    joinPathFragments(__dirname, './files'), // path to the file templates
    libraryRoot, // destination path of the files
    schema // config object to replace variable in file templates,
  );

  addTsConfigPath(
    tree,
    importPath,
    [
      path.join(
        libraryRoot,
        'src',
        'index.ts'
      )
    ]
  )

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
  };
}
