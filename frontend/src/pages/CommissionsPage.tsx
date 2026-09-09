import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'

import { CommissionsFilter } from '../components/commissions/CommissionsFilter'
import { CommissionsTable } from '../components/commissions/CommissionsTable'
import { useCommissionReport } from '../hooks/useCommissions'
import type { CommissionReportParams } from '../api/commissions'

export function CommissionsPage() {
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [appliedParams, setAppliedParams] = useState<CommissionReportParams>({ start_date: startDate, end_date: endDate })

  const { data, isLoading, isError, isFetching } = useCommissionReport(appliedParams)

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Comissões
      </Typography>

      <CommissionsFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSubmit={() => setAppliedParams({ start_date: startDate, end_date: endDate })}
        disabled={isFetching}
      />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && <Alert severity="error">Não foi possível carregar o relatório de comissões.</Alert>}

      {data && <CommissionsTable report={data} />}
    </Box>
  )
}
