"use client";

import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/api";
import { ArrowLeftIcon, SendIcon } from "./cliente/icons";
import { CHAT_MODE_CONFIG, type ChatMessage, type ChatMode } from "./types";

type ChatSurveyProps = {
    survey: { id: number; title: string; question: string };
    mode: ChatMode;
    onBack: () => void;
    onDone: () => void;
};

export default function ChatSurvey({
    survey,
    mode,
    onBack,
    onDone,
}: ChatSurveyProps) {
    const config = CHAT_MODE_CONFIG[mode];

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [waitingReply, setWaitingReply] = useState(true);
    const [finished, setFinished] = useState(false);
    const [saving, setSaving] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const startedRef = useRef(false);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        requestNextMessage([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, waitingReply]);

    async function requestNextMessage(history: ChatMessage[]) {
        setWaitingReply(true);

        try {
            const response = await fetch(
                `${API_URL}/surveys/${survey.id}/chat`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        mode,
                        history,
                    }),
                }
            );

            const data = await response.json();

            const nextMessages: ChatMessage[] = [
                ...history,
                { role: "assistant", content: data.reply },
            ];

            setMessages(nextMessages);

            const questionsAsked = nextMessages.filter(
                (message) => message.role === "assistant"
            ).length;

            if (data.finished || questionsAsked >= config.totalSteps) {
                setFinished(true);
                await saveResponse(nextMessages);
            }
        } catch {
            setMessages([
                ...history,
                {
                    role: "assistant",
                    content:
                        "Não consegui me conectar agora. Você pode tentar novamente em instantes?",
                },
            ]);
        } finally {
            setWaitingReply(false);
        }
    }

    async function saveResponse(history: ChatMessage[]) {
        setSaving(true);

        const transcript = history
            .filter((message) => message.role === "user")
            .map((message) => message.content)
            .join("\n");

        try {
            await fetch(`${API_URL}/surveys/${survey.id}/responses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: transcript || "(sem detalhes adicionais)",
                    mode,
                }),
            });
        } finally {
            setSaving(false);
        }
    }

    async function enviar() {
        const trimmed = input.trim();
        if (!trimmed || waitingReply || finished) return;

        const nextMessages: ChatMessage[] = [
            ...messages,
            { role: "user", content: trimmed },
        ];

        setMessages(nextMessages);
        setInput("");

        await requestNextMessage(nextMessages);
    }

    const questionsAsked = messages.filter(
        (message) => message.role === "assistant"
    ).length;

    const progress = Math.min(
        (questionsAsked / config.totalSteps) * 100,
        100
    );

    return (
        <main className="flex min-h-[calc(100vh-73px)] flex-col bg-[#FFF8F3]">
            <div className="border-b border-[#EAEAEA] bg-white px-6 py-4">
                <div className="mx-auto flex max-w-2xl items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-sm font-medium text-[#666] hover:text-[#231F20]"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Voltar
                    </button>

                    <span className="font-semibold text-[#231F20]">
                        {config.title}
                    </span>

                    <span className="text-sm text-[#888]">
                        {Math.min(questionsAsked, config.totalSteps)} de{" "}
                        {config.totalSteps}
                    </span>
                </div>

                <div className="mx-auto mt-3 h-1.5 max-w-2xl overflow-hidden rounded-full bg-[#F0F0F0]">
                    <div
                        className="h-full rounded-full bg-[#EC7000] transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="mx-auto w-full max-w-2xl flex-1 space-y-4 overflow-y-auto px-6 py-6">
                {messages.map((message, index) => (
                    <ChatBubble key={index} message={message} />
                ))}

                {waitingReply && (
                    <ChatBubble
                        message={{ role: "assistant", content: "" }}
                        typing
                    />
                )}

                <div ref={bottomRef} />
            </div>

            <div className="border-t border-[#EAEAEA] bg-white px-6 py-4">
                <div className="mx-auto flex max-w-2xl items-center gap-3">
                    <input
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") enviar();
                        }}
                        disabled={finished || waitingReply}
                        placeholder={
                            finished
                                ? "Conversa encerrada"
                                : "Digite sua resposta..."
                        }
                        className="flex-1 rounded-full border border-[#DDD] px-4 py-3 text-sm outline-none transition placeholder:text-[#AAA] focus:border-[#EC7000] focus:ring-2 focus:ring-[#EC7000]/10 disabled:bg-[#F5F5F5]"
                    />

                    <button
                        onClick={enviar}
                        disabled={!input.trim() || finished || waitingReply}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EC7000] text-white transition hover:bg-[#C95F00] disabled:bg-[#CCC]"
                    >
                        <SendIcon className="h-5 w-5" />
                    </button>
                </div>

                {finished && (
                    <div className="mx-auto mt-4 max-w-2xl">
                        <button
                            onClick={onDone}
                            disabled={saving}
                            className="w-full rounded-xl bg-[#EC7000] py-3.5 font-semibold text-white transition hover:bg-[#C95F00] disabled:bg-[#CCC]"
                        >
                            {saving ? "Salvando..." : "Concluir pesquisa"}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

function ChatBubble({
    message,
    typing,
}: {
    message: ChatMessage;
    typing?: boolean;
}) {
    const isAssistant = message.role === "assistant";

    return (
        <div
            className={`flex items-end gap-2 ${
                isAssistant ? "justify-start" : "justify-end"
            }`}
        >
            {isAssistant && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EC7000] text-sm font-bold text-white">
                    P
                </span>
            )}

            <div
                className={`
                    max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6
                    ${
                        isAssistant
                            ? "rounded-bl-sm bg-white text-[#333] shadow-sm"
                            : "rounded-br-sm bg-[#EC7000] text-white"
                    }
                `}
            >
                {typing ? (
                    <span className="flex gap-1 py-1">
                        <Dot delay="0ms" />
                        <Dot delay="150ms" />
                        <Dot delay="300ms" />
                    </span>
                ) : (
                    message.content
                )}
            </div>
        </div>
    );
}

function Dot({ delay }: { delay: string }) {
    return (
        <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#BBB]"
            style={{ animationDelay: delay }}
        />
    );
}
