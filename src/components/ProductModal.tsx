import React from 'react';
import { Product } from '../types/quotation';
import { X, ExternalLink, Scale, HelpCircle } from 'lucide-react';

type Props = {
  product: Product;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: Props) {
  const unitWeight = product.unitWeightKg ?? product.unitWeight ?? 0;
  
  // Custom descriptions to provide rich content and specific details for the scaffolding systems
  const getProductSpecs = (p: Product) => {
    const nameLower = p.name.toLowerCase();
    
    if (nameLower.includes('standard')) {
      return {
        features: [
          'High tensile strength structural steel construction',
          'Heavy duty forged cups spaced at standard 500mm intervals',
          'Compatible with standard ledger sizes',
          'Rust-resistant oxide primer or hot-dip galvanized finish'
        ],
        specDetails: {
          'Material': 'Grade YST-210 / YST-310 Mild Steel',
          'Tube Diameter': '48.3 mm (OD)',
          'Tube Thickness': '3.2 mm or 4.0 mm',
          'Connection': 'Cuplock System',
          'Application': 'Vertical support for heavy shoring and access tower structures'
        }
      };
    }
    
    if (nameLower.includes('ledger')) {
      return {
        features: [
          'Robust ledger blades forged for secure wedge locking into standard cup units',
          'Rigid horizontal reinforcement bracing',
          'Accurately sized to establish consistent grid patterns',
          'Low maintenance and high reuse life'
        ],
        specDetails: {
          'Material': 'High-tensile Mild Steel Tube',
          'Tube Diameter': '48.3 mm (OD)',
          'Tube Thickness': '2.9 mm or 3.2 mm',
          'Connection': 'Forged Blade Ends',
          'Application': 'Horizontal framing ledger and guard rails for scaffolding structures'
        }
      };
    }
    
    if (nameLower.includes('chali') || nameLower.includes('plate') || nameLower.includes('sheet')) {
      return {
        features: [
          'Anti-slip perforated surface or checkered grid design',
          'Heavy-duty channel reinforcements underneath to prevent bending under load',
          'Pre-punched slots for drainage and wind resistance',
          'Secure lock hook ends to sit firmly on ledgers/standards'
        ],
        specDetails: {
          'Material': 'Structural Hot Rolled Sheet Steel',
          'Thickness': '14 Gauge / 16 Gauge Sheet Steel',
          'Width': p.size?.split('x')[0] || 'Standard Spec',
          'Length': p.size?.split('x')[1] || 'Standard Spec',
          'Load Capacity': 'Up to 250 kg/sqm (Class 3 Medium Duty)'
        }
      };
    }
    
    if (nameLower.includes('jack')) {
      return {
        features: [
          'Threaded adjustment rod with cast iron collar handle',
          'Solid base plate welded to the screw stem for load distribution',
          'Allows precise leveling on uneven ground (up to 350mm/450mm adjustments)',
          'Heavy galvanized threads to resist rust and grime'
        ],
        specDetails: {
          'Material': 'Threaded Solid Screw Steel / Hollow Jack Pipe',
          'Diameter': '32 mm or 36 mm Threaded Rod',
          'Adjustment range': '100 mm to 450 mm',
          'Load Capacity': 'Up to 4.5 Tonnes safe load limit'
        }
      };
    }

    if (nameLower.includes('clamp') || nameLower.includes('pin')) {
      return {
        features: [
          'Forged or pressed steel fittings with heavy duty T-bolts',
          'Ensures rigid perpendicular or adjustable angular pipe joints',
          'Non-slip grip texture to clamp OD 48.3mm pipes securely',
          'Standard hexagonal nuts matching standard scaffolding spanners'
        ],
        specDetails: {
          'Material': 'Drop Forged Mild Steel / Press Molded Sheet',
          'Bolt Size': 'M12 T-bolt with 21mm nut',
          'Fitting Compatibility': 'Fits OD 48.3 mm Steel pipes',
          'Joint Style': nameLower.includes('clamp') ? 'Swivel / Right-Angle Coupler' : 'Internal Joint Spigot'
        }
      };
    }

    // Default general steel accessory details
    return {
      features: [
        'Durable steel finish matching commercial scaffolding grades',
        'Standard dimensions according to IS 2750 / IS 1161 requirements',
        'Strict inspection for weld integrity and load rating',
        'Ready for deployment on industrial, infrastructure, or building projects'
      ],
      specDetails: {
        'Material': 'Standard Mild Steel',
        'Finishing': 'Rust protective primer coating',
        'Quality Standard': 'IS 2750 scaffolding standard certified',
        'Manufacturer': 'JMK Engineering & Developers'
      }
    };
  };

  const specs = getProductSpecs(product);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row md:max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Product Image & Blueprint tag */}
        <div className="w-full md:w-1/2 bg-slate-950 p-6 flex flex-col justify-between items-center relative min-h-[300px] md:min-h-auto">
          {/* Blueprint background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-25"></div>
          
          <div className="absolute top-4 left-4 z-10">
            <span className="text-[10px] font-mono font-extrabold text-blue-400 bg-blue-950/70 border border-blue-800/40 px-2 py-0.5 rounded tracking-widest uppercase">
              CAD SPEC SHEET
            </span>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer md:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* High resolution product image */}
          <div className="flex-1 flex items-center justify-center w-full z-10">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="max-h-[220px] md:max-h-[350px] object-contain rounded-lg border border-slate-800 shadow-lg"
              />
            ) : (
              <div className="w-48 h-48 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                <HelpCircle className="w-16 h-16 text-slate-700" />
              </div>
            )}
          </div>

          {/* Logistics weight warning badge at bottom left */}
          {unitWeight > 0 && (
            <div className="w-full mt-4 bg-slate-900/80 border border-slate-800/60 rounded-xl p-3 flex gap-2.5 items-center z-10">
              <div className="p-2 bg-blue-950 text-blue-400 rounded-lg flex-shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Unit Logistic Weight</span>
                <span className="text-sm font-extrabold text-white">{unitWeight.toFixed(2)} KG</span>
                <span className="text-[9px] text-slate-400 ml-1">({product.unit})</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Specs */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          {/* Close button for desktop */}
          <div className="hidden md:flex justify-end">
            <button 
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title & metadata */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                {product.category || 'General Scaffolding'}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2 leading-tight">
                {product.name}
              </h2>
            </div>

            {/* Spec Sheet Grid */}
            <div className="space-y-3.5 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Specifications</h3>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border border-gray-100 rounded-xl p-3 bg-slate-50/50">
                <div className="text-gray-500 font-medium">HSN/SAC Code:</div>
                <div className="text-slate-800 font-bold">{product.hsn || '7308'}</div>
                
                {product.size && (
                  <>
                    <div className="text-gray-500 font-medium">Standard Size:</div>
                    <div className="text-slate-800 font-bold">{product.size}</div>
                  </>
                )}
                
                {Object.entries(specs.specDetails).map(([key, value]) => (
                  <React.Fragment key={key}>
                    <div className="text-gray-500 font-medium">{key}:</div>
                    <div className="text-slate-800 font-bold truncate" title={String(value)}>{String(value)}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Core Features list */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Features</h3>
              <ul className="text-xs text-slate-650 space-y-1.5 list-disc pl-4 font-medium">
                {specs.features.map((feat, idx) => (
                  <li key={idx} className="leading-snug">{feat}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Call-to-action buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
            {product.photoUrl && (
              <a 
                href={product.photoUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                <span>View exact listing on IndiaMART</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all duration-200 uppercase tracking-wider cursor-pointer"
            >
              Back to Quotation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
