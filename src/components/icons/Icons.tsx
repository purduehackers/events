interface IconProps {
    className?: string;
    strokeWidth?: number;
    strokeLength?: number;
}

export function XIcon({ className = "w-6 h-6", strokeWidth = 4 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinejoin="round" strokeWidth={strokeWidth} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
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

export function StarIcon2({ className = "w-6 w-6" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path 
        fill="currentColor" 
        d="M6.7 0H8v1.3H6.7V0Zm0 1.3H8v1.4H6.7V1.3Zm0 1.4H8V4H6.7V2.7Zm0 1.3H8v1.3H6.7V4Zm0 1.3H8v1.4H6.7V5.3Zm1.3 0h1.3v1.4H8V5.3ZM8 4h1.3v1.3H8V4Zm0-1.3h1.3V4H8V2.7Zm0-1.4h1.3v1.4H8V1.3ZM8 0h1.3v1.3H8V0ZM6.7 9.3H8v1.4H6.7V9.3Zm1.3 0h1.3v1.4H8V9.3Zm0 1.4h1.3V12H8v-1.3ZM8 12h1.3v1.3H8V12Zm0 1.3h1.3v1.4H8v-1.4Zm0 1.4h1.3V16H8v-1.3Zm-1.3 0H8V16H6.7v-1.3Zm0-1.4H8v1.4H6.7v-1.4Zm0-1.3H8v1.3H6.7V12Zm0-1.3H8V12H6.7v-1.3Zm2.6-4h1.4V8H9.3V6.7Zm0 1.3h1.4v1.3H9.3V8Zm1.4 0H12v1.3h-1.3V8ZM12 8h1.3v1.3H12V8Zm1.3 0h1.4v1.3h-1.4V8Zm1.4 0H16v1.3h-1.3V8Zm0-1.3H16V8h-1.3V6.7Zm-1.4 0h1.4V8h-1.4V6.7Zm-1.3 0h1.3V8H12V6.7Zm-1.3 0H12V8h-1.3V6.7Zm-5.4 0h1.4V8H5.3V6.7Zm0 1.3h1.4v1.3H5.3V8ZM4 8h1.3v1.3H4V8ZM2.7 8H4v1.3H2.7V8ZM1.3 8h1.4v1.3H1.3V8Zm0-1.3h1.4V8H1.3V6.7Zm1.4 0H4V8H2.7V6.7Zm1.3 0h1.3V8H4V6.7Zm-4 0h1.3V8H0V6.7ZM0 8h1.3v1.3H0V8Z"
      />
    </svg>
  );
}