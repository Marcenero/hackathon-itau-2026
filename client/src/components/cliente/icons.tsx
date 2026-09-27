type ThankYouProps = {
    points?: number;
};

export default function ThankYou({ points }: ThankYouProps) {
    return (
        <main className="flex min-h-[75vh] items-center justify-center bg-[#FFF8F3] px-6">
            <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-lg shadow-black/5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F6F0] text-2xl text-[#16865C]">
                    ✓
                </div>

                <h1 className="mt-6 text-2xl font-bold">
                    Obrigado pelo seu feedback
                </h1>

                <p className="mt-3 leading-6 text-[#666]">
                    Sua resposta foi registrada e poderá ajudar a melhorar
                    essa experiência.
                </p>

                {typeof points === "number" && (
                    <p className="mt-5 inline-flex items-center gap-1 rounded-full bg-[#FFF4D9] px-3 py-1 text-sm font-semibold text-[#8A5A00]">
                        ⭐ +{points} pts
                    </p>
                )}
            </div>
        </main>
    );
}
