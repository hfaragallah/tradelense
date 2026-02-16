import React, { useState, useRef } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Info, Image as ImageIcon, Upload, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Trade, TradeType, TimeHorizon, RationaleTag } from '../types';
import { analyzeTradeImage } from '../services/geminiService';
import { Tooltip } from './Tooltip';
import { z } from 'zod';

interface CreateTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trade: Omit<Trade, 'id' | 'timestamp' | 'confidenceScore' | 'crowd'>) => void;
}

// Zod Schema for Trade Validation
const TradeSchema = z.object({
  asset: z.string().min(1, "Asset is required").max(10, "Asset ticker too long").regex(/^[A-Z0-9\/]+$/, "Invalid ticker format (e.g. BTC/USD)"),
  entryMin: z.number().positive("Entry must be positive"),
  entryMax: z.number().positive().optional(),
  stopLoss: z.number().positive("Stop loss must be positive"),
  takeProfit: z.array(z.number().positive()).min(1, "At least one TP required"),
  rationale: z.string().min(20, "Rationale must be at least 20 chars").max(1000, "Rationale too long").refine(val => !/<script/i.test(val), "Invalid characters detected"),
});

export const CreateTradeModal: React.FC<CreateTradeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  // Form State
  const [asset, setAsset] = useState('');
  const [market, setMarket] = useState('Crypto');
  const [type, setType] = useState<TradeType>(TradeType.LONG);
  const [entryMin, setEntryMin] = useState('');
  const [entryMax, setEntryMax] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [horizon, setHorizon] = useState<TimeHorizon>(TimeHorizon.SWING);
  const [rationale, setRationale] = useState('');
  const [tags, setTags] = useState<RationaleTag[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: RationaleTag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      if (tags.length < 3) setTags([...tags, tag]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image too large (Max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImagePreview(base64);

        // Trigger AI Analysis
        setIsAnalyzing(true);
        try {
          const aiData = await analyzeTradeImage(base64);
          if (aiData) {
            // Auto-populate form
            setAsset(aiData.asset);
            setMarket(aiData.market);
            setType(aiData.type);
            setEntryMin(aiData.entry.toString());
            setEntryMax(aiData.entryMax ? aiData.entryMax.toString() : '');
            setStopLoss(aiData.stopLoss.toString());
            setTakeProfit(aiData.takeProfit.join(', '));
            setRationale(aiData.rationale);
            setHorizon(aiData.timeHorizon);
            setTags(aiData.rationaleTags);
          } else {
            setError("Could not extract trade details from image.");
          }
        } catch (err) {
          console.error(err);
          setError("AI Analysis failed.");
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const tpArray = takeProfit.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const eMin = parseFloat(entryMin);
    const eMax = entryMax ? parseFloat(entryMax) : undefined;
    const sl = parseFloat(stopLoss);

    // Validate using Zod
    const validation = TradeSchema.safeParse({
      asset: asset.toUpperCase(),
      entryMin: eMin,
      entryMax: eMax,
      stopLoss: sl,
      takeProfit: tpArray,
      rationale: rationale
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    onSubmit({
      authorId: 'u_me', // Mock
      authorName: 'You', // Mock
      authorReputation: 75, // Mock initial score for new user
      asset: asset.toUpperCase(),
      market,
      type,
      entryRange: [eMin, eMax || eMin],
      stopLoss: sl,
      takeProfit: tpArray,
      timeHorizon: horizon,
      rationale,
      rationaleTags: tags,
      imageUrl: imagePreview || undefined,
      isShadowed: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-background-secondary border border-surface rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-surface sticky top-0 bg-background-secondary z-10">
          <h2 className="text-xl font-bold text-text-primary">Post New Trade</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* AI Auto-Fill Section */}
          <div className="mb-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {!imagePreview ? (
              <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer py-6 border-2 border-dashed border-status-neutral/30 rounded-xl hover:bg-surface/50 transition-all group text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-status-neutral/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex flex-col items-center gap-2">
                  <div className="p-3 bg-status-neutral/10 rounded-full text-status-neutral group-hover:scale-110 transition-transform duration-300">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-sm">Auto-Fill from Chart</h3>
                    <p className="text-xs text-text-muted mt-1">Upload a screenshot not to type manually</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-32 rounded-xl border border-surface overflow-hidden group">
                <img src={imagePreview} alt="Preview" className={`w-full h-full object-cover transition-all ${isAnalyzing ? 'blur-sm scale-105' : ''}`} />

                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                    <Loader2 size={32} className="text-white animate-spin mb-2" />
                    <span className="text-xs font-bold text-white tracking-wider animate-pulse">ANALYZING CHART...</span>
                  </div>
                )}

                {!isAnalyzing && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1.5 border border-white/10">
                    <Sparkles size={12} className="text-yellow-400" />
                    <span className="text-[10px] text-white font-medium">Data Extracted</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
                >
                  <X size={14} />
                </button>

                {/* Retake Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-surface flex-1"></div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Or Enter Manually</span>
            <div className="h-px bg-surface flex-1"></div>
          </div>
          {/* Section 1: Asset & Direction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Asset Ticker</label>
              <input
                type="text"
                placeholder="e.g. BTC/USD"
                className="w-full bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral focus:ring-1 focus:ring-status-neutral outline-none transition-all font-mono"
                value={asset}
                onChange={e => setAsset(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Market</label>
              <select
                className="w-full bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral outline-none"
                value={market}
                onChange={e => setMarket(e.target.value)}
              >
                <option>Crypto</option>
                <option>Forex</option>
                <option>Stocks</option>
                <option>Commodities</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Direction</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType(TradeType.LONG)}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all font-bold ${type === TradeType.LONG ? 'bg-status-high/20 border-status-high text-status-high' : 'bg-surface border-surface text-text-muted hover:bg-surface/80'}`}
              >
                <ArrowUpRight size={20} /> Long
              </button>
              <button
                type="button"
                onClick={() => setType(TradeType.SHORT)}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all font-bold ${type === TradeType.SHORT ? 'bg-status-risk/20 border-status-risk text-status-risk' : 'bg-surface border-surface text-text-muted hover:bg-surface/80'}`}
              >
                <ArrowDownRight size={20} /> Short
              </button>
            </div>
          </div>

          {/* Section 2: Levels */}
          <div className="p-4 bg-surface/30 rounded-xl border border-surface/50">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Tooltip content="TraderLense recommends a Risk:Reward ratio of at least 1:2. Always set a hard Stop Loss.">
                <Info size={16} className="text-status-neutral cursor-help" />
              </Tooltip>
              Trade Levels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">Entry Price</label>
                <div className="flex gap-2">
                  <input
                    type="number" placeholder="Min" step="any"
                    className="w-full bg-background-primary border border-surface rounded px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-text-muted"
                    value={entryMin}
                    onChange={e => setEntryMin(e.target.value)}
                    required
                  />
                  <input
                    type="number" placeholder="Max (Optional)" step="any"
                    className="w-full bg-background-primary border border-surface rounded px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-text-muted"
                    value={entryMax}
                    onChange={e => setEntryMax(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1 text-status-risk">Stop Loss</label>
                <input
                  type="number" placeholder="Price" step="any"
                  className="w-full bg-background-primary border border-status-risk/30 rounded px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-status-risk"
                  value={stopLoss}
                  onChange={e => setStopLoss(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1 text-status-high">Take Profit(s)</label>
                <input
                  type="text" placeholder="e.g. 100, 105"
                  className="w-full bg-background-primary border border-status-high/30 rounded px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-status-high"
                  value={takeProfit}
                  onChange={e => setTakeProfit(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Context */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Time Horizon</label>
            <select
              className="w-full bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral outline-none"
              value={horizon}
              onChange={e => setHorizon(e.target.value as TimeHorizon)}
            >
              {Object.values(TimeHorizon).map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Rationale & Analysis</label>
            <textarea
              className="w-full h-32 bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral focus:ring-1 focus:ring-status-neutral outline-none transition-all resize-none"
              placeholder="Why are you taking this trade? (Technical, Fundamental, Sentiment reasons...)"
              value={rationale}
              onChange={e => setRationale(e.target.value)}
              required
            />

            {/* Image Upload */}
            {/* Image Upload Moved to Top */}

            <div className="flex flex-wrap gap-2 mt-3">
              {Object.values(RationaleTag).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${tags.includes(tag) ? 'bg-status-neutral text-white border-status-neutral' : 'bg-surface text-text-secondary border-surface hover:border-text-muted'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-status-risk/10 border border-status-risk/20 rounded-lg flex items-center gap-2 text-status-risk text-sm font-bold animate-in slide-in-from-bottom-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="pt-4 border-t border-surface flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-text-secondary hover:bg-surface font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-status-high text-background-primary font-bold hover:bg-green-500 transition-colors shadow-lg shadow-green-900/20"
            >
              Post Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};