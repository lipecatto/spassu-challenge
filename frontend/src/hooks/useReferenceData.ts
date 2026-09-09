import { useQuery } from '@tanstack/react-query'

import { listClients } from '../api/clients'
import { listProducts } from '../api/products'
import { listSellers } from '../api/sellers'

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: listProducts })
}

export function useClients() {
  return useQuery({ queryKey: ['clients'], queryFn: listClients })
}

export function useSellers() {
  return useQuery({ queryKey: ['sellers'], queryFn: listSellers })
}
