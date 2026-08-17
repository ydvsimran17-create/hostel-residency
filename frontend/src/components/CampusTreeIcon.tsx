import React from 'react';

interface CampusTreeIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function CampusTreeIcon({ className = 'h-6 w-6', ...props }: CampusTreeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Main Trunk */}
      <path d="M12 22V13" strokeWidth="2.2" />

      {/* Outer Slanted House Roof branches */}
      <path d="M12 3.5L2 12" strokeWidth="2" />
      <path d="M12 3.5L22 12" strokeWidth="2" />

      {/* Horizontal house floor Support branch */}
      <path d="M5.5 12C5.5 12 8 11.5 12 11.5C16 11.5 18.5 12 18.5 12" strokeWidth="1.5" />

      {/* Inner Growing branches */}
      <path d="M12 13.5L16.5 9" strokeWidth="1.5" />
      <path d="M12 13.5L7.5 9" strokeWidth="1.5" />
      <path d="M12 11.5V6" strokeWidth="1.5" />

      {/* Little elegant circular leaves representing growth & community */}
      <circle cx="12" cy="4" r="1.8" className="fill-current text-[#567A5E]" stroke="none" />
      <circle cx="7.5" cy="8.5" r="1.5" className="fill-current text-[#567A5E]" stroke="none" />
      <circle cx="16.5" cy="8.5" r="1.5" className="fill-current text-[#567A5E]" stroke="none" />
      <circle cx="3" cy="11.5" r="1.5" className="fill-current text-[#47664f]" stroke="none" />
      <circle cx="21" cy="11.5" r="1.5" className="fill-current text-[#47664f]" stroke="none" />
    </svg>
  );
}
