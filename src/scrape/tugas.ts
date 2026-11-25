import type { ITugas } from "../types"
import { getEvent } from "./event"

const DEADLINE_EVENTS: Record<string, string[]> = {
    mod_assign: ['open', 'due', 'close'],
    mod_quiz: ['open', 'close'],
    mod_forum: ['open', 'close'],
    mod_workshop: ['open', 'close'],
    mod_lesson: ['open', 'close'],
};

function startOfDayWIB(d: Date): Date {
    const wib = new Date(d.getTime() + 7 * 3600 * 1000);
    return new Date(Date.UTC(
        wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()
    ) - 7 * 3600 * 1000);
}

function formatCountdown(deadlineUnix: number, nowMs = Date.now()): string {
    const diff = deadlineUnix * 1000 - nowMs;
    const abs = Math.abs(diff);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const mins = Math.floor((abs % 3600000) / 60000);
    if (diff < 0) return `Terlewat ${days}h ${hours}j lalu`;
    if (days > 0) return `${days} hari ${hours} jam lagi`;
    if (hours > 0) return `${hours} jam ${mins} menit lagi`;
    return `${mins} menit lagi`;
}

export function parseDeadlines(resp: any, nowMs = Date.now()): ITugas[] {
    const now = Math.floor(nowMs / 1000);
    const todayStart = Math.floor(startOfDayWIB(new Date(nowMs)).getTime() / 1000);
    const tasks: ITugas[] = [];
    const data = resp[0].data;

    for (const week of data.weeks) {
        for (const day of week.days) {
            for (const ev of day.events) {
                const allowed = DEADLINE_EVENTS[ev.component];
                if (!allowed) continue
                if (!allowed.includes(ev.eventtype)) continue;

                const ts = ev.timestart;
                const daysLeft = Math.ceil((ts - now) / 86400);
                let status: ITugas['status'];
                if (ts < now) status = 'overdue';
                else if (ts < todayStart + 86400) status = 'today';
                else if (daysLeft <= 3) status = 'soon';
                else status = 'upcoming';

                tasks.push({
                    id: ev.id,
                    name: ev.name,
                    courseId: ev.course?.id ?? 0,
                    courseName: ev.course?.fullname ?? '',
                    component: ev.component,
                    eventType: ev.eventtype,
                    deadline: new Date(ts * 1000),
                    deadlineUnix: ts,
                    url: ev.url,
                    canSubmit: ev.action?.actionable === true,
                    actionName: ev.action?.name,
                    iconAlt: ev.icon?.alttext,
                    status,
                    daysLeft,
                    countdown: formatCountdown(ts, nowMs),
                });
            }
        }
    }

    return tasks.sort((a, b) => a.deadlineUnix - b.deadlineUnix);
}

export async function extractTugas() {
    return parseDeadlines(await getEvent())
}
