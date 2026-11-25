import { Hono } from "hono"
import { extractLms, extractMahasiswa, extractMatkul, extractTugas } from "./index"

const app = new Hono()

app.get("/api/health", c => c.json({ status: "ok" }))
app.get("/api/mahasiswa", async c => c.json(await extractMahasiswa()))
app.get("/api/matkul", async c => c.json(await extractMatkul()))
app.get("/api/tugas", async c => c.json(await extractTugas()))
app.get("/api/lms/:courseId", async c => {
    const { courseId } = c.req.param()
    if (!/^\d+$/.test(courseId)) return c.json({ error: "courseId must be numeric" }, 400)
    return c.json(await extractLms(courseId))
})

app.onError((error, c) => {
    console.error(error)
    return c.json({ error: "Internal Server Error" }, 500)
})

export default app
