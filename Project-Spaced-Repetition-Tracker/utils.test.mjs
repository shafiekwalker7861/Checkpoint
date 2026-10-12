import assert from "node:assert/strict";
import test from "node:test";

import {
  getLocalDateString,
  getRevisionDates,
  getUpcomingRevisions,
  parseStudyDate,
} from "./utils.mjs";

function dateStrings(dates) {
  return dates.map((date) => getLocalDateString(date));
}

test("Calculates all five revision intervals", () => {
  const actual = dateStrings(getRevisionDates("2026-10-12"));

  assert.deepEqual(actual, [
    "2026-10-19",
    "2026-11-12",
    "2027-01-12",
    "2027-04-12",
    "2027-10-12",
  ]);
});

test("Clamps revisions to the last day of a shorter month", () => {
  const actual = dateStrings(getRevisionDates("2026-01-31"));

  assert.deepEqual(actual, [
    "2026-02-07",
    "2026-02-28",
    "2026-04-30",
    "2026-07-31",
    "2027-01-31",
  ]);
});

test("Handles a leap day and the following non-leap year", () => {
  const actual = dateStrings(getRevisionDates("2028-02-29"));

  assert.deepEqual(actual, [
    "2028-03-07",
    "2028-03-29",
    "2028-05-29",
    "2028-08-29",
    "2029-02-28",
  ]);
});

test("Rejects impossible study dates", () => {
  assert.equal(parseStudyDate("2026-02-31"), null);
  assert.equal(parseStudyDate("2026-13-01"), null);
  assert.equal(parseStudyDate(""), null);

  assert.throws(
    () => getRevisionDates("2026-02-31"),
    /Invalid study date/
  );
});

test("Keeps today's revisions and removes past revisions", () => {
  const topics = [{ name: "Arrays", date: "2026-10-05" }];

  // Afternoon must not exclude today's midnight revision.
  const today = new Date(2026, 9, 12, 18, 30);

  const revisions = getUpcomingRevisions(topics, today);

  assert.equal(revisions.length, 5);
  assert.equal(getLocalDateString(revisions[0].date), "2026-10-12");

  const tomorrow = new Date(2026, 9, 13);
  const laterRevisions = getUpcomingRevisions(topics, tomorrow);

  assert.equal(laterRevisions.length, 4);
  assert.equal(
    getLocalDateString(laterRevisions[0].date),
    "2026-11-05"
  );
});

test("Sorts across topics without changing the input", () => {
  const topics = [
    { name: "Later topic", date: "2026-10-10" },
    { name: "Earlier topic", date: "2026-10-05" },
  ];

  const originalTopics = structuredClone(topics);
  const today = new Date(2026, 9, 12);

  const revisions = getUpcomingRevisions(topics, today);

  assert.equal(revisions[0].name, "Earlier topic");
  assert.equal(revisions[1].name, "Later topic");

  for (let index = 1; index < revisions.length; index++) {
    assert.ok(revisions[index - 1].date <= revisions[index].date);
  }

  assert.deepEqual(topics, originalTopics);
});

test("Handles empty data and unrelated bookmark records", () => {
  const today = new Date(2026, 9, 12);

  assert.deepEqual(getUpcomingRevisions([], today), []);

  assert.deepEqual(
    getUpcomingRevisions(
      [{ title: "Old bookmark", url: "https://example.com" }],
      today
    ),
    []
  );
});