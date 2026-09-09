import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'

import { useClients, useProducts, useSellers } from '../../hooks/useReferenceData'
import type { Sale, SaleInput } from '../../types'
import { SaleItemsEditor, type EditableSaleItem } from './SaleItemsEditor'

interface SaleFormDialogProps {
  open: boolean
  sale: Sale | null
  onClose: () => void
  onSubmit: (input: SaleInput) => Promise<void>
}

function toDateTimeLocalValue(isoString: string): string {
  const date = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function emptyForm() {
  return {
    invoice_number: '',
    date_time: toDateTimeLocalValue(new Date().toISOString()),
    client: '' as number | '',
    seller: '' as number | '',
    items: [{ product: '', quantity: 1 }] as EditableSaleItem[],
  }
}

export function SaleFormDialog({ open, sale, onClose, onSubmit }: SaleFormDialogProps) {
  const { data: products = [] } = useProducts()
  const { data: clients = [] } = useClients()
  const { data: sellers = [] } = useSellers()

  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (sale) {
      setForm({
        invoice_number: sale.invoice_number,
        date_time: toDateTimeLocalValue(sale.date_time),
        client: sale.client,
        seller: sale.seller,
        items: sale.items.map((item) => ({ product: item.product, quantity: item.quantity })),
      })
    } else {
      setForm(emptyForm())
    }
  }, [open, sale])

  const isValid = useMemo(() => {
    return (
      form.invoice_number.trim() !== '' &&
      form.date_time !== '' &&
      form.client !== '' &&
      form.seller !== '' &&
      form.items.length > 0 &&
      form.items.every((item) => item.product !== '' && item.quantity > 0)
    )
  }, [form])

  async function handleSubmit() {
    if (!isValid) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        invoice_number: form.invoice_number.trim(),
        date_time: `${form.date_time}:00`,
        client: form.client as number,
        seller: form.seller as number,
        items: form.items.map((item) => ({ product: item.product as number, quantity: item.quantity })),
      })
      onClose()
    } catch (err) {
      setError('Não foi possível salvar a venda. Confira os dados e tente novamente.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{sale ? 'Editar venda' : 'Nova venda'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={6}>
            <TextField
              label="Nota fiscal"
              fullWidth
              value={form.invoice_number}
              onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Data/hora"
              type="datetime-local"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.date_time}
              onChange={(e) => setForm((f) => ({ ...f, date_time: e.target.value }))}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              select
              label="Cliente"
              fullWidth
              value={form.client}
              onChange={(e) => setForm((f) => ({ ...f, client: Number(e.target.value) }))}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={6}>
            <TextField
              select
              label="Vendedor"
              fullWidth
              value={form.seller}
              onChange={(e) => setForm((f) => ({ ...f, seller: Number(e.target.value) }))}
            >
              {sellers.map((seller) => (
                <MenuItem key={seller.id} value={seller.id}>
                  {seller.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Itens da venda
            </Typography>
            <SaleItemsEditor
              items={form.items}
              products={products}
              onChange={(items) => setForm((f) => ({ ...f, items }))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid || submitting}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
