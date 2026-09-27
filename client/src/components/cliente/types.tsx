"use client";

import { useState } from "react";
import type { SurveyMode } from "./types";
import { BarsIcon, ChatBubbleIcon, PeopleIcon } from "./cliente/icons";

type SurveyTypeSelectProps = {
    onSelect: (mode: SurveyMode) => void;
};

const OPTIONS: Array<{
    mode: SurveyMode;
    title: string;
    description: string;
    time: string;
    points: number;
    Icon: (props: { className?: string }) => React.ReactElement;
}> = [
    {
        mode: "quantitativa",
        title: "Pesquisa quantitativa",
        description: "Responda algumas perguntas rápidas sobre sua experiência.",
        time: "~ 2 min",
        points: 10,
        Icon: BarsIcon,
    },
    {
        mode: "qualitativa",
        title: "Pesquisa qualitativa",
        description: "Conte um pouco mais sobre sua experiência e o que você achou.",
        time: "~ 5 min",
        points: 25,
        Icon: ChatBubbleIcon,
    },
    {
        mode: "discovery",
        title: "Discovery Interview",
        description: "Uma conversa guiada para entendermos melhor o seu contexto.",
        time: "~ 8 min",
        points: 50,
        Icon: PeopleIcon,
    },
];

export default function SurveyTypeSelect({
    onSelect,
}: SurveyTypeSelectProps) {
    const [selected, setSelected] = useState<SurveyMode>("quantitativa");

    return (
        <main className="min-h-[calc(100vh-73px)] bg-[#FFF8F3] px-6 py-10">
            <div className="mx-auto max-w-xl">
                <div className="mb-2 flex items-center justify-between text-sm text-[#888]">
                    <span className="font-medium text-[#666]">
                        Pesquisa · Squad Pix
                    </span>
                    <span>1 de 3</span>
                </div>

                <div className="rounded-3xl border border-[#EAEAEA] bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#231F20]">
                        Vamos ouvir você! 👋
                    </h1>

                    <p className="mt-2 leading-6 text-[#666]">
                        Escolha o tipo de pesquisa que mais combina com o que
                        você gostaria de compartilhar.
                    </p>

                    <div className="mt-6 space-y-3">
                        {OPTIONS.map((option) => {
                            const isSelected = selected === option.mode;

                            return (
                                <button
                                    key={option.mode}
                                    type="button"
                                    onClick={() => setSelected(option.mode)}
                                    className={`
                                        flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition
                                        ${
                                            isSelected
                                                ? "border-[#EC7000] bg-[#FFF8F3] ring-1 ring-[#EC7000]"
                                                : "border-[#E5E5E5] bg-white hover:border-[#EC7000]/50"
                                        }
                                    `}
                                >
                                    <span
                                        className={`
                                            mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
                                            ${
                                                isSelected
                                                    ? "border-[#EC7000] bg-[#EC7000]"
                                                    : "border-[#CCC]"
                                            }
                                        `}
                                    >
                                        {isSelected && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                        )}
                                    </span>

                                    <span
                                        className={`
                                            flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                                            ${
                                                isSelected
                                                    ? "bg-[#EC7000] text-white"
                                                    : "bg-[#F2F2F2] text-[#666]"
                                            }
                                        `}
                                    >
                                        <option.Icon className="h-5 w-5" />
                                    </span>

                                    <span className="flex-1">
                                        <span className="block font-semibold text-[#231F20]">
                                            {option.title}
                                        </span>

                                        <span className="mt-1 block text-sm leading-5 text-[#777]">
                                            {option.description}
                                        </span>

                                        <span className="mt-3 flex items-center gap-2">
                                            <span className="rounded-full bg-[#F2F2F2] px-2.5 py-1 text-xs font-medium text-[#666]">
                                                {option.time}
                                            </span>

                                            <span className="flex items-center gap-1 rounded-full bg-[#FFF4D9] px-2.5 py-1 text-xs font-semibold text-[#8A5A00]">
                                                ⭐ +{option.points} pts
                                            </span>
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#EAF2F8] p-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EC7000] font-bold text-white">
                            P
                        </span>

                        <p className="text-sm leading-6 text-[#003C7A]">
                            Oi! Eu sou o Pulso, seu agente de pesquisa. Vou te
                            fazer algumas perguntas e, se precisar, podemos
                            conversar mais sobre o assunto, tá?
                        </p>
                    </div>

                    <button
                        onClick={() => onSelect(selected)}
                        className="mt-6 w-full rounded-xl bg-[#EC7000] py-3.5 font-semibold text-white transition hover:bg-[#C95F00]"
                    >
                        Começar pesquisa
                    </button>

                    <p className="mt-4 text-center text-xs text-[#999]">
                        Protótipo · nenhuma informação bancária real é utilizada
                    </p>
                </div>
            </div>
        </main>
    );
}
