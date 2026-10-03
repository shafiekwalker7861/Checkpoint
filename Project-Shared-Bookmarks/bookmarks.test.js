import assert from "node:assert/strict";
import test from "node:test";
import { sortBookmarksNewestFirst } from "./bookmarks.js";

test("sorts newest first without changing the original array", () => {
  const oldest = { createdAt: "2026-10-01T10:00:00.000Z" };
  const newest = { createdAt: "2026-10-03T10:00:00.000Z" };
  const middle = { createdAt: "2026-10-02T10:00:00.000Z" };

  const original = [oldest, newest, middle];
  const result = sortBookmarksNewestFirst(original);

  assert.deepEqual(result, [newest, middle, oldest]);
  assert.deepEqual(original, [oldest, newest, middle]);
});

test("handles an empty bookmark array", () => {
  assert.deepEqual(sortBookmarksNewestFirst([]), []);
});