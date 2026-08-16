'use client';
import React from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Loader2, Sparkles } from 'lucide-react';
import AIInsights from '@/components/dashboard/AIInsights';

export default function InsightsPage() {
  const { loading } = useSupabaseData();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] grid grid-cols-[240px_1fr] h-screen overflow-hidden">
      <AppSidebar />
      <main className="p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              AI Insights
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Rekomendasi cerdas dari AI untuk kesehatan finansial Anda.</p>
          </div>
        </div>

        <div className="mt-8 max-w-4xl">
          <AIInsights />
        </div>
      </main>
    </div>
  );
}
