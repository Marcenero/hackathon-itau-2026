"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { ArrowLeftIcon } from "./icons";

type QuantitativeFormProps = {
    survey: { id: number; title: string; question: string };
    onBack: () => void;
    onDone: () => void;
};

export default function QuantitativeForm({
    survey,
    onBack,
    onDone,
}: QuantitativeFormProps) {
    const [score, setScore] = useState<number | null>(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    async function enviar() {
        if (score === null || !text.trim()) return;

        setLoading(true);

        await fetch(`${API_URL}/surveys/${survey.id}/responses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                score,
                text,
                mode: "quantitativa",
            }),
        });

        setLoading(false);
        onDone();
    }

    return (
        <main className="min-h-[calc(100vh-73px)] bg-[#FFF8F3] px-6 py-12">
            <div className="mx-auto max-w-2xl">
                <div className="mb-4 flex items-center justify-between text-sm text-[#888]">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 font-medium text-[#666] hover:text-[#231F20]"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Voltar
                    </button>

                    <span>2 de 3</span>
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-[#EC7000]">
                            Pesquisa rápida
                        </p>

                        <h1 className="mt-1 text-2xl font-bold">
                            {survey.title}
                        </h1>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs text-[#666] shadow-sm">
                        ~ 2 min
                    </span>
                </div>

                <div className="rounded-3xl border border-[#EAEAEA] bg-white p-8 shadow-sm">
                    <p className="text-lg font-semibold leading-7">
                        {survey.question}
                    </p>

                    <p className="mt-2 text-sm text-[#777]">
                        Selecione uma nota de 1 a 10
                    </p>

                    <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                            <button
                                key={value}
                                onClick={() => setScore(value)}
                                className={`
                                    h-11 rounded-xl border font-semibold transition
                                    ${
                                        score === value
                                            ? "border-[#EC7000] bg-[#EC7000] text-white shadow-sm"
                                            : "border-[#DDD] bg-white text-[#444] hover:border-[#EC7000] hover:bg-[#FFF8F3]"
                                    }
                                `}
                            >
                                {value}
                            </button>
                        ))}
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-[#888]">
                        <span>Muito difícil</span>
                        <span>Muito fácil</span>
                    </div>

                    <div className="my-8 border-t" />

                    <label className="font-semibold">
                        Conte um pouco mais sobre sua experiência
                    </label>

                    <p className="mt-1 text-sm text-[#777]">
                        Sua resposta ajuda a entender o motivo da avaliação.
                    </p>

                    <textarea
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        rows={4}
                        maxLength={500}
                        placeholder="Ex.: demorei para encontrar o comprovante depois da transferência..."
                        className="mt-4 w-full resize-none rounded-xl border border-[#DDD] p-4 outline-none transition placeholder:text-[#AAA] focus:border-[#EC7000] focus:ring-2 focus:ring-[#EC7000]/10"
                    />

                    <div className="mt-1 text-right text-xs text-[#999]">
                        {text.length}/500
                    </div>

                    <button
                        onClick={enviar}
                        disabled={score === null || !text.trim() || loading}
                        className="mt-6 w-full rounded-xl bg-[#EC7000] py-3.5 font-semibold text-white transition hover:bg-[#C95F00] disabled:bg-[#CCC]"
                    >
                        {loading ? "Enviando..." : "Enviar feedback"}
                    </button>

                    <p className="mt-4 text-center text-xs text-[#999]">
                        Protótipo · nenhuma informação bancária real é utilizada
                    </p>
                </div>
            </div>
        </main>
    );
}
