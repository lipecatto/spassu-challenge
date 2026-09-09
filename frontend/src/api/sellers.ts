import { apiClient } from './client'
import type { PaginatedResponse, Seller } from '../types'

export async function listSellers(): Promise<Seller[]> {
  const { data } = await apiClient.get<PaginatedResponse<Seller>>('/sellers/', {
    params: { page_size: 200 },
  })
  return data.results
}
