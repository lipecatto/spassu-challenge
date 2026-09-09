import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { CommissionReport } from '../../types'
import { CommissionsTable } from './CommissionsTable'

describe('CommissionsTable', () => {
  it('renders one row per seller and the grand total', () => {
    const report: CommissionReport = {
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      sellers: [
        { seller_id: 1, seller_name: 'Diego Alves', total_commission: '2.79' },
        { seller_id: 2, seller_name: 'Elaine Rocha', total_commission: '33.96' },
      ],
      total_commission: '36.75',
    }

    render(<CommissionsTable report={report} />)

    expect(screen.getByText('Diego Alves')).toBeInTheDocument()
    expect(screen.getByText('Elaine Rocha')).toBeInTheDocument()
    expect(screen.getByText('R$ 36,75')).toBeInTheDocument()
  })

  it('shows an empty state when there are no sales in the period', () => {
    render(
      <CommissionsTable
        report={{ start_date: '2026-01-01', end_date: '2026-01-31', sellers: [], total_commission: '0.00' }}
      />,
    )

    expect(screen.getByText(/nenhuma venda no período/i)).toBeInTheDocument()
  })
})
