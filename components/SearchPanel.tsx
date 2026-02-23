import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, Clock, Tag, ChevronRight, Filter } from 'lucide-react';
import { Trade, TradeType, TimeHorizon } from '../types';

interface SearchPanelProps {
    trades: Trade[];
    onSelectTrade: (trade: Trade) => void;
    onClose: () => void;
}

const MARKET_OPTIONS = ['All', 'Crypto', 'Forex', 'Stocks', 'Commodities'];
const TYPE_OPTIONS = ['All', 'LONG', 'SHORT'];
const HORIZON_OPTIONS = ['All', ...Object.values(TimeHorizon)];

export const SearchPanel: React.FC<SearchPanelProps> = ({ trades, onSelectTrade, onClose }) => {
    const [query, setQuery] = useState('');
    const [filterMarket, setFilterMarket] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [filterHorizon, setFilterHorizon] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Live filtering
    const results = trades.filter(t => {
        const q = query.toLowerCase();
        const matchesQuery =
            !q ||
            t.asset.toLowerCase().includes(q) ||
            t.authorName.toLowerCase().includes(q) ||
            t.market.toLowerCase().includes(q) ||
            t.rationale.toLowerCase().includes(q) ||
            (t.rationaleTags || []).some(tag => tag.toLowerCase().includes(q));

        const matchesMarket = filterMarket === 'All' || t.market === filterMarket;
        const matchesType = filterType === 'All' || t.type === filterType;
        const matchesHorizon = filterHorizon === 'All' || t.timeHorizon === filterHorizon;

        return matchesQuery && matchesMarket && matchesType && matchesHorizon;
    });

    const hasActiveFilters = filterMarket !== 'All' || filterType !== 'All' || filterHorizon !== 'All';

    return (
        <div className="fixed inset-0 z-[100] flex flex-col" onClick={onClose}>
            {/* Blurred backdrop */}
            <div className="absolute inset-0 bg-background-primary/80 backdrop-blur-sm" />

            <div
                className="relative z-10 w-full max-w-2xl mx-auto mt-16 px-4"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center bg-background-secondary border border-surface rounded-2xl px-5 py-4 gap-3 shadow-2xl focus-within:border-status-neutral transition-colors">
                    <Search size={20} className="text-text-muted flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search assets, traders, strategies..."
                        className="flex-1 bg-transparent border-none outline-none text-base text-text-primary placeholder:text-text-muted"
                    />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(p => !p)}
                            className={`p-1.5 rounded-lg transition-all ${hasActiveFilters ? 'bg-status-neutral/20 text-status-neutral' : 'text-text-muted hover:text-text-primary hover:bg-surface/50'}`}
                            title="Filters"
                        >
                            <Filter size={16} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface/50 transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                {showFilters && (
                    <div className="mt-2 p-4 bg-background-secondary border border-surface rounded-xl shadow-xl flex flex-wrap gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                        <FilterGroup
                            label="Market"
                            options={MARKET_OPTIONS}
                            value={filterMarket}
                            onChange={setFilterMarket}
                        />
                        <FilterGroup
                            label="Type"
                            options={TYPE_OPTIONS}
                            value={filterType}
                            onChange={setFilterType}
                        />
                        <FilterGroup
                            label="Horizon"
                            options={HORIZON_OPTIONS}
                            value={filterHorizon}
                            onChange={setFilterHorizon}
                        />
                        {hasActiveFilters && (
                            <button
                                onClick={() => { setFilterMarket('All'); setFilterType('All'); setFilterHorizon('All'); }}
                                className="text-xs text-status-risk hover:text-status-risk/80 transition-colors self-end ml-auto"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Results */}
                <div className="mt-3 bg-background-secondary border border-surface rounded-2xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
                    {/* Stats bar */}
                    <div className="px-5 py-3 border-b border-surface flex items-center justify-between">
                        <span className="text-xs text-text-muted font-medium">
                            {query || hasActiveFilters
                                ? `${results.length} result${results.length !== 1 ? 's' : ''}`
                                : `${trades.length} trades available`}
                        </span>
                        {query && (
                            <span className="text-xs text-text-muted">
                                Showing matches for <span className="text-text-primary font-medium">"{query}"</span>
                            </span>
                        )}
                    </div>

                    {results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                            <Search size={40} className="mb-4 opacity-30" />
                            <p className="font-medium">No trades found</p>
                            <p className="text-sm mt-1 opacity-70">Try a different search or remove filters</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-surface">
                            {results.map(trade => (
                                <SearchResultRow
                                    key={trade.id}
                                    trade={trade}
                                    query={query}
                                    onClick={() => { onSelectTrade(trade); onClose(); }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Keyboard hint */}
                <p className="text-center text-xs text-text-muted mt-3 opacity-60">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-surface border border-surface text-text-muted font-mono text-[10px]">Esc</kbd> to close
                </p>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────

function FilterGroup({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1.5 min-w-[120px]">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{label}</span>
            <div className="flex flex-wrap gap-1.5">
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${value === opt
                                ? 'bg-status-neutral text-white border-status-neutral'
                                : 'bg-surface/50 text-text-secondary border-surface hover:border-text-muted/40'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────

function SearchResultRow({ trade, query, onClick }: { trade: Trade; query: string; onClick: () => void }) {
    const isLong = trade.type === TradeType.LONG;
    const score = trade.confidenceScore;
    const confidenceColor = score >= 75 ? 'text-status-high' : score >= 50 ? 'text-status-warning' : 'text-status-risk';

    // Highlight matching text
    const highlight = (text: string) => {
        if (!query) return text;
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return text;
        return (
            <>
                {text.slice(0, idx)}
                <mark className="bg-status-neutral/30 text-text-primary rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
                {text.slice(idx + query.length)}
            </>
        );
    };

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface/40 transition-colors text-left group"
        >
            {/* Type Indicator */}
            <div className={`p-2 rounded-lg flex-shrink-0 ${isLong ? 'bg-status-high/10 text-status-high' : 'bg-status-risk/10 text-status-risk'}`}>
                {isLong ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-text-primary">{highlight(trade.asset)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-text-muted border border-surface/50 font-medium">{trade.market}</span>
                    <span className={`text-[10px] font-bold uppercase ${isLong ? 'text-status-high' : 'text-status-risk'}`}>{trade.type}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>{highlight(trade.authorName)}</span>
                    {trade.timeHorizon && (
                        <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {trade.timeHorizon}
                        </span>
                    )}
                    {trade.rationaleTags?.slice(0, 2).map(tag => (
                        <span key={tag} className="flex items-center gap-0.5">
                            <Tag size={9} /> {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Confidence Score */}
            <div className="flex-shrink-0 text-right">
                <span className={`text-lg font-bold font-mono ${confidenceColor}`}>{score}%</span>
                <p className="text-[10px] text-text-muted">confidence</p>
            </div>

            <ChevronRight size={16} className="text-text-muted group-hover:text-text-primary transition-colors flex-shrink-0" />
        </button>
    );
}
