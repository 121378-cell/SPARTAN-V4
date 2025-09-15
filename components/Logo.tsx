import React from 'react';

export const Logo = ({ className, showText = true }: { className?: string, showText?: boolean }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Spartan V4 Logo"
      >
        <path
          d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
          className="fill-primary"
        />
        <path
          d="M9.5 16L12 9L14.5 16M8.5 13.5H15.5"
          className="stroke-primary-foreground"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
          <span className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
            Spartan <span className="font-light text-muted-foreground">V4</span>
          </span>
      )}
    </div>
  );
};
