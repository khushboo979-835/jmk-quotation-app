import React from 'react';
import { MapPin, Phone, Building2, Globe } from 'lucide-react';

type Props = {
  companyName?: string;
  website?: string;
  logoUrl?: string;
};

export default function HeaderSection({ 
  companyName = 'JMK ENGINEERING & DEVELOPER', 
  website = 'https://www.indiamart.com/jmkengineeringdevelopers/', 
  logoUrl = '/jmk-logo.png' 
}: Props) {
  return (
    <header className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 md:p-6 mb-6 shadow-md border border-slate-800 transition-all duration-300">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        
        {/* Left Side: Brand Logo, Name & Tagline */}
        <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <a 
            href={website} 
            target="_blank" 
            rel="noreferrer" 
            className="group flex-shrink-0 relative focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
          >
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <img 
              src={logoUrl} 
              alt={`${companyName} Logo`} 
              className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover border-2 border-blue-400/50 group-hover:border-blue-400 group-hover:scale-105 transition-all duration-300 shadow-lg relative z-10"
            />
          </a>
          
          <div className="text-center sm:text-left space-y-1.5">
            <a 
              href={website} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-block group focus:outline-none"
            >
              <h1 className="text-lg md:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-200 group-hover:from-blue-200 group-hover:to-white transition-all duration-300">
                {companyName}
              </h1>
            </a>
            <p className="text-xs md:text-sm text-blue-300/90 font-medium tracking-wide">
              Scaffolding, Formwork & Construction Steel Structures
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-1 text-[11px] font-semibold text-slate-400">
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>Quality • Strength • Reliability</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Office Contact, GSTIN & Address Info */}
        <div className="flex-shrink-0 lg:w-[45%] flex flex-col justify-between gap-3 text-xs text-slate-300 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-6">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-slate-200">Registered Office:</span>{' '}
              MAUZA JHALI, CIRCLE KANKARBAGH, 50B, WARD 55 P.NO-2167078, JAKARIYAPUR, TRINITY GLOBAL SCHOOL, ROAD NO 3, PATNA, BIHAR - 800007
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Seller Identity</span>
              </div>
              <div className="font-semibold text-slate-200">
                GSTIN: <span className="text-blue-300">10BIEPD2766D2ZX</span>
              </div>
              <div className="font-semibold text-slate-200">
                PAN: <span className="text-blue-300">BIEPD2766D</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Contact Details</span>
              </div>
              <a 
                href="tel:+917493916194" 
                className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                +91 74939 16194
              </a>
              <div className="text-[10px] text-slate-400 font-medium">State: Bihar (10)</div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
