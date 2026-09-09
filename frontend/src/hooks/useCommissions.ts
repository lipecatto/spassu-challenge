import { useQuery } from '@tanstack/react-query'

import { getCommissionReport, type CommissionReportParams } from '../api/commissions'

export function useCommissionReport(params: CommissionReportParams | null) {
  return useQuery({
    queryKey: ['commissions', params],
    queryFn: () => getCommissionReport(params as CommissionReportParams),
    enabled: params !== null,
  })
}
