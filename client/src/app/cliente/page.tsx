"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

export default function ClientePage() {
    const [survey, setSurvey] = useState<any>(null);
    const [score, setScore] = useState<number | null>(null);
    const [text, setText] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/surveys/1`)
            .then((response) => response.json())
            .then(setSurvey);
    }, []);

    async function enviar() {
        if (score === null || !text.trim()) return;

        setLoading(true);

        await fetch(`${API_URL}/surveys/1/responses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                score,
                text,
            }),
        });

        setLoading(false);
        setSent(true);
    }

    if (!survey) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center">
                <p className="text-[#666]">
                    Carregando pesquisa...
                </p>
            </main>
        );
    }

    if (sent) {
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
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100vh-73px)] bg-[#FFF8F3] px-6 py-12">
            <div className="mx-auto max-w-2xl">

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
                        ~ 30 segundos
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
                        {[1,2,3,4,5,6,7,8,9,10].map((value) => (
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
                        disabled={
                            score === null ||
                            !text.trim() ||
                            loading
                        }
                        className="mt-6 w-full rounded-xl bg-[#EC7000] py-3.5 font-semibold text-white transition hover:bg-[#C95F00] disabled:bg-[#CCC]"
                    >
                        {loading
                            ? "Enviando..."
                            : "Enviar feedback"}
                    </button>

                    <p className="mt-4 text-center text-xs text-[#999]">
                        Protótipo · nenhuma informação bancária real é utilizada
                    </p>
                </div>
            </div>
        </main>
    );
}