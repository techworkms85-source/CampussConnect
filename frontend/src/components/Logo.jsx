import React from 'react';

export default function Logo({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background square */}
      <rect width="64" height="64" rx="8" fill="#2563EB" />

      {/* Three nodes representing campus connect */}
      {/* Center node */}
      <circle cx="32" cy="32" r="5" fill="white" />
      {/* Top-left node */}
      <circle cx="16" cy="20" r="4" fill="white" fillOpacity="0.85" />
      {/* Top-right node */}
      <circle cx="48" cy="20" r="4" fill="white" fillOpacity="0.85" />
      {/* Bottom-left node */}
      <circle cx="16" cy="46" r="4" fill="white" fillOpacity="0.85" />
      {/* Bottom-right node */}
      <circle cx="48" cy="46" r="4" fill="white" fillOpacity="0.85" />

      {/* Connection lines from center to each node */}
      <line x1="32" y1="32" x2="16" y2="20" stroke="white" strokeWidth="1.8" strokeOpacity="0.6" />
      <line x1="32" y1="32" x2="48" y2="20" stroke="white" strokeWidth="1.8" strokeOpacity="0.6" />
      <line x1="32" y1="32" x2="16" y2="46" stroke="white" strokeWidth="1.8" strokeOpacity="0.6" />
      <line x1="32" y1="32" x2="48" y2="46" stroke="white" strokeWidth="1.8" strokeOpacity="0.6" />

      {/* Cross connections top */}
      <line x1="16" y1="20" x2="48" y2="20" stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
      {/* Cross connections bottom */}
      <line x1="16" y1="46" x2="48" y2="46" stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
      {/* Cross connections left */}
      <line x1="16" y1="20" x2="16" y2="46" stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
      {/* Cross connections right */}
      <line x1="48" y1="20" x2="48" y2="46" stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
    </svg>
  );
}
