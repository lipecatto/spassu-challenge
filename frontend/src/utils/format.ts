const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function formatCurrency(value: string | number): string {
  return currencyFormatter.format(Number(value))
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value))
}
