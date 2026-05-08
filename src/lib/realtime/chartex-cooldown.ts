// Lưu thời điểm bị 429 vào memory (hoặc Redis nếu dùng multi-instance)
let chartexBlockedUntil: number | null = null
const COOLDOWN_MS = 30 * 60 * 1000 // 30 phút

export function markChartexBlocked() {
    chartexBlockedUntil = Date.now() + COOLDOWN_MS
    console.log("CHARTEX: Marked blocked until", new Date(chartexBlockedUntil).toISOString())
}

export function isChartexBlocked(): boolean {
    if (!chartexBlockedUntil) return false
    if (Date.now() > chartexBlockedUntil) {
        chartexBlockedUntil = null // reset sau cooldown
        return false
    }
    return true
}