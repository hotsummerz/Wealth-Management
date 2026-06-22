import React, { useState } from 'react';
import { api } from '../../utils/api';

const expenseCats = [
  "Makanan", "Jajan", "Game dan Top up", "Makan dan Minum",
  "Belanja", "Parkir", "Subscription", "Listrik", "Kebutuhan Pokok Lainnya"
];
const incomeCats = ["Gaji", "Bonus", "Investasi", "Freelance"];

const QuickActions = ({ onTxSaved }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const currentCats = type === 'expense' ? expenseCats : incomeCats;

  const handleSubmit = async () => {
    if (!amount || !category) return;
    setLoading(true);
    try {
      const res = await api.createTransaction({ type, amount: parseFloat(amount), category, note });
      if (res.success) {
        setAmount('');
        setCategory('');
        setNote('');
        onTxSaved();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass-card rounded-lg p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container text-[20px]">bolt</span>
        <h3 className="font-headline-md text-headline-md text-on-surface text-[18px]">Quick Log</h3>
      </div>

      {/* Toggle Expense / Income */}
      <div className="flex bg-surface-container-high rounded-lg p-1 border border-outline-variant">
        <button
          onClick={() => { setType('expense'); setCategory(''); }}
          className={`flex-1 py-2.5 text-center rounded-md font-semibold text-sm transition-all ${
            type === 'expense' ? 'bg-surface text-on-surface shadow' : 'text-on-surface-variant'
          }`}
        >
          Expense
        </button>
        <button
          onClick={() => { setType('income'); setCategory(''); }}
          className={`flex-1 py-2.5 text-center rounded-md font-semibold text-sm transition-all ${
            type === 'income' ? 'bg-surface text-on-surface shadow' : 'text-on-surface-variant'
          }`}
        >
          Income
        </button>
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-2">
        <label htmlFor="ql-amount" className="font-label-sm text-label-sm text-on-surface-variant uppercase">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">Rp</span>
          <input
            id="ql-amount"
            name="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-10 pr-4 text-on-surface text-lg font-semibold focus:outline-none focus:border-primary transition-colors"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="flex flex-col gap-2">
        <label htmlFor="ql-category" className="font-label-sm text-label-sm text-on-surface-variant uppercase">Category</label>
        <select
          id="ql-category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
        >
          <option value="" disabled>Select a category</option>
          {currentCats.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Note */}
      <div className="flex flex-col gap-2">
        <label htmlFor="ql-note" className="font-label-sm text-label-sm text-on-surface-variant uppercase">Note (Optional)</label>
        <input
          id="ql-note"
          name="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
          placeholder="What was this for?"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!amount || !category || loading}
        className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary-container text-on-primary hover:brightness-110 flex items-center justify-center gap-2 mt-auto"
      >
        {loading ? (
          <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Saving...</>
        ) : (
          <><span className="material-symbols-outlined text-base">add</span> Add Transaction</>
        )}
      </button>
    </section>
  );
};

export default QuickActions;