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