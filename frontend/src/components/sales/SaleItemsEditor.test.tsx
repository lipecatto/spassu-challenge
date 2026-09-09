import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Product } from '../../types'
import { SaleItemsEditor } from './SaleItemsEditor'

const products: Product[] = [
  { id: 1, code: 'CAN001', description: 'Caneta', unit_price: '2.50', commission_percentage: '2.00' },
  { id: 2, code: 'CAD001', description: 'Caderno', unit_price: '24.90', commission_percentage: '8.00' },
]

describe('SaleItemsEditor', () => {
  it('shows the estimated total for the selected items', () => {
    render(
      <SaleItemsEditor
        items={[{ product: 1, quantity: 3 }]}
        products={products}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText(/R\$\s*7,50/)).toBeInTheDocument()
  })

  it('adds a new empty row when clicking "Adicionar item"', async () => {
    const onChange = vi.fn()
    render(<SaleItemsEditor items={[{ product: 1, quantity: 1 }]} products={products} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: /adicionar item/i }))

    expect(onChange).toHaveBeenCalledWith([
      { product: 1, quantity: 1 },
      { product: '', quantity: 1 },
    ])
  })

  it('disables the remove button when there is only one item', () => {
    render(<SaleItemsEditor items={[{ product: 1, quantity: 1 }]} products={products} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: /remover item/i })).toBeDisabled()
  })

  it('removes a row when clicking the delete button', async () => {
    const onChange = vi.fn()
    render(
      <SaleItemsEditor
        items={[
          { product: 1, quantity: 1 },
          { product: 2, quantity: 2 },
        ]}
        products={products}
        onChange={onChange}
      />,
    )

    const removeButtons = screen.getAllByRole('button', { name: /remover item/i })
    await userEvent.click(removeButtons[0])

    expect(onChange).toHaveBeenCalledWith([{ product: 2, quantity: 2 }])
  })
})
