export function getYearMonthDay(date: Date): {
    year: string
    month: string
    day: string
} {
    const formatter = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Tokyo',
    })

    const parts = formatter.formatToParts(date)
    const year = parts.find(part => part.type === 'year')?.value || ''
    const month = parts.find(part => part.type === 'month')?.value || ''
    const day = parts.find(part => part.type === 'day')?.value || ''

    return { year, month, day }
}

export function convertToDate(epoch: number): Date {
    return new Date(epoch * 1000)
}

export function adjustYearMonthByClosingDay(
    year: string,
    mouth: string,
    day: string,
): { year: string; mouth: string } {
    const date = new Date(parseInt(year), parseInt(mouth) - 1, 1)
    const closingDay = 20
    const isNextMouth = parseInt(day) > closingDay
    if (isNextMouth) {
        date.setMonth(date.getMonth() + 1)
    }
    return {
        year: date.getFullYear().toString(),
        mouth: (date.getMonth() + 1).toString(),
    }
}
