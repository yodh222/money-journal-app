-- Create table to link Telegram chat ID to Supabase user ID
CREATE TABLE telegram_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    telegram_chat_id BIGINT NOT NULL UNIQUE,
    telegram_username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies
ALTER TABLE telegram_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own telegram links"
    ON telegram_links FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own telegram links"
    ON telegram_links FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telegram links"
    ON telegram_links FOR DELETE
    USING (auth.uid() = user_id);
