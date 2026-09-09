import { apiClient } from './client'
import type { Client, PaginatedResponse } from '../types'

export async function listClients(): Promise<Client[]> {
  const { data } = await apiClient.get<PaginatedResponse<Client>>('/clients/', {
    params: { page_size: 200 },
  })
  return data.results
}
