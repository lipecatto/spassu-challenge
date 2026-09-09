import { apiClient } from './client'
import type { CommissionReport } from '../types'

export interface CommissionReportParams {
  start_date: string
  end_date: string
}

export async function getCommissionReport(params: CommissionReportParams): Promise<CommissionReport> {
  const { data } = await apiClient.get<CommissionReport>('/commissions/', { params })
  return data
}
