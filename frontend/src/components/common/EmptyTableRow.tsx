import { TableCell, TableRow } from '@mui/material'

interface EmptyTableRowProps {
  colSpan: number
  message: string
}

export function EmptyTableRow({ colSpan, message }: EmptyTableRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 4, color: 'text.secondary' }}>
        {message}
      </TableCell>
    </TableRow>
  )
}
