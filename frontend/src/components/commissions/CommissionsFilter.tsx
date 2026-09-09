import { Button, Paper, Stack, TextField } from '@mui/material'

interface CommissionsFilterProps {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function CommissionsFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
  disabled,
}: CommissionsFilterProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <TextField
          label="Data inicial"
          type="date"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
        <TextField
          label="Data final"
          type="date"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={disabled || !startDate || !endDate}
        >
          Consultar
        </Button>
      </Stack>
    </Paper>
  )
}
