import AddIcon from '@mui/icons-material/Add'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useState } from 'react'

import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { SaleFormDialog } from '../components/sales/SaleFormDialog'
import { SalesTable } from '../components/sales/SalesTable'
import { useCreateSale, useDeleteSale, useSales, useUpdateSale } from '../hooks/useSales'
import type { Sale } from '../types'

const PAGE_SIZE = 20

export function SalesPage() {
  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null)

  const { data, isLoading, isError } = useSales({ page: page + 1 })
  const createSale = useCreateSale()
  const updateSale = useUpdateSale()
  const deleteSale = useDeleteSale()

  function openCreateForm() {
    setEditingSale(null)
    setFormOpen(true)
  }

  function openEditForm(sale: Sale) {
    setEditingSale(sale)
    setFormOpen(true)
  }

  async function handleSubmit(input: Parameters<typeof createSale.mutateAsync>[0]) {
    if (editingSale) {
      await updateSale.mutateAsync({ id: editingSale.id, input })
    } else {
      await createSale.mutateAsync(input)
    }
  }

  async function handleConfirmDelete() {
    if (!deletingSale) return
    await deleteSale.mutateAsync(deletingSale.id)
    setDeletingSale(null)
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Vendas
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateForm}>
          Nova venda
        </Button>
      </Stack>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && <Alert severity="error">Não foi possível carregar as vendas.</Alert>}

      {data && (
        <SalesTable
          sales={data.results}
          count={data.count}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          onEdit={openEditForm}
          onDelete={setDeletingSale}
        />
      )}

      <SaleFormDialog
        open={formOpen}
        sale={editingSale}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deletingSale !== null}
        title="Excluir venda"
        description={`Tem certeza que deseja excluir a nota fiscal ${deletingSale?.invoice_number}? Essa ação não pode ser desfeita.`}
        loading={deleteSale.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingSale(null)}
      />
    </Box>
  )
}
