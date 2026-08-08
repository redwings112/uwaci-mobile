#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const allowedPattern = /^(feature|fix|chore|refactor|docs|test|perf|ci)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateBranchName(branch) {
  if (branch === 'main' || branch === 'dev') {
    return {
      valid: false,
      message: `Direct development on protected branch '${branch}' is not allowed.`,
    };
  }
  if (!allowedPattern.test(branch)) {
    return {
      valid: false,
      message: `Branch '${branch}' is invalid. Use an approved prefix and kebab-case, for example: feature/voice-recorder.`,
    };
  }
  return { valid: true, message: `Branch '${branch}' follows the UWACI branch policy.` };
}

export function currentBranch() {
  return execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
}

function run() {
  const branch = process.env.BRANCH_NAME_OVERRIDE?.trim() || currentBranch();
  const result = validateBranchName(branch);
  if (!result.valid) {
    console.error(
      `ERROR:\n${result.message}\n\nCreate a task branch from dev:\ngit checkout dev\ngit pull origin dev\ngit checkout -b feature/<task-name>`,
    );
    process.exitCode = 1;
    return;
  }
  console.log(result.message);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) run();
