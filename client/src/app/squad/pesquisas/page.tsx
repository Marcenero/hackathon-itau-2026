"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

type SurveyType =
    | "qualitative"
    | "quantitative"
    | "discovery";

export default function PesquisasPage() {
    const [type, setType] =
        useState<SurveyType | null>(null);

    const [title, setTitle] =
        useState("");

    const [question, setQuestion] =
        useState("");

    const [context, setContext] =
        useState("");

    const [profile, setProfile] =
        useState("");

    const [validityDays, setValidityDays] =
        useState(30);

    const [options, setOptions] = useState([
        "",
        "",
        "",
        "",
    ]);

    async function criarPesquisa() {
        const response = await fetch(
            `${API_URL}/surveys`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    title,
                    question,
                    survey_type: type,
                    context:
                        context || null,

                    profile:
                        type === "discovery"
                            ? profile
                            : null,

                    options:
                        type === "quantitative"
                            ? options
                            : null,

                    validity_days:
                        validityDays,

                    score_mode:
                        type === "qualitative"
                            ? "inferred"
                            : "explicit",
                }),
            }
        );

        const result =
            await response.json();

        console.log(
            "Pesquisa criada:",
            result
        );

        {type && (
            <div className="mt-8 rounded-3xl border bg-white p-8">

                <button
                    onClick={() => setType(null)}
                    className="text-sm font-semibold text-[#003C7A]"
                >
                    ← Escolher outro template
                </button>

                <h1 className="mt-5 text-2xl font-bold">
                    Configurar pesquisa
                </h1>

                <label className="mt-6 block font-semibold">
                    Título
                </label>

                <input
                    value={title}
                    onChange={(e) =>
                        setTitle(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border p-3"
                />

                <label className="mt-5 block font-semibold">
                    Pergunta-base
                </label>

                <textarea
                    value={question}
                    onChange={(e) =>
                        setQuestion(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border p-3"
                />

                {type === "qualitative" && (
                    <>
                        <label className="mt-5 block font-semibold">
                            Contexto / objetivo
                        </label>

                        <textarea
                            value={context}
                            onChange={(e) =>
                                setContext(
                                    e.target.value
                                )
                            }
                            className="mt-2 w-full rounded-xl border p-3"
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
                            onChange={(e) =>
                                setProfile(
                                    e.target.value
                                )
                            }
                            className="mt-2 w-full rounded-xl border p-3"
                        />

                        <label className="mt-5 block font-semibold">
                            Hipótese / contexto
                        </label>

                        <textarea
                            value={context}
                            onChange={(e) =>
                                setContext(
                                    e.target.value
                                )
                            }
                            className="mt-2 w-full rounded-xl border p-3"
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
                                (
                                    option,
                                    index
                                ) => (
                                    <input
                                        key={index}
                                        value={option}
                                        onChange={(
                                            e
                                        ) => {
                                            const next =
                                                [
                                                    ...options,
                                                ];

                                            next[
                                                index
                                            ] =
                                                e.target.value;

                                            setOptions(
                                                next
                                            );
                                        }}
                                        placeholder={`Alternativa ${
                                            index + 1
                                        }`}
                                        className="rounded-xl border p-3"
                                    />
                                )
                            )}
                        </div>
                    </div>
                )}

                <label className="mt-5 block font-semibold">
                    Validade da pesquisa
                </label>

                <input
                    type="number"
                    value={validityDays}
                    min={1}
                    onChange={(e) =>
                        setValidityDays(
                            Number(
                                e.target.value
                            )
                        )
                    }
                    className="mt-2 w-32 rounded-xl border p-3"
                />

                <button
                    onClick={criarPesquisa}
                    className="mt-8 w-full rounded-xl bg-[#EC7000] py-3 font-semibold text-white hover:bg-[#C95F00]"
                >
                    Criar pesquisa
                </button>

            </div>
        )}
    }
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
                Selecionar →
            </span>
        </button>
    );
}