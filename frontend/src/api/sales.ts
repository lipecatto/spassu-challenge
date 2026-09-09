import { apiClient } from './client'
import type { PaginatedResponse, Sale, SaleInput } from '../types'

export interface ListSalesParams {
  page?: number
  ordering?: string
}

export async function listSales(params: ListSalesParams = {}): Promise<PaginatedResponse<Sale>> {
  const { data } = await apiClient.get<PaginatedResponse<Sale>>('/sales/', {
    params: { ordering: '-date_time', ...params },
  })
  return data
}

export async function createSale(input: SaleInput): Promise<Sale> {
  const { data } = await apiClient.post<Sale>('/sales/', input)
  return data
}

export async function updateSale(id: number, input: SaleInput): Promise<Sale> {
  const { data } = await apiClient.put<Sale>(`/sales/${id}/`, input)
  return data
}

export async function deleteSale(id: number): Promise<void> {
  await apiClient.delete(`/sales/${id}/`)
}
