export function cleanText(s: string | undefined | null): string {
    return (s ?? '').replace(/\s+/g, ' ').trim();
}

export function parseNumber(s: string): number {
    const n = parseFloat(s.replace('%', '').replace(',', '.').trim());
    return Number.isNaN(n) ? 0 : n;
}