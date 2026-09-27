type SentimentProps = {
    value: string;
};

export default function Sentiment({
    value,
}: SentimentProps) {
    const labels: Record<string, string> = {
        positivo: "● Positivo",
        neutro: "● Neutro",
        negativo: "● Negativo",
    };

    const styles: Record<string, string> = {
        positivo: "text-[#16865C]",
        neutro: "text-[#777777]",
        negativo: "text-[#C62828]",
    };

    return (
        <span
            className={`text-xs font-medium ${
                styles[value] ?? styles.neutro
            }`}
        >
            {labels[value] ?? value}
        </span>
    );
}