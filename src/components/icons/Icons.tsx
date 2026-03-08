interface IconProps {
    className?: string;
    strokeWidth?: number;
    strokeLength?: number;
}

export function SquareIcon({ className = "w-6 h-6", strokeWidth = 2 }: IconProps) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill={strokeWidth > 0 ? "none" : "currentColor"} 
              stroke={strokeWidth > 0 ? "currentColor" : "none"} 
              strokeWidth={strokeWidth} 
              d="M4.5 4.5 h15v15h-15z"/>
      </svg>
    );
}

export function MapPinIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}

export function StarIcon({ className = "w-6 w-6" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path 
        fill="currentColor" 
        d="M6.4 11.2H8v1.6H6.4v-1.6Zm0 1.6H8v1.6H6.4v-1.6Zm1.6 0h1.6v1.6H8v-1.6Zm0-1.6h1.6v1.6H8v-1.6Zm0-1.6h1.6v1.6H8V9.6Zm-1.6 0H8v1.6H6.4V9.6Zm3.2 1.6h1.6v1.6H9.6v-1.6Zm0 1.6h1.6v1.6H9.6v-1.6Zm0 1.6h1.6V16H9.6v-1.6Zm-1.6 0h1.6V16H8v-1.6ZM9.6 8h1.6v1.6H9.6V8Zm0-1.6h1.6V8H9.6V6.4Zm1.6 0h1.6V8h-1.6V6.4Zm1.6 0h1.6V8h-1.6V6.4Zm0 1.6h1.6v1.6h-1.6V8Zm-1.6 0h1.6v1.6h-1.6V8Zm0-3.2h1.6v1.6h-1.6V4.8Zm1.6 0h1.6v1.6h-1.6V4.8Zm1.6 0H16v1.6h-1.6V4.8Zm0 1.6H16V8h-1.6V6.4ZM8 4.8h1.6v1.6H8V4.8Zm-1.6 0H8v1.6H6.4V4.8Zm0-1.6H8v1.6H6.4V3.2Zm0-1.6H8v1.6H6.4V1.6Zm1.6 0h1.6v1.6H8V1.6Zm0 1.6h1.6v1.6H8V3.2Zm-3.2 0h1.6v1.6H4.8V3.2Zm0-1.6h1.6v1.6H4.8V1.6Zm0-1.6h1.6v1.6H4.8V0Zm1.6 0H8v1.6H6.4V0ZM4.8 6.4h1.6V8H4.8V6.4Zm0 1.6h1.6v1.6H4.8V8ZM3.2 8h1.6v1.6H3.2V8ZM1.6 8h1.6v1.6H1.6V8Zm0-1.6h1.6V8H1.6V6.4Zm1.6 0h1.6V8H3.2V6.4Zm0 3.2h1.6v1.6H3.2V9.6Zm-1.6 0h1.6v1.6H1.6V9.6ZM0 9.6h1.6v1.6H0V9.6ZM0 8h1.6v1.6H0V8Z"
      />
    </svg>
  );
}