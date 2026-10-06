"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

type SurveyType =
    | "qualitative"
    | "quantitative"
    | "discovery";

export default function PesquisasPage() {
    const [type, setType] =useState<SurveyType | null>(null);
    const [title, setTitle] = useState("");
    const [question, setQuestion] = useState("");
    const [context, setContext] = useState("");
    const [profile, setProfile] = useState("");
    const [validityDays, setValidityDays] = useState(30);

    const [options, setOptions] = useState([
        "",
        "",
        "",
        "",
    ]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function criarPesquisa() {
        if (!type || !title.trim() || !question.trim()) {
            setMessage("Preencha o tipo, o título e a pergunta da pesquisa.");

            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/surveys`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        title,
                        question,
                        survey_type: type,
                        context: context.trim() || null,
                        profile: type === "discovery"
                            ? profile.trim() || null
                            : null,
                        options: type === "quantitative"
                            ? options.filter(
                                (option) =>
                                    option.trim() !== ""
                                )
                            : null,
                        validity_days: validityDays,
                        score_mode: type === "qualitative"
                            ? "inferred"
                            : "explicit",
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                console.error("Erro ao criar pesquisa:", result);

                setMessage(result.detail ?? "Não foi possível criar a pesquisa.");

                return;
            }

            console.log("Pesquisa criada:", result);

            setMessage(`Pesquisa "${result.title}" criada com sucesso!`);

            setTitle("");
            setQuestion("");
            setContext("");
            setProfile("");
            setValidityDays(30);

            setOptions([
                "",
                "",
                "",
                "",            
            ]);
        } catch (error) {
            console.error(error);

            setMessage("Não foi possível conectar ao servidor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#fff8f3] px-6 py-10">
            <div className="mx-auto max-w-5xl">
                <p className="text-sm font-semibold text-[#ec7000]">
                    Pesquisas
                </p>

                <h1 className="mt-1 text-3xl font-bold">
                    Criar nova pesquisa
                </h1>

                {!type && (
                    <>
                        <p className="mt-2 text-[#666]">
                            Escolha o tipo de pesquisa que deseja criar.
                        </p>

                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <TemplateCard 
                                title="Qualitativa"
                                description="Colete feedbacks abertos e identifique padrões com o Pulso."
                                onClick={() =>
                                    setType("qualitative")
                                }
                            />

                            <TemplateCard 
                                title="Quantitativa"
                                description="Colete respostas estruturadas utilizando alternativas."
                                onClick={() =>
                                    setType("quantitative")
                                }
                            />

                            <TemplateCard 
                                title="Discovery"
                                description="Investigue hipóteses e necessidades de um público específico."
                                onClick={() =>
                                    setType("discovery")
                                }
                            />
                        </div>
                    </>
                )}

                {type && (
                    <div className="mt-8 rounded-3xl border bg-white p-8">
                        <button
                            onClick={() => {
                                setType(null);
                                setMessage("");
                            }}
                            className="text-sm font-semibold text-[#003c7a]"
                        >
                            &larr; Escolher outro template
                        </button>

                        <h2 className="mt-5 text-2xl font-bold">
                            Configurar pesquisa
                        </h2>

                        <p className="mt-2 text-sm text-[#666]">
                            Tipo selecionado:{" "}
                            <span className="font-semibold">
                                {getTypeLabel(type)}
                            </span>
                        </p>

                        <label className="mt-6 block font-semibold">
                            Título
                        </label>

                        <input 
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            placeholder="Ex.: Experiência com Pix"
                            className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#ec7000]"
                        />

                        <label className="mt-5 block font-semibold">
                            Pergunta-base
                        </label>

                        <textarea 
                            value={question}
                            onChange={(event) =>
                                setQuestion(event.target.value)
                            }
                            placeholder="Ex.: Como você avalia sua experiência?"
                            rows={3}
                            className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#ec7000]"
                        />

                        {type === "qualitative" && (
                            <>
                                <label className="mt-5 block font-semibold">
                                    Contexto / Objetivo
                                </label>

                                <textarea 
                                    value={context}
                                    onChange={(event) =>
                                        setContext(event.target.value)
                                    }
                                    placeholder="O que a squad deseja entender com esta pesquisa?"
                                    rows={3}
                                    className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#ec7000]"
                                />
                            </>
                        )}

                        {type === "discovery" && (
                            <>
                                <label className="mt-5 block font-semibold">
                                    Perfil do público
                                </label>

                                <input 
                                    value={profile}
                                    onChange={(event) =>
                                        setProfile(event.target.value)
                                    }
                                    placeholder="Ex.: Clientes que realizaram Pix nos últimos 30 dias"
                                    className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#ec7000]"
                                />

                                <label className="mt-5 block font-semibold">
                                    Hipótese / Contexto
                                </label>

                                <textarea 
                                    value={context}
                                    onChange={(event) =>
                                        setContext(event.target.value)
                                    }
                                    placeholder="Qual hipótese a squad deseja investigar?"
                                    rows={3}
                                    className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#ec7000]"
                                />
                            </>
                        )}

                        {type === "quantitative" && (
                            <div className="mt-5">
                                <p className="font-semibold">
                                    Alternativas
                                </p>

                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    {options.map(
                                        (option, index) => (
                                            <input 
                                                key={index}
                                                value={option}
                                                onChange={(event) => {
                                                    const next = [
                                                        ...options,
                                                    ];

                                                    next[index] = event.target.value;

                                                    setOptions(next);
                                                }}
                                                placeholder={`Alternativa ${index+1}`}
                                                className="rounded-xl border p-3 outline-none focus:border-[#ec7000]"
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        <label className="mt-5 block font-semibold">
                            Validade da pesquisa
                        </label>

                        <div className="mt-2 flex items-center gap-2">
                            <input 
                                type="number"
                                value={validityDays}
                                min={1}
                                onChange={(event) =>
                                    setValidityDays(Number(event.target.value))
                                }
                                className="w-32 rounded-xl border p-3 outline-none focus:border-[#ec7000]"
                            />

                            <span className="text-sm text-[#666]">
                                dias
                            </span>
                        </div>

                        {message && (
                            <p className="mt-5 rounded-xl bg-[#fff8f3] p-4 text-sm text-[#555]">
                                {message}
                            </p>
                        )}

                        <button
                            onClick={criarPesquisa}
                            disabled={loading}
                            className="mt-8 w-full rounded-xl bg-[#ec7000] py-3 font-semibold text-white transition hover:bg-[#c95f00] disabled:bg-[#ccc]"
                        >
                            {loading
                                ? "Criando pesquisa..."
                                : "Criar pesquisa"
                            }
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

function getTypeLabel(type: SurveyType) {
    const labels: Record<
        SurveyType,
        string
    > = {
        qualitative: "Qualitativa",
        quantitative: "Quantitativa",
        discovery: "Discovery",
    };

    return labels[type];
}

function TemplateCard({
    title,
    description,
    onClick,
}: {
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="rounded-2xl border border-[#DDD] bg-white p-6 text-left transition hover:-translate-y-1 hover:border-[#003C7A] hover:shadow-md"
        >
            <h2 className="font-semibold text-[#003C7A]">
                {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#666]">
                {description}
            </p>

            <span className="mt-5 inline-block text-sm font-semibold text-[#EC7000]">
                Selecionar &rarr;
            </span>
        </button>
    );
}