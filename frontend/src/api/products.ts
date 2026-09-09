import { apiClient } from './client'
import type { PaginatedResponse, Product } from '../types'

export async function listProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<PaginatedResponse<Product>>('/products/', {
    params: { page_size: 200 },
  })
  return data.results
}
