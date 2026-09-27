type CategoryBadgeProps = {
    category: string;
};

const styles: Record<string, string> = {
    navegacao: "bg-[#EAF2F8] text-[#003C7A]",
    clareza: "bg-[#FFF4D9] text-[#8A5A00]",
    performance: "bg-[#F1ECFF] text-[#5C3D99]",
    erro: "bg-[#FDECEC] text-[#C62828]",
    elogio: "bg-[#E8F6F0] text-[#16865C]",
    outro: "bg-[#EFEFEF] text-[#555555]",
};

const labels: Record<string, string> = {
    navegacao: "Navegação",
    clareza: "Clareza",
    performance: "Performance",
    erro: "Erro",
    elogio: "Elogio",
    outro: "Outro",
};

export default function CategoryBadge({
    category,
}: CategoryBadgeProps) {
    const normalizedCategory = category
        .trim()
        .toLowerCase();

    return (
        <span
            className={`
                inline-flex
                items-center
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                ${styles[normalizedCategory] ?? styles.outro}
            `}
        >
            {labels[normalizedCategory] ?? category}
        </span>
    );
}