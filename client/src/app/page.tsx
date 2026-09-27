import Link from "next/link";

export default function Home() {
    return (
        <main>
            <section className="bg-gradient-to-br from-[#FFF8F3] via-white to-[#EAF2F8]">
                <div className="mx-auto grid min-h-[620px] max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2">

                    <div>
                        <span className="inline-flex rounded-full bg-[#FFF0E4] px-3 py-1 text-sm font-semibold text-[#C95F00]">
                            Jornada de Agentes · Case C
                        </span>

                        <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-[#231F20]">
                            Feedback que vira
                            <span className="text-[#EC7000]">
                                {" "}entendimento.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-[#666]">
                            O Pulso ajuda squads a transformar respostas de clientes
                            em informações estruturadas, rastreáveis e prontas para
                            investigação.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/cliente"
                                className="rounded-xl bg-[#EC7000] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#C95F00]"
                            >
                                Simular experiência do cliente
                            </Link>

                            <Link
                                href="/squad"
                                className="rounded-xl border border-[#003C7A] bg-white px-6 py-3 font-semibold text-[#003C7A] transition hover:bg-[#EAF2F8]"
                            >
                                Abrir dashboard
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[#E5E5E5] bg-white p-8 mt-10 shadow-xl shadow-black/5">
                        <p className="text-sm font-semibold text-[#003C7A]">
                            Como o Pulso funciona
                        </p>

                        <div className="mt-6 space-y-5">
                            <FlowStep
                                number="1"
                                title="Cliente compartilha"
                                description="Uma pesquisa curta captura a experiência."
                            />

                            <FlowStep
                                number="2"
                                title="Pulso interpreta"
                                description="A IA estrutura linguagem natural dentro de categorias controladas."
                            />

                            <FlowStep
                                number="3"
                                title="Sistema calcula"
                                description="Métricas e percentuais são calculados deterministicamente."
                            />

                            <FlowStep
                                number="4"
                                title="Squad decide"
                                description="Insights permanecem rastreáveis e sujeitos à revisão humana."
                            />
                        </div>

                        <div className="mt-8 rounded-xl bg-[#003C7A] p-4 text-center text-sm font-medium text-white">
                            IA interpreta · sistema calcula · humano decide
                        </div>
                    </div>
                </div>
            </section>

            <footer className="border-t bg-white px-6 py-5 text-center text-xs text-[#777]">
                Protótipo desenvolvido para o Hackathon Itaú 2026 ·
                Dados utilizados exclusivamente para demonstração
            </footer>
        </main>
    );
}

function FlowStep({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF0E4] font-bold text-[#EC7000]">
                {number}
            </div>

            <div>
                <p className="font-semibold text-[#231F20]">
                    {title}
                </p>

                <p className="mt-1 text-sm leading-6 text-[#666]">
                    {description}
                </p>
            </div>
        </div>
    );
}