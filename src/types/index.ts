import type { z } from "zod"
import { mahasiswaSchema, matkulSchema, tugasSchema } from "./schema"

export type IMahasiswa = z.infer<typeof mahasiswaSchema>
export type IMatkul = z.infer<typeof matkulSchema>
export type ITugas = z.infer<typeof tugasSchema>
