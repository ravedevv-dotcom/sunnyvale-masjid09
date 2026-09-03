import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Coins, 
  DollarSign, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CURRENT_NISAB_GOLD_NGN, CURRENT_NISAB_SILVER_NGN } from './constants';

interface ZakatCalculatorProps {
  onPayZakat?: (amount: number) => void;
}

const ZakatCalculator: React.FC<ZakatCalculatorProps> = ({ onPayZakat }) => {
  const [nisabStandard, setNisabStandard] = useState<'gold' | 'silver'>('silver');
  
  // Wealth Assets
  const [cashInBank, setCashInBank] = useState<string>('');
  const [cashOnHand, setCashOnHand] = useState<string>('');
  const [goldSilverValue, setGoldSilverValue] = useState<string>('');
  const [investments, setInvestments] = useState<string>('');
  const [businessStock, setBusinessStock] = useState<string>('');
  const [moneyOwedToYou, setMoneyOwedToYou] = useState<string>('');
  
  // Liabilities
  const [immediateDebts, setImmediateDebts] = useState<string>('');
  const [expensesDue, setExpensesDue] = useState<string>('');

  const nisabThreshold = nisabStandard === 'gold' ? CURRENT_NISAB_GOLD_NGN : CURRENT_NISAB_SILVER_NGN;

  // Compute Total Assets
  const totalAssets = 
    (Number(cashInBank) || 0) +
    (Number(cashOnHand) || 0) +
    (Number(goldSilverValue) || 0) +
    (Number(investments) || 0) +
    (Number(businessStock) || 0) +
    (Number(moneyOwedToYou) || 0);

  // Compute Total Liabilities
  const totalLiabilities = 
    (Number(immediateDebts) || 0) + 
    (Number(expensesDue) || 0);

  // Net Zakatable Wealth
  const netZakatableWealth = Math.max(0, totalAssets - totalLiabilities);
  const isEligibleForZakat = netZakatableWealth >= nisabThreshold;
  const zakatDue = isEligibleForZakat ? Math.round(netZakatableWealth * 0.025) : 0;

  return (
    <div className="bg-[#181b22] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl text-zinc-100 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-zinc-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1 mb-1">
            <Sparkles size={14} /> Islamic Wealth Purification
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Calculator size={22} className="text-zinc-300" /> Digital Zakat Al-Mal Calculator
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Calculate your obligatory 2.5% annual Zakat on eligible qualifying assets.
          </p>
        </div>

        {/* Nisab Standard Switcher */}
        <div className="flex items-center gap-2 bg-[#121419] p-1.5 rounded-2xl border border-zinc-750">
          <span className="text-[11px] text-zinc-400 px-2 font-medium">Nisab Standard:</span>
          <button
            type="button"
            onClick={() => setNisabStandard('silver')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              nisabStandard === 'silver' ? 'bg-zinc-200 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Silver (₦{(CURRENT_NISAB_SILVER_NGN / 1000000).toFixed(2)}M)
          </button>
          <button
            type="button"
            onClick={() => setNisabStandard('gold')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              nisabStandard === 'gold' ? 'bg-zinc-200 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Gold (₦{(CURRENT_NISAB_GOLD_NGN / 1000000).toFixed(1)}M)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Asset Inputs */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Coins size={14} /> 1. Zakatable Assets (Held for 1 Lunar Year)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Cash in Bank Accounts (₦)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={cashInBank}
                  onChange={(e) => setCashInBank(e.target.value)}
                  className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Cash on Hand (₦)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={cashOnHand}
                  onChange={(e) => setCashOnHand(e.target.value)}
                  className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Gold & Silver Jewelry Value (₦)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={goldSilverValue}
                  onChange={(e) => setGoldSilverValue(e.target.value)}
                  className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Shares & Stock Investments (₦)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={investments}
                  onChange={(e) => setInvestments(e.target.value)}
                  className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Business Inventory / Stock (₦)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={businessStock}
                  onChange={(e) => setBusinessStock(e.target.value)}
                  className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Good Debts Owed to You (₦)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={moneyOwedToYou}
                  onChange={(e) => setMoneyOwedToYou(e.target.value)}
                  className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <DollarSign size={14} /> 2. Deductible Liabilities & Debts Due Now
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Short-term Debts Due Imminently (₦)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={immediateDebts}
                  onChange={(e) => setImmediateDebts(e.target.value)}
                  className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Due Bills & Expenses (₦)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={expensesDue}
                  onChange={(e) => setExpensesDue(e.target.value)}
                  className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculation Summary Card */}
        <div className="bg-[#121419] rounded-2xl p-6 border border-zinc-800 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">
              Calculation Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Assets:</span>
                <span className="font-bold text-white font-mono">₦{totalAssets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Deductible Debts:</span>
                <span className="font-bold text-red-300 font-mono">- ₦{totalLiabilities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800">
                <span className="text-zinc-300 font-semibold">Net Zakatable:</span>
                <span className="font-bold text-zinc-200 font-mono">₦{netZakatableWealth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Nisab Threshold ({nisabStandard}):</span>
                <span className="font-mono">₦{nisabThreshold.toLocaleString()}</span>
              </div>
            </div>

            {/* Eligibility Banner */}
            <div className={`p-3.5 rounded-xl border text-xs ${
              isEligibleForZakat 
                ? 'bg-zinc-800/80 border-zinc-600 text-zinc-200' 
                : 'bg-[#181b22] border-zinc-800 text-zinc-400'
            }`}>
              {isEligibleForZakat ? (
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-zinc-200 shrink-0 mt-0.5" />
                  <p>
                    Your wealth exceeds the Nisab threshold. <strong>2.5% Zakat is obligatory</strong>.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                  <p>
                    Your net wealth is below the current Nisab threshold. Zakat is not obligatory, but voluntary Sadaqah is always rewarded.
                  </p>
                </div>
              )}
            </div>

            {/* Total Zakat Payable */}
            <div className="p-4 bg-gradient-to-br from-zinc-800 to-[#181b22] rounded-2xl border border-zinc-700 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-0.5">
                Total Obligatory Zakat (2.5%)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                ₦{zakatDue.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            {onPayZakat ? (
              <button
                type="button"
                onClick={() => onPayZakat(zakatDue > 0 ? zakatDue : 5000)}
                className="w-full py-3 bg-zinc-200 hover:bg-white text-zinc-950 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Donate Zakat via Bank Transfer <ArrowRight size={14} />
              </button>
            ) : (
              <Link
                to={`/donate?tab=bank&purpose=zakat&amount=${zakatDue > 0 ? zakatDue : ''}`}
                className="w-full py-3 bg-zinc-200 hover:bg-white text-zinc-950 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 text-center"
              >
                Donate Zakat via Bank Transfer <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZakatCalculator;
