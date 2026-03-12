const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateStreak } = require('../server');

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

test('calculateStreak returns 0 when no completion for today', () => {
  assert.equal(calculateStreak([dateOffset(-1)]), 0);
});

test('calculateStreak counts consecutive completion days including today', () => {
  const completions = [dateOffset(-2), dateOffset(-1), dateOffset(0)];
  assert.equal(calculateStreak(completions), 3);
});
