export function QuickActionCard({ icon, label, onClick, color }: any) {
    const colors: any = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
    }

    return (
        <div
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${colors[color] || colors.blue}`}
        >
            <div className={`p-3 rounded-full bg-white/5 mb-2`}>
                {icon}
            </div>
            <span className="text-xs font-semibold">{label}</span>
        </div>
    )
}
