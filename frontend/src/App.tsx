import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'

import { AppLayout } from './components/layout/AppLayout'
import { CommissionsPage } from './pages/CommissionsPage'
import { SalesPage } from './pages/SalesPage'
import { theme } from './theme'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/vendas" replace />} />
              <Route path="/vendas" element={<SalesPage />} />
              <Route path="/comissoes" element={<CommissionsPage />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
