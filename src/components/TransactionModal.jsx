import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: 'makanan', label: 'Makanan', type: 'EXPENSE', icon: '🍔' },
  { id: 'transport', label: 'Transport', type: 'EXPENSE', icon: '🚗' },
  { id: 'belanja', label: 'Belanja', type: 'EXPENSE', icon: '🛍️' },
  { id: 'hiburan', label: 'Hiburan', type: 'EXPENSE', icon: '🎬' },
  { id: 'gaji', label: 'Gaji', type: 'INCOME', icon: '💰' },
  { id: 'bonus', label: 'Bonus', type: 'INCOME', icon: '🎉' }
];

const TransactionModal = ({ isOpen, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [type, setType] = useState('EXPENSE'); // INCOME or EXPENSE
  const [note, setNote] = useState('');

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNote('');
      setType('EXPENSE');
      setSelectedCategory(CATEGORIES[0]);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!amount || isNaN(amount)) return;
    onSave(parseFloat(amount), type, selectedCategory.label, note);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  // Filter categories based on selected type
  const activeCategories = CATEGORIES.filter(c => c.type === type);

  return (
    <div 
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="bottom-sheet">
        {/* Type Toggle */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            className={`font-semibold pb-1 border-b-2 ${type === 'EXPENSE' ? 'text-expense border-[var(--color-expense)]' : 'text-secondary border-transparent'}`}
            onClick={() => { setType('EXPENSE'); setSelectedCategory(CATEGORIES.find(c => c.type === 'EXPENSE')); }}
            style={{ borderBottomWidth: '2px', borderBottomStyle: 'solid', background: 'none', cursor: 'pointer' }}
          >
            Pengeluaran
          </button>
          <button 
            className={`font-semibold pb-1 border-b-2 ${type === 'INCOME' ? 'text-income border-[var(--color-income)]' : 'text-secondary border-transparent'}`}
            onClick={() => { setType('INCOME'); setSelectedCategory(CATEGORIES.find(c => c.type === 'INCOME')); }}
            style={{ borderBottomWidth: '2px', borderBottomStyle: 'solid', background: 'none', cursor: 'pointer' }}
          >
            Pemasukan
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <input 
            type="number" 
            className="amount-input"
            placeholder="Rp 0" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus={isOpen}
          />
        </div>

        {/* Categories */}
        <div className="mb-4">
          <p className="text-sm text-secondary font-medium mb-3">Kategori</p>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {activeCategories.map((cat) => (
              <div 
                key={cat.id} 
                className={`category-pill flex items-center gap-1 ${selectedCategory.id === cat.id ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat.icon}</span> {cat.label}
              </div>
            ))}
          </div>
        </div>

        {/* Note (Optional) */}
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Catatan jurnal (opsional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
              border: '1px solid var(--border-color)', outline: 'none',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <button className="btn-save" onClick={handleSave}>
          Simpan Transaksi
        </button>
      </div>
    </div>
  );
};

export default TransactionModal;
