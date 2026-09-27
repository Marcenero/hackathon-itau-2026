export function BarsIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <rect x="4" y="12" width="4" height="8" rx="1" fill="currentColor" />
            <rect x="10" y="8" width="4" height="12" rx="1" fill="currentColor" />
            <rect x="16" y="4" width="4" height="16" rx="1" fill="currentColor" />
        </svg>
    );
}

export function ChatBubbleIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V6Z"
                fill="currentColor"
            />
        </svg>
    );
}

export function PeopleIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <circle cx="9" cy="8" r="3" fill="currentColor" />
            <circle cx="17" cy="9" r="2.4" fill="currentColor" opacity="0.7" />
            <path
                d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M15.5 14.2c2.5.4 4.5 2.6 4.5 5.3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function ArrowLeftIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M15 5 8 12l7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function SendIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M4 12h15m0 0-6-6m6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}