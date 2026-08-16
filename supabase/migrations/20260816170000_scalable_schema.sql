-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS public.ai_insights CASCADE;
DROP TABLE IF EXISTS public.transaction_tags CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.ledger_members CASCADE;
DROP TABLE IF EXISTS public.ledgers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. LEDGERS (Buku Kas / Workspace)
CREATE TABLE IF NOT EXISTS public.ledgers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. LEDGER MEMBERS (Kolaborasi)
CREATE TABLE IF NOT EXISTS public.ledger_members (
    ledger_id UUID REFERENCES public.ledgers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (ledger_id, user_id)
);

-- 4. WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ledger_id UUID REFERENCES public.ledgers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CASH', 'BANK_ACCOUNT', 'E_WALLET', 'CREDIT_CARD', 'INVESTMENT', 'LOAN')),
    currency VARCHAR(10) DEFAULT 'IDR',
    balance DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ledger_id UUID REFERENCES public.ledgers(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE, -- For sub-categories
    name TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    icon TEXT,
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. BUDGETS
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ledger_id UUID REFERENCES public.ledgers(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE, -- Null means overall budget
    amount DECIMAL(15,2) NOT NULL,
    period VARCHAR(20) NOT NULL CHECK (period IN ('MONTHLY', 'WEEKLY', 'YEARLY')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TAGS
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ledger_id UUID REFERENCES public.ledgers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(ledger_id, name)
);

-- 8. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ledger_id UUID REFERENCES public.ledgers(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE RESTRICT,
    destination_wallet_id UUID REFERENCES public.wallets(id) ON DELETE RESTRICT, -- For transfers
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. TRANSACTION_TAGS
CREATE TABLE IF NOT EXISTS public.transaction_tags (
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (transaction_id, tag_id)
);

-- 10. AI INSIGHTS
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ledger_id UUID REFERENCES public.ledgers(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- SAVING_OPPORTUNITY, ANOMALY_DETECTED, BUDGET_WARNING
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    actionable_steps JSONB DEFAULT '[]'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- TRIGGERS
-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_ledger_id UUID;
BEGIN
  -- 1. Create Profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'User'));
  
  -- 2. Create Default Ledger
  INSERT INTO public.ledgers (owner_id, name)
  VALUES (new.id, 'Buku Kas Pribadi')
  RETURNING id INTO new_ledger_id;

  -- 3. Add to Ledger Members
  INSERT INTO public.ledger_members (ledger_id, user_id, role)
  VALUES (new_ledger_id, new.id, 'owner');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to prevent errors during overwrite
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles: Users can view and update their own profile
CREATE POLICY "View own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Ledgers: Users can view/edit ledgers they are members of
CREATE POLICY "View ledgers" ON public.ledgers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ledger_members WHERE ledger_id = public.ledgers.id AND user_id = auth.uid())
);
CREATE POLICY "Update ledgers" ON public.ledgers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.ledger_members WHERE ledger_id = public.ledgers.id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Ledger Members: Users can view members of their ledgers
CREATE POLICY "View ledger members" ON public.ledger_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ledger_members lm WHERE lm.ledger_id = public.ledger_members.ledger_id AND lm.user_id = auth.uid())
);

-- Helper function to check if user has access to a ledger
CREATE OR REPLACE FUNCTION public.has_ledger_access(target_ledger_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.ledger_members 
    WHERE ledger_id = target_ledger_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Wallets
CREATE POLICY "Ledger members can view wallets" ON public.wallets FOR SELECT USING (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can insert wallets" ON public.wallets FOR INSERT WITH CHECK (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can update wallets" ON public.wallets FOR UPDATE USING (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can delete wallets" ON public.wallets FOR DELETE USING (public.has_ledger_access(ledger_id));

-- Categories
CREATE POLICY "Ledger members can view categories" ON public.categories FOR SELECT USING (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can insert categories" ON public.categories FOR INSERT WITH CHECK (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can update categories" ON public.categories FOR UPDATE USING (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can delete categories" ON public.categories FOR DELETE USING (public.has_ledger_access(ledger_id));

-- Budgets
CREATE POLICY "Ledger members can view budgets" ON public.budgets FOR SELECT USING (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can insert budgets" ON public.budgets FOR INSERT WITH CHECK (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can update budgets" ON public.budgets FOR UPDATE USING (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can delete budgets" ON public.budgets FOR DELETE USING (public.has_ledger_access(ledger_id));

-- Tags
CREATE POLICY "Ledger members can view tags" ON public.tags FOR SELECT USING (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can insert tags" ON public.tags FOR INSERT WITH CHECK (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can delete tags" ON public.tags FOR DELETE USING (public.has_ledger_access(ledger_id));

-- Transactions
CREATE POLICY "Ledger members can view transactions" ON public.transactions FOR SELECT USING (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can insert transactions" ON public.transactions FOR INSERT WITH CHECK (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can update transactions" ON public.transactions FOR UPDATE USING (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can delete transactions" ON public.transactions FOR DELETE USING (public.has_ledger_access(ledger_id));

-- Transaction Tags
CREATE POLICY "Ledger members can view transaction_tags" ON public.transaction_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND public.has_ledger_access(t.ledger_id))
);
CREATE POLICY "Ledger members can insert transaction_tags" ON public.transaction_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND public.has_ledger_access(t.ledger_id))
);
CREATE POLICY "Ledger members can delete transaction_tags" ON public.transaction_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND public.has_ledger_access(t.ledger_id))
);

-- AI Insights
CREATE POLICY "Ledger members can view AI insights" ON public.ai_insights FOR SELECT USING (public.has_ledger_access(ledger_id));
CREATE POLICY "Ledger members can update AI insights" ON public.ai_insights FOR UPDATE USING (public.has_ledger_access(ledger_id));
