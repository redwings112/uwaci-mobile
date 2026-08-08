import assert from 'node:assert/strict';
import test from 'node:test';

import { validateBranchName } from './validate-branch.mjs';

test('rejects protected branches', () => {
  assert.equal(validateBranchName('main').valid, false);
  assert.equal(validateBranchName('dev').valid, false);
});

test('accepts approved prefixes with kebab-case names', () => {
  assert.equal(validateBranchName('feature/voice-recorder').valid, true);
  assert.equal(validateBranchName('chore/mobile-foundation').valid, true);
});

test('rejects unknown prefixes and malformed names', () => {
  assert.equal(validateBranchName('build/mobile-foundation').valid, false);
  assert.equal(validateBranchName('feature/Voice_Recorder').valid, false);
  assert.equal(validateBranchName('feature/voice--recorder').valid, false);
});
