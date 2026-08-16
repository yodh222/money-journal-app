'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        // Alur Pendaftaran (Register)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/`,
          }
        });
        
        if (error) {
          toast.error('Gagal Registrasi: ' + error.message);
        } else {
          toast.success('Registrasi berhasil! Silakan cek kotak masuk email Anda dan klik link verifikasi sebelum mencoba login.');
          setIsRegistering(false);
          setPassword('');
        }
        
      } else {
        // Alur Masuk (Login)
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Login berhasil
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Gagal: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#FAFAFA]">MoneyJournal</h1>
            <p className="text-sm text-zinc-400">
              {isRegistering ? 'Buat akun baru untuk memulai.' : 'Silakan masuk ke akun Anda.'}
            </p>
          </div>
        </div>

        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  required={isRegistering}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkap Anda" 
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com" 
                className="w-full bg-[#09090B] border border-[#27272A] rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Kata Sandi (Password)</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter" 
                className="w-full bg-[#09090B] border border-[#27272A] rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex justify-center items-center h-12 mt-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 rounded-xl transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isRegistering ? 'Daftar Sekarang' : 'Masuk'
              )}
            </button>
          </form>
          
          <div className="text-center text-sm text-zinc-400 border-t border-[#27272A] pt-6">
            {isRegistering ? (
              <p>
                Sudah punya akun?{' '}
                <button type="button" onClick={() => setIsRegistering(false)} className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Masuk di sini
                </button>
              </p>
            ) : (
              <p>
                Belum punya akun?{' '}
                <button type="button" onClick={() => setIsRegistering(true)} className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Daftar di sini
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
