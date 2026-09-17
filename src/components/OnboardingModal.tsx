import React, { useState } from 'react';
import { 
  Zap, 
  Wallet, 
  History, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLIDES = [
  {
    icon: Zap,
    color: "text-amber-500 bg-amber-500/10",
    badge: "Fast & Instant",
    title: "Instant VTU & Bill Payments",
    desc: "Top up Airtime, purchase low-cost Data bundles, pay Electricity tokens, and renew Cable TV subscriptions in seconds."
  },
  {
    icon: Wallet,
    color: "text-emerald-500 bg-emerald-500/10",
    badge: "Secure Wallet",
    title: "Automated Wallet Funding",
    desc: "Fund your wallet effortlessly via Bank Transfer, Debit Card, or dedicated Virtual Account numbers with instant credit."
  },
  {
    icon: History,
    color: "text-blue-500 bg-blue-500/10",
    badge: "In-App Proof",
    title: "Instant In-App Receipts & History",
    desc: "View itemized digital receipts immediately after every purchase and track your complete spending history anytime from your dashboard."
  }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const ActiveIcon = SLIDES[currentSlide].icon;

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Welcome to NOHASub
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
          >
            Skip
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex gap-1.5 mb-6">
          {SLIDES.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'bg-emerald-500'
                  : idx < currentSlide
                  ? 'bg-emerald-500/40'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Slide Content */}
        <div className="flex flex-col items-center text-center py-4 min-h-[220px]">
          <div className={`p-4 rounded-2xl ${SLIDES[currentSlide].color} mb-4 transition-all duration-300`}>
            <ActiveIcon className="h-10 w-10" />
          </div>

          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mb-2">
            {SLIDES[currentSlide].badge}
          </span>

          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            {SLIDES[currentSlide].title}
          </h3>

          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
            {SLIDES[currentSlide].desc}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center gap-3">
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(prev => prev - 1)}
              className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition"
          >
            {currentSlide === SLIDES.length - 1 ? (
              <>
                <span>Get Started</span>
                <CheckCircle2 className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};