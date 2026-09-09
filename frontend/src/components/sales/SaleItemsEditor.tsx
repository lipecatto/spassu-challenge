import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import type { Product } from '../../types'
import { formatCurrency } from '../../utils/format'

export interface EditableSaleItem {
  product: number | ''
  quantity: number
}

interface SaleItemsEditorProps {
  items: EditableSaleItem[]
  products: Product[]
  onChange: (items: EditableSaleItem[]) => void
}

export function SaleItemsEditor({ items, products, onChange }: SaleItemsEditorProps) {
  const productById = new Map(products.map((product) => [product.id, product]))

  function updateItem(index: number, patch: Partial<EditableSaleItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  function addItem() {
    onChange([...items, { product: '', quantity: 1 }])
  }

  const estimatedTotal = items.reduce((sum, item) => {
    const product = item.product ? productById.get(item.product) : undefined
    if (!product) return sum
    return sum + Number(product.unit_price) * item.quantity
  }, 0)

  return (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Produto</TableCell>
            <TableCell width={120}>Quantidade</TableCell>
            <TableCell width={48} />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={item.product}
                  onChange={(e) => updateItem(index, { product: Number(e.target.value) })}
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.code} - {product.description} ({formatCurrency(product.unit_price)})
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { min: 1 } }}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  aria-label="Remover item"
                  size="small"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button startIcon={<AddIcon />} onClick={addItem} size="small" sx={{ mt: 1 }}>
        Adicionar item
      </Button>

      <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
        Valor total estimado: <strong>{formatCurrency(estimatedTotal)}</strong>
      </Typography>
    </Box>
  )
}
