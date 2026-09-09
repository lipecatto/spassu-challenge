import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
} from '@mui/material'

import type { Sale } from '../../types'
import { formatCurrency, formatDateTime } from '../../utils/format'

interface SalesTableProps {
  sales: Sale[]
  count: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onEdit: (sale: Sale) => void
  onDelete: (sale: Sale) => void
}

export function SalesTable({ sales, count, page, pageSize, onPageChange, onEdit, onDelete }: SalesTableProps) {
  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nota fiscal</TableCell>
              <TableCell>Data/hora</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Vendedor</TableCell>
              <TableCell align="right">Valor total</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id} hover>
                <TableCell>{sale.invoice_number}</TableCell>
                <TableCell>{formatDateTime(sale.date_time)}</TableCell>
                <TableCell>{sale.client_name}</TableCell>
                <TableCell>{sale.seller_name}</TableCell>
                <TableCell align="right">{formatCurrency(sale.total_amount)}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="Editar venda" size="small" onClick={() => onEdit(sale)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton aria-label="Excluir venda" size="small" onClick={() => onDelete(sale)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhuma venda registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[pageSize]}
        labelRowsPerPage=""
      />
    </Paper>
  )
}
