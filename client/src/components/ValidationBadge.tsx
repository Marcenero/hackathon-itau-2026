export default function ValidationBadge({
    status,
}: {
    status: string;
}) {
    if (status === "reviewed") {
        return (
            <span className="rounded-full bg-[#E8F6F0] px-3 py-1 text-xs font-semibold text-[#16865C]">
                ✓ Validado por humano
            </span>
        );
    }

    return (
        <span className="rounded-full bg-[#FFF0E4] px-3 py-1 text-xs font-semibold text-[#C95F00]">
            ✨ Sugestão da IA
        </span>
    );
}