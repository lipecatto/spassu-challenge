export interface Product {
  id: number
  code: string
  description: string
  unit_price: string
  commission_percentage: string
}

export interface Client {
  id: number
  name: string
  email: string
  phone: string
}

export interface Seller {
  id: number
  name: string
  email: string
  phone: string
}

export interface SaleItem {
  id?: number
  product: number
  product_code?: string
  product_description?: string
  quantity: number
  unit_price?: string
  commission_percentage?: string
  total_amount?: string
  commission_amount?: string
}

export interface Sale {
  id: number
  invoice_number: string
  date_time: string
  client: number
  client_name?: string
  seller: number
  seller_name?: string
  items: SaleItem[]
  total_amount: string
  total_commission: string
}

export type SaleInput = Omit<Sale, 'id' | 'client_name' | 'seller_name' | 'total_amount' | 'total_commission'>

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface SellerCommission {
  seller_id: number
  seller_name: string
  total_commission: string
}

export interface CommissionReport {
  start_date: string
  end_date: string
  sellers: SellerCommission[]
  total_commission: string
}
