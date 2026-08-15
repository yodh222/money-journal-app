import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import BottomNav from './components/BottomNav';
import TransactionModal from './components/TransactionModal';

function App() {
  // Initial state for MVP
  const [balance, setBalance] = useState(1000000); // Initial balance Rp 1.000.000
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedBalance = localStorage.getItem('mj_balance');
    const savedTransactions = localStorage.getItem('mj_transactions');
    if (savedBalance) setBalance(parseFloat(savedBalance));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('mj_balance', balance);
    localStorage.setItem('mj_transactions', JSON.stringify(transactions));
  }, [balance, transactions]);

  const handleAddTransaction = (amount, type, category, note) => {
    const newTransaction = {
      id: Date.now(),
      amount,
      type, // 'INCOME' or 'EXPENSE'
      category,
      note,
      date: new Date().toISOString()
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    if (type === 'INCOME') {
      setBalance(balance + amount);
    } else {
      setBalance(balance - amount);
    }
  };

  return (
    <>
      <Dashboard balance={balance} transactions={transactions} />
      <BottomNav onOpenModal={() => setIsModalOpen(true)} />
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddTransaction}
      />
    </>
  );
}

export default App;
