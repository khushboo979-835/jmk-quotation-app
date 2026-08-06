import React, { useState } from 'react';
import { Product, Item as QuotationItem } from '../types/quotation';
import { Search, Plus, Check, ExternalLink, SlidersHorizontal } from 'lucide-react';
import catalogue from '../data/catalogue';

type Props = {
  items: QuotationItem[];
  onAddProduct: (productId: string) => void;
};

// Custom SVG blueprints for JMK Engineering categories to make the UI look premium and tailored
const BlueprintThumbnail: React.FC<{ category: string; name: string }> = ({ category, name }) => {
  const isPlate = category === 'Scaffolding Plates';
  const isJoint = category === 'Expansion Joints';
  const isClamp = category === 'Clamps & Jacks';
  const isCuplock = category === 'Cuplock Scaffolding';

  return (
    <div className="relative w-full h-24 rounded-lg bg-slate-900 border border-blue-900/40 overflow-hidden flex items-center justify-center group-hover:border-blue-500/50 transition-all duration-300">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:10px_10px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"></div>
      
      {/* Blueprint Graphics */}
      <svg className="w-16 h-16 text-blue-400/60 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
        {isJoint && (
          <>
            {/* Draw Expansion Joint bellows */}
            <path d="M 10 50 L 30 50 L 35 30 L 40 70 L 45 30 L 50 70 L 55 30 L 60 70 L 65 30 L 70 50 L 90 50" strokeWidth="2.5" />
            <line x1="10" y1="40" x2="10" y2="60" strokeWidth="2" />
            <line x1="90" y1="40" x2="90" y2="60" strokeWidth="2" />
            <circle cx="50" cy="50" r="2" fill="currentColor" />
            {/* Dimension lines */}
            <path d="M 30 20 L 70 20" strokeDasharray="2 2" stroke="currentColor" strokeWidth="0.8" />
            <path d="M 30 18 L 30 22 M 70 18 L 70 22" stroke="currentColor" strokeWidth="0.8" />
          </>
        )}
        {isPlate && (
          <>
            {/* Draw Shuttering/Centering Plate */}
            <rect x="20" y="20" width="60" height="60" rx="3" strokeWidth="2" />
            <line x1="20" y1="20" x2="80" y2="80" strokeDasharray="2 2" />
            <line x1="80" y1="20" x2="20" y2="80" strokeDasharray="2 2" />
            <rect x="25" y="25" width="50" height="50" strokeDasharray="1 1" />
            <circle cx="50" cy="50" r="4" strokeWidth="1" />
            {/* Reinforcement lines */}
            <line x1="50" y1="20" x2="50" y2="80" strokeWidth="0.8" />
            <line x1="20" y1="50" x2="80" y2="50" strokeWidth="0.8" />
          </>
        )}
        {isCuplock && (
          <>
            {/* Draw Scaffolding Pipe and Cups */}
            <rect x="44" y="10" width="12" height="80" rx="1" strokeWidth="1.5" />
            {/* Cups */}
            <path d="M 35 35 C 35 30 65 30 65 35 Z" fill="currentColor" opacity="0.3" />
            <path d="M 35 35 L 65 35 L 60 42 L 40 42 Z" fill="currentColor" />
            <path d="M 35 65 C 35 60 65 60 65 65 Z" fill="currentColor" opacity="0.3" />
            <path d="M 35 65 L 65 65 L 60 72 L 40 72 Z" fill="currentColor" />
            {/* Ledger connections */}
            <line x1="15" y1="38" x2="38" y2="38" strokeWidth="2" />
            <line x1="62" y1="38" x2="85" y2="38" strokeWidth="2" />
          </>
        )}
        {isClamp && (
          <>
            {/* Draw Swivel/Fixed Clamp Blueprint */}
            <circle cx="35" cy="50" r="18" strokeWidth="2" />
            <circle cx="65" cy="50" r="18" strokeWidth="2" />
            <circle cx="35" cy="50" r="8" strokeDasharray="2 2" />
            <circle cx="65" cy="50" r="8" strokeDasharray="2 2" />
            <rect x="46" y="44" width="8" height="12" fill="currentColor" />
            <line x1="50" y1="30" x2="50" y2="70" strokeWidth="1" />
          </>
        )}
        {!isJoint && !isPlate && !isCuplock && !isClamp && (
          <>
            {/* Generic Scaffolding/Engineering Drawing */}
            <polygon points="50,15 85,75 15,75" strokeWidth="2" />
            <circle cx="50" cy="55" r="12" />
            <line x1="50" y1="15" x2="50" y2="75" strokeDasharray="2 2" />
          </>
        )}
      </svg>
      {/* Category Tag */}
      <span className="absolute bottom-1 right-2 text-[8px] font-mono text-blue-400 uppercase tracking-widest bg-slate-950/80 px-1 py-0.5 rounded border border-blue-900/30">
        CAD MODEL
      </span>
    </div>
  );
};

export default function ProductCatalog({ items, onAddProduct }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories extraction
  const categories = ['All', ...Array.from(new Set(catalogue.map((p) => p.category || 'Other')))];

  // Filtering products
  const filteredProducts = catalogue.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.hsn.includes(search) ||
                          (p.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      
      {/* Catalog Search & Filters Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <span>Product Catalog</span>
          </h2>
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
            {filteredProducts.length} Items Available
          </span>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, category, HSN..."
            className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
          />
        </div>

        {/* Category Quick Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Scrollable Items Area */}
      <div className="p-4 overflow-y-auto max-h-[550px] space-y-3 flex-1 bg-gray-50/20">
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No products found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
            {filteredProducts.map((p) => {
              const matchedItem = items.find((item) => item.productId === p.id);
              const isAdded = !!matchedItem;
              const quantityInCart = matchedItem?.quantity || 0;

              return (
                <div
                  key={p.id}
                  className={`group border rounded-xl p-3 flex flex-col justify-between transition-all duration-300 bg-white ${
                    isAdded
                      ? 'border-blue-200 shadow-sm shadow-blue-50/50 bg-blue-50/5'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-gray-100'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-md border" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {p.category}
                          </span>
                          {p.photoUrl && (
                            <a
                              href={p.photoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-400 hover:text-blue-600 p-0.5 transition-colors"
                              title="View photo on IndiaMART"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm mt-1 leading-tight group-hover:text-blue-900 transition-colors truncate" title={p.name}>
                          {p.name}
                        </h3>
                        {p.size && (
                          <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                            <span className="text-gray-400">Size:</span> {p.size}
                          </div>
                        )}
                        <div className="text-[11px] text-gray-450 font-medium mt-0.5">
                          HSN: <span className="text-gray-650 font-semibold">{p.hsn}</span>
                          {p.unitWeight ? ` • Weight: ${p.unitWeight} kg/pc` : ''}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rate</span>
                          <span className="font-extrabold text-blue-950 text-sm">
                            ₹{p.defaultRate.toLocaleString('en-IN')}
                            <span className="text-[11px] font-bold text-blue-600 ml-1">
                              ({p.unit.toUpperCase() === 'KG' ? 'Per KG' : p.unit.toUpperCase() === 'MTR' ? 'Per MTR' : p.unit.toUpperCase() === 'PCS' || p.unit.toUpperCase() === 'PIECE' ? 'Per PCS' : p.unit.toUpperCase() === 'NOS' ? 'Per NOS' : `Per ${p.unit}`})
                            </span>
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddProduct(p.id);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm ${
                            isAdded
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Added ({quantityInCart})</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Quotation</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
