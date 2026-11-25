export const BASE_URL = "https://sindig.unesa.ac.id"
export const LMS_BASE_URL = "https://sindig-vokasi.unesa.ac.id"
const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36"

export function requestHeaders() {
    const cookie = process.env.UNESA_COOKIE
    if (!cookie) throw new Error("UNESA_COOKIE is required")
    return { "User-Agent": USER_AGENT, Cookie: cookie }
}

export async function getHome(): Promise<string> {
    const response = await fetch(BASE_URL, { headers: requestHeaders() })
    if (!response.ok) throw new Error(`Home request failed: ${response.status}`)
    return response.text()
}
