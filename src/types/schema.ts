import z = require("zod");

export const mahasiswaSchema = z.object({
    nama: z.string(),
    angkatan: z.string(),
    prodi: z.string(),
    periode: z.string()
})

export const matkulSchema = z.object({
    nama: z.string(),
    dosen: z.string(),
    waktu: z.string(),
    kelas: z.string(),
    ruang: z.string(),
    sks: z.number(),
    progress: z.number()
})

export const deadlineStatusSchema = z.enum([
    'overdue',
    'today',
    'soon',
    'upcoming',
]);

export const deadlineComponentSchema = z.enum([
    'mod_assign',
    'mod_quiz',
    'mod_forum',
    'mod_workshop',
    'mod_lesson',
]);

export const deadlineEventTypeSchema = z.enum([
    'open',
    'due',
    'close',
]);

export const tugasSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    courseId: z.number().int().nonnegative(),
    courseName: z.string(),
    component: deadlineComponentSchema,
    eventType: deadlineEventTypeSchema,
    deadline: z.date(),
    deadlineUnix: z.number().int().positive(),
    url: z.string().url(),
    canSubmit: z.boolean(),
    actionName: z.string().optional(),
    iconAlt: z.string().optional(),
    status: deadlineStatusSchema,
    daysLeft: z.number().int(),
    countdown: z.string(),
});