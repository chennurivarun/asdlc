import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

export interface StackReport {
  languages: string[];
  packageManager: string | null;
  testRunner: string | null;
  ci: string[];
  agentFiles: string[];
  sourceDirs: string[];
  fileCount: number;
  uncommitted: number | null;
  gitRepo: boolean;
}

export function detectStack(root: string): StackReport {
  const has = (p: string) => existsSync(join(root, p));
  const pkg = has('package.json')
    ? JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) : null;
  const deps = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };

  const languages: string[] = [];
  if (pkg) languages.push(has('tsconfig.json') ? 'TypeScript' : 'JavaScript');
  if (has('pyproject.toml') || has('requirements.txt')) languages.push('Python');
  if (has('go.mod')) languages.push('Go');
  if (has('Cargo.toml')) languages.push('Rust');

  const packageManager =
    has('pnpm-lock.yaml') ? 'pnpm' :
    has('yarn.lock') ? 'yarn' :
    has('package-lock.json') ? 'npm' :
    has('bun.lockb') || has('bun.lock') ? 'bun' : null;

  const testRunner =
    deps['vitest'] ? 'vitest' :
    deps['jest'] ? 'jest' :
    deps['mocha'] ? 'mocha' :
    has('pytest.ini') || has('pyproject.toml') ? null : null;

  const ci: string[] = [];
  if (has('.github/workflows')) ci.push('GitHub Actions');
  if (has('.gitlab-ci.yml')) ci.push('GitLab CI');
  if (has('.circleci')) ci.push('CircleCI');

  const agentFiles = ['AGENTS.md', 'CLAUDE.md', '.cursorrules', 'CODEOWNERS', '.github/CODEOWNERS']
    .filter(has);

  const sourceDirs = ['src', 'app', 'lib', 'packages'].filter((d) => has(d));

  let fileCount = 0;
  const count = (dir: string, depth: number): void => {
    if (depth > 6) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      if (e.isDirectory()) count(join(dir, e.name), depth + 1);
      else fileCount += 1;
    }
  };
  try { count(root, 0); } catch { /* unreadable areas don't crash detection */ }

  const gitRepo = has('.git');
  let uncommitted: number | null = null;
  if (gitRepo) {
    const res = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
    if (res.status === 0) uncommitted = res.stdout.split('\n').filter(Boolean).length;
  }

  return { languages, packageManager, testRunner, ci, agentFiles, sourceDirs, fileCount, uncommitted, gitRepo };
}
