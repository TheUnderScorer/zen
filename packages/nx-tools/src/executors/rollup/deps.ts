import { PackageJson } from 'nx/src/utils/package-json';

export function isDevDependency(
  packageName: string,
  packageJsons: PackageJson[]
) {
  return packageJsons.some((packageJson) =>
    Object.keys(packageJson.devDependencies || {}).includes(packageName)
  );
}
