import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();

function readJson(relativePath) {
  const absolutePath = path.join(workspaceRoot, relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function run() {
  const packageJson = readJson('package.json');
  const appJson = readJson('app.json');
  const easJson = readJson('eas.json');
  const envExample = fs.readFileSync(path.join(workspaceRoot, '.env.example'), 'utf8');

  const expoConfig = appJson.expo;
  const ios = expoConfig.ios ?? {};
  const android = expoConfig.android ?? {};

  assert(
    packageJson.version === expoConfig.version,
    `Version mismatch: package.json(${packageJson.version}) != app.json(${expoConfig.version})`
  );

  assert(
    typeof ios.buildNumber === 'string' && ios.buildNumber.length > 0,
    'Missing ios.buildNumber in app.json'
  );

  assert(
    Number.isInteger(android.versionCode) && android.versionCode > 0,
    'Missing or invalid android.versionCode in app.json'
  );

  assert(
    Array.isArray(android.intentFilters) && android.intentFilters.length > 0,
    'Missing android.intentFilters for deep link handling'
  );

  assert(
    easJson?.build?.production && easJson?.build?.['production-android'],
    'Missing production profiles in eas.json for iOS or Android'
  );

  assert(
    packageJson.scripts?.['build:ios:production'] &&
      packageJson.scripts?.['submit:ios:production'] &&
      packageJson.scripts?.['build:android:production'] &&
      packageJson.scripts?.['submit:android:production'],
    'Missing one or more release scripts in package.json'
  );

  assert(
    envExample.includes('your-project-id') &&
      envExample.includes('your-anon-or-publishable-key'),
    '.env.example appears to contain non-placeholder values'
  );

  console.log('Release preflight checks passed.');
  console.log(`Version: ${expoConfig.version}`);
  console.log(`iOS buildNumber: ${ios.buildNumber}`);
  console.log(`Android versionCode: ${android.versionCode}`);
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown preflight failure';
  console.error(`Release preflight failed: ${message}`);
  process.exit(1);
}
