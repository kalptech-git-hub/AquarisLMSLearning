const CircularProgress = ({ percentage }) => {
    const radius = 22;
    const strokeWidth = 4.5;

    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg
                height="48"
                width="48"
                className="-rotate-90 drop-shadow-sm"
            >
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>

                {/* Background Circle */}
                <circle
                    stroke="rgba(255, 255, 255, 0.15)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={normalizedRadius}
                    cx="24"
                    cy="24"
                />

                {/* Progress Circle */}
                <circle
                    stroke="url(#progressGradient)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    r={normalizedRadius}
                    cx="24"
                    cy="24"
                    className="transition-all duration-500 ease-out"
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-pink-400">
                {percentage}%
            </div>
        </div>
    );
};

export default CircularProgress;