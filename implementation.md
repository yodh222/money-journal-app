# MoneyJournal Implementation Guide

This document outlines the architectural blueprints and implementation details for the MoneyJournal Web App Desktop.

## 1. Project Structure

The project uses Next.js with the App Router. The source code is located in the `src/` directory.

```
src/
├── app/
│   ├── layout.tsx         # Global layout with providers (Theme, Supabase Auth)
│   ├── page.tsx           # Dashboard main page
│   ├── login/page.tsx     # Authentication page
│   └── globals.css        # Tailwind CSS and base styles
├── components/
│   ├── ui/                # Reusable Shadcn UI components
│   ├── command-palette/   # Global quick-input command palette
│   └── dashboard/         # Dashboard specific components (Charts, Summary Cards)
├── lib/
│   ├── supabaseClient.ts  # Supabase initialization
│   └── utils.ts           # Helper functions (currency formatter, class merge)
└── hooks/
    └── useShortcut.ts     # Global keyboard event listeners
```

## 2. Keyboard Shortcuts Implementation

A global event listener `useShortcut` hook captures keystrokes without needing to focus on an input field.

- `N` or `Ctrl/Cmd + K`: Opens the Quick Input modal.
- `D`: Routes to `/dashboard`
- `A`: Routes to `/analytics`
- `S`: Routes to `/settings`
- `Esc`: Closes active modals.

## 3. Database Schema (Supabase PostgreSQL)

Execute the following SQL in the Supabase SQL Editor to initialize the database:

```sql
-- ENABLE EXTENSION UNTUK GENERASI UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL PROFIL PENGGUNA
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    base_currency VARCHAR(3) DEFAULT 'IDR',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL DOMPET / AKUN FINANSIAL
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('CASH', 'BANK_ACCOUNT', 'E_WALLET', 'CREDIT_CARD')),
    balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    color_hex VARCHAR(7) DEFAULT '#6366F1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL KATEGORI TRANSAKSI
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('INCOME', 'EXPENSE')) NOT NULL,
    icon_name VARCHAR(30) DEFAULT 'wallet',
    budget_limit NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL INTI TRANSAKSI & JURNAL
CREATE TABLE public.transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL,
    notes TEXT,
    tags VARCHAR(50)[],
    transaction_date DATE DEFAULT CURRENT_DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEKS OPTIMASI QUERY UNTUK PENCARIAN & FILTER DASHBOARD FAST (PENTING!)
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);
```

## 4. UI/UX Principles

- **Color Palette:** Slate-950/Zinc-900 for dark mode backgrounds. Primary accents in Indigo (`#6366F1`), Success in Emerald (`#10B981`), Danger in Red (`#EF4444`).
- **Typography:** Inter sans-serif font applied globally.
- **Layout:** CSS Grid with `240px 1fr 360px` columns. Central column handles scrolling if necessary, maintaining a fixed sidebar structure.
