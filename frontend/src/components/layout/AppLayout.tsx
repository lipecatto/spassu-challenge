import StorefrontIcon from '@mui/icons-material/Storefront'
import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Vendas', path: '/vendas' },
  { label: 'Comissões', path: '/comissoes' },
]

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()

  const currentTab = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.path ?? false

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <StorefrontIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="div" sx={{ mr: 4, fontWeight: 600 }}>
            Papelaria Comissões
          </Typography>
          <Tabs
            value={currentTab}
            onChange={(_, value: string) => navigate(value)}
            textColor="inherit"
            indicatorColor="secondary"
          >
            {NAV_ITEMS.map((item) => (
              <Tab key={item.path} label={item.label} value={item.path} />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  )
}
