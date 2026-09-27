"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

import SurveyTypeSelect from "@/components/cliente/SurveyTypeSelect";
import QuantitativeForm from "@/components/cliente/QuantitativeForm";
import ChatSurvey from "@/components/cliente/ChatSurvey";
import ThankYou from "@/components/cliente/ThankYou";
import type { SurveyMode } from "@/components/cliente/types";

type Survey = {
    id: number;
    title: string;
    question: string;
};

type Step = "select" | SurveyMode | "done";

const POINTS_BY_MODE: Record<SurveyMode, number> = {
    quantitativa: 10,
    qualitativa: 25,
    discovery: 50,
};

export default function ClientePage() {
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [step, setStep] = useState<Step>("select");
    const [completedMode, setCompletedMode] =
        useState<SurveyMode>("quantitativa");

    useEffect(() => {
        fetch(`${API_URL}/surveys/1`)
            .then((response) => response.json())
            .then(setSurvey);
    }, []);

    if (!survey) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center">
                <p className="text-[#666]">Carregando pesquisa...</p>
            </main>
        );
    }

    if (step === "select") {
        return (
            <SurveyTypeSelect
                onSelect={(mode) => setStep(mode)}
            />
        );
    }

    if (step === "quantitativa") {
        return (
            <QuantitativeForm
                survey={survey}
                onBack={() => setStep("select")}
                onDone={() => {
                    setCompletedMode("quantitativa");
                    setStep("done");
                }}
            />
        );
    }

    if (step === "qualitativa" || step === "discovery") {
        return (
            <ChatSurvey
                survey={survey}
                mode={step}
                onBack={() => setStep("select")}
                onDone={() => {
                    setCompletedMode(step);
                    setStep("done");
                }}
            />
        );
    }

    return <ThankYou points={POINTS_BY_MODE[completedMode]} />;
}
