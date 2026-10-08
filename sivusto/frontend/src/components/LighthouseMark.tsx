export default function LighthouseMark({ className = "h-7 w-7" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
    aria-hidden="true"
    className={`${className} text-[#1D90F4]`}
    fill="none"
    >
    <path
        d="M9 21h6M8 21l1-13h6l1 13M9.5 8h5M10 4.5h4L12 2z"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    />
    <path
        d="M4 9l3 1.2M20 9l-3 1.2"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
        />
        </svg>
);
}