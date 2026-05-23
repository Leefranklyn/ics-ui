import { AccessEvent } from '@/types';

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDateTime(isoString: string): string {
  return `${formatDate(isoString)} ${formatTime(isoString)}`;
}

export function calculateDurationMins(entryTime: string, exitTime: string): number {
  const entry = new Date(entryTime).getTime();
  const exit = new Date(exitTime).getTime();
  return Math.round((exit - entry) / 60000);
}

export function matchStudentEvents(events: AccessEvent[]) {
  // basic matching of entry and exit by course
  // assuming sorted by timestamp asc
  const entries: Record<string, AccessEvent> = {};
  const matched = [];

  for (const event of events) {
    if (event.event_type === 'entry') {
      if (event.course_id) {
        entries[event.course_id] = event;
      }
    } else if (event.event_type === 'exit') {
      if (event.course_id && entries[event.course_id]) {
        const entry = entries[event.course_id];
        matched.push({
          courseCode: event.course_code || '',
          courseName: event.course_name || '',
          date: formatDate(entry.timestamp),
          checkIn: formatTime(entry.timestamp),
          checkOut: formatTime(event.timestamp),
          duration: calculateDurationMins(entry.timestamp, event.timestamp)
        });
        delete entries[event.course_id];
      }
    }
  }

  // Check unmatched entries
  for (const courseId in entries) {
    const entry = entries[courseId];
    matched.push({
      courseCode: entry.course_code || '',
      courseName: entry.course_name || '',
      date: formatDate(entry.timestamp),
      checkIn: formatTime(entry.timestamp),
      checkOut: 'Still in class',
      duration: 0
    });
  }

  return matched;
}
