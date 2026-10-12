export function parseStudyDate(value) {
  if (typeof value !== "string") {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const dateParts = value.split("-");
  const year = Number(dateParts[0]);
  const month = Number(dateParts[1]);
  const day = Number(dateParts[2]);

  if (year < 1000 || year > 9999) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  // Reject impossible dates, such as 31 February.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getRevisionDates(studyDate) {
  const date = parseStudyDate(studyDate);

  if (!date) {
    throw new Error("Invalid study date.");
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const oneWeek = new Date(year, month, day + 7);

  const oneMonth = new Date(year, month + 1, day);

  if (oneMonth.getDate() !== day) {
    oneMonth.setDate(0);
  }

  const threeMonths = new Date(year, month + 3, day);

  if (threeMonths.getDate() !== day) {
    threeMonths.setDate(0);
  }

  const sixMonths = new Date(year, month + 6, day);

  if (sixMonths.getDate() !== day) {
    sixMonths.setDate(0);
  }

  const oneYear = new Date(year + 1, month, day);

  if (oneYear.getDate() !== day) {
    oneYear.setDate(0);
  }

  return [oneWeek, oneMonth, threeMonths, sixMonths, oneYear];
}

export function getUpcomingRevisions(topics, currentDate = new Date()) {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const revisions = [];

  for (const topic of topics) {
    // Ignore unrelated or invalid stored records.
    if (
      !topic ||
      typeof topic.name !== "string" ||
      !topic.name.trim() ||
      !parseStudyDate(topic.date)
    ) {
      continue;
    }

    const revisionDates = getRevisionDates(topic.date);

    for (const revisionDate of revisionDates) {
      if (revisionDate < today) {
        continue;
      }

      revisions.push({
        name: topic.name,
        date: revisionDate,
      });
    }
  }

  revisions.sort((a, b) => a.date - b.date);

  return revisions;
}