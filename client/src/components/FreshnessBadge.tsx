type Props = {
    status: string;
    lastResponseAt: string | null;
    validityDays: number;
};

function formatAge(date: string) {
    const diff =
        Date.now() - new Date(date).getTime();

    const hours = Math.floor(
        diff / 1000 / 60 / 60
    );

    if (hours < 1) {
        return "há menos de 1h";
    }

    if (hours < 24) {
        return `há ${hours}h`;
    }

    const days = Math.floor(hours / 24);

    return `há ${days} dia${days !== 1 ? "s" : ""}`;
}

export default function FreshnessBadge({
    status,
    lastResponseAt,
    validityDays,
}: Props) {
    if (!lastResponseAt) {
        return (
            <div className="rounded-2xl border bg-white p-5">
                <p className="font-semibold text-[#666]">
                    Sem dados recentes
                </p>
            </div>
        );
    }

    const configs: Record<
        string,
        {
            label: string;
            classes: string;
        }
    > = {
        current: {
            label: "Dados atuais",
            classes:
                "bg-[#E8F6F0] text-[#16865C]",
        },

        attention: {
            label: "Atenção ao frescor",
            classes:
                "bg-[#FFF4D9] text-[#8A5A00]",
        },

        revalidate: {
            label: "Considerar revalidar",
            classes:
                "bg-[#FDECEC] text-[#C62828]",
        },
    };

    const config =
        configs[status] ?? configs.current;

    return (
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
            <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${config.classes}`}
            >
                {config.label}
            </span>

            <p className="mt-3 text-sm text-[#555]">
                Atualizado {formatAge(lastResponseAt)}
            </p>

            <p className="mt-1 text-xs text-[#999]">
                Validade configurada: {validityDays} dias
            </p>
        </div>
    );
}