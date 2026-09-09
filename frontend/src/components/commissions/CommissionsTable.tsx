import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import type { CommissionReport } from '../../types'
import { formatCurrency } from '../../utils/format'

export function CommissionsTable({ report }: { report: CommissionReport }) {
  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vendedor</TableCell>
              <TableCell align="right">Comissão a pagar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.sellers.map((seller) => (
              <TableRow key={seller.seller_id} hover>
                <TableCell>{seller.seller_name}</TableCell>
                <TableCell align="right">{formatCurrency(seller.total_commission)}</TableCell>
              </TableRow>
            ))}
            {report.sellers.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhuma venda no período selecionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>
                <Typography fontWeight={600}>Total geral</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight={600}>{formatCurrency(report.total_commission)}</Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  )
}
