import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createSale, deleteSale, listSales, updateSale, type ListSalesParams } from '../api/sales'
import type { SaleInput } from '../types'

const salesKey = (params: ListSalesParams) => ['sales', params] as const

export function useSales(params: ListSalesParams) {
  return useQuery({ queryKey: salesKey(params), queryFn: () => listSales(params) })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaleInput) => createSale(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  })
}

export function useUpdateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SaleInput }) => updateSale(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  })
}

export function useDeleteSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteSale(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  })
}
