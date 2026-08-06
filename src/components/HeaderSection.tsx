import React from 'react';

type Props = {
  companyName?: string;
  website?: string;
  logoUrl?: string;
};

export default function HeaderSection({ companyName = 'JMK ENGINEERING & DEVELOPER', website = 'https://www.indiamart.com/jmkengineeringdevelopers/', logoUrl }: Props) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div>
        <a href={website} target="_blank" rel="noreferrer" className="flex items-center gap-3">
          {logoUrl ? <img src={logoUrl} alt="logo" className="h-10 w-auto" /> : null}
          <div className="text-lg font-bold text-blue-800">{companyName}</div>
        </a>
        <div className="text-sm text-gray-600 font-medium">Scaffolding, Formwork & Construction Steel Structures</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold">GST Quotation</div>
      </div>
    </header>
  );
}
