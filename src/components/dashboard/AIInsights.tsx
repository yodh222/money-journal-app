'use client';

import React, { useEffect, useState } from 'react';
import { Lightbulb, Loader2, X } from 'lucide-react';
import { aiInsightService, AIInsight } from '@/services/aiInsight.service';

export default function AIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      // Create mock insight if none exists
      await aiInsightService.generateMockInsightIfNeeded();
      const data = await aiInsightService.getInsights();
      setInsights(data.filter(i => !i.is_read));
    } catch (err) {
      console.error('Failed to load insights', err);
    } finally {
      setLoading(false);
    }
  };

  const dismissInsight = async (id: string) => {
    try {
      await aiInsightService.markAsRead(id);
      setInsights(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to dismiss insight', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-6 flex justify-center items-center">
        <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      {insights.map((insight) => (
        <div key={insight.id} className="relative bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-xl flex gap-4 overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <div className="h-10 w-10 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="text-white font-medium mb-1">{insight.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{insight.description}</p>
            {insight.actionable_steps && insight.actionable_steps.length > 0 && (
              <div className="mt-4 flex gap-2">
                {insight.actionable_steps.map((step, idx) => (
                  <button key={idx} className="bg-indigo-500 text-white text-xs px-3 py-1.5 rounded hover:bg-indigo-600 transition-colors">
                    {step.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => dismissInsight(insight.id)}
            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
