# Spassu Code Challenge - Papelaria

Sistema de registro de vendas e cálculo de comissão de vendedores para uma
papelaria. Backend em Django/DRF e frontend em React/TypeScript.

## Sumário

- [Stack e pré-requisitos](#stack-e-pré-requisitos)
- [Como rodar](#como-rodar)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Regra de negócio: comissão](#regra-de-negócio-comissão)
- [API](#api)
- [Testes](#testes)
- [Decisões de design](#decisões-de-design)
- [O que eu faria a seguir](#o-que-eu-faria-a-seguir)

## Stack e pré-requisitos

| Camada   | Tecnologia                                                        | Versão usada no desenvolvimento |
| -------- | ------------------------------------------------------------------ | -------------------------------- |
| Backend  | Python, Django, Django REST Framework, django-filter, django-cors-headers | Python 3.13, Django 6.1          |
| Frontend | Node.js, React, TypeScript, Vite, Material UI, React Router, TanStack Query | Node 20+ (testado com Node 25)   |
| Banco    | SQLite (arquivo local, zero configuração)                          | -                                 |

## Como rodar

### 1. Backend (Django)

```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows (git bash). No cmd/PowerShell: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env           # ajuste se necessário

python manage.py migrate
python manage.py createsuperuser   # para acessar o /admin
python manage.py seed_data         # opcional: popula produtos/clientes/vendedores/vendas de exemplo

python manage.py runserver 8000
```

A API sobe em `http://localhost:8000/api/` e o admin em `http://localhost:8000/admin/`.

### 2. Frontend (React)

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env   # aponta para http://localhost:8000/api por padrão
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

> O backend já vem com CORS liberado para `http://localhost:5173`
> (configurável via `CORS_ALLOWED_ORIGINS` no `.env` do backend).

## Estrutura do projeto

```
spassu-challenge/
├── backend/            # Django + DRF
│   ├── config/         # settings, urls, wsgi/asgi
│   └── sales/          # app de domínio: models, admin, api, testes
└── frontend/           # React + TypeScript (Vite)
    └── src/
        ├── api/         # camada HTTP (axios) por entidade
        ├── hooks/       # React Query: cache/estado de servidor
        ├── components/  # componentes de UI (layout, sales, commissions, common)
        ├── pages/       # páginas que orquestram hooks + componentes
        ├── types/       # tipos TypeScript compartilhados
        └── utils/       # formatação de moeda/data
```

## Regra de negócio: comissão

- Cada `Product` tem um `commission_percentage` (0 a 10%).
- A comissão de um item de venda é `quantidade * valor_unitário * percentual / 100`.
- Alguns dias da semana têm um `CommissionRule` com `min_percentage` e
  `max_percentage` (configurável via Django admin). Quando existe uma regra
  para o dia da venda, o percentual do produto é "clampado" a esse intervalo
  antes do cálculo (ex.: segunda-feira com min 3%/max 5% — um produto de 10%
  paga 5%, um produto de 2% paga 3%).
- O dia da semana usado é o da **data/hora da venda**, convertido para o
  fuso configurado em `TIME_ZONE` (padrão `America/Sao_Paulo`), não o fuso
  do servidor.
- `SaleItem` grava um "snapshot" do `unit_price` e do `commission_percentage`
  efetivo no momento da criação. Isso é proposital: se o cadastro do produto
  mudar depois, notas fiscais já emitidas não mudam de valor retroativamente.
- O total de comissão da venda é a soma da comissão de todos os itens.

Essa lógica está isolada em `backend/sales/models.py` (`SaleItem` e
`CommissionRule`) e coberta por testes unitários dedicados em
`backend/sales/tests.py`.

## API

Todos os endpoints estão sob `/api/`:

| Método             | Endpoint               | Descrição                                            |
| ------------------ | ----------------------- | ----------------------------------------------------- |
| GET/POST           | `/api/products/`        | Listar/criar produtos                                 |
| GET/PUT/PATCH/DELETE | `/api/products/{id}/` | Detalhar/editar/excluir produto                       |
| GET/POST           | `/api/clients/`         | Listar/criar clientes                                 |
| GET/POST           | `/api/sellers/`         | Listar/criar vendedores                                |
| GET/POST           | `/api/sales/`           | Listar/criar vendas (com itens aninhados)              |
| GET/PUT/DELETE     | `/api/sales/{id}/`      | Detalhar/editar/excluir venda                          |
| GET                | `/api/commissions/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` | Comissão total por vendedor no período + total geral |

`/api/sales/` aceita filtros `seller`, `client`, `start_date`, `end_date` e
ordenação via `ordering` (ex.: `?ordering=-date_time`). As listas de
produtos/clientes/vendedores/vendas são paginadas (`page`, `page_size`).

A configuração de dias da semana e limites de comissão (`CommissionRule`) é
feita exclusivamente pelo Django admin, conforme pedido no enunciado — não
há endpoint de API para isso.

## Testes

```bash
# Backend
cd backend && source venv/Scripts/activate && python manage.py test sales

# Frontend
cd frontend && npm test
```

## Decisões de design

- **Cálculo de comissão no backend, não no frontend.** O frontend só mostra
  um valor total estimado (quantidade × preço) enquanto o usuário monta a
  venda; o percentual de comissão efetivo (com o clamp por dia da semana)
  só existe depois que o backend processa a venda, para não duplicar regra
  de negócio em duas linguagens.
- **Snapshot de preço/comissão no item da venda**, em vez de sempre
  recalcular a partir do cadastro atual do produto — para não alterar o
  valor de notas fiscais já emitidas quando o cadastro do produto muda.
- **Separação de camadas no frontend**: `api/` (chamadas HTTP puras) →
  `hooks/` (React Query: cache, invalidação, mutations) → `components/pages`
  (UI). Isso mantém a lógica de estado de servidor fora dos componentes
  visuais.
- **Sem Redux.** Todo o estado de servidor é gerenciado pelo TanStack Query
  (cache, refetch, invalidação após mutações); o estado local de formulário
  usa `useState`. Para o escopo do desafio, adicionar Redux seria
  complexidade sem benefício.
- **Material UI** para os componentes de interface — não consegui acessar o
  protótipo do Figma (o arquivo estava bloqueado sem login), então priorizei
  uma UI limpa e consistente em vez de tentar adivinhar o design pixel a
  pixel.

## O que eu faria a seguir

Com mais tempo, os próximos passos seriam:

- Autenticação/autorização na API (hoje ela é aberta, adequada só para o
  escopo do desafio).
- Endpoint de API (além do Django admin) para gerenciar `CommissionRule`,
  com validação de que não haja mais de uma regra por dia.
- Filtro por vendedor/cliente e busca por nota fiscal na tela de Vendas.
- Testes de integração do frontend com a API mockada (MSW) cobrindo os
  fluxos de criar/editar/excluir venda de ponta a ponta.
- Code splitting no bundle do frontend (o build atual gera um chunk único
  de ~600 KB, principalmente por causa do Material UI).
- Deploy de demonstração (Railway/Render para o backend, Vercel/Netlify
  para o frontend).
