export function parseAmount(label: string): number {
    return Number(label.replace(/[^0-9.]/g, ''));
}

export function toCents(amount: number): number {
    return Math.round(amount * 100);
}