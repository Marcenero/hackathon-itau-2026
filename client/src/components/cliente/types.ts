export type SurveyMode = "quantitativa" | "qualitativa" | "discovery";

export type ChatMode = Extract<SurveyMode, "qualitativa" | "discovery">;

export type ChatMessage = {
    role: "assistant" | "user";
    content: string;
};

export const CHAT_MODE_CONFIG: Record
    ChatMode,
    { title: string; totalSteps: number }
> = {
    qualitativa: {
        title: "Pesquisa qualitativa",
        totalSteps: 5,
    },
    discovery: {
        title: "Discovery Interview",
        totalSteps: 8,
    },
};