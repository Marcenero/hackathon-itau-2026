"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { API_URL } from "@/lib/api";


type SurveyType =
    | "qualitative"
    | "quantitative"
    | "discovery";

type ScoreMode =
    | "explicit"
    | "inferred"
    | "none";

type Tab =
    | "templates"
    | "created";

type Survey = {
    id: number;
    title: string;
    question: string;
    survey_type: SurveyType;

    context: string | null;
    profile: string | null;

    options: string[] | null;

    validity_days: number;
    score_mode: ScoreMode;

    created_at: string;
};


export default function PesquisasPage() {
    const [tab, setTab] =
        useState<Tab>("templates");

    const [surveys, setSurveys] =
        useState<Survey[]>([]);

    const [loadingSurveys, setLoadingSurveys] =
        useState(true);

    const [creating, setCreating] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState<string | null>(null);

    const [selectedSurvey, setSelectedSurvey] =
        useState<Survey | null>(null);


    // -------------------------
    // FORMULÁRIO
    // -------------------------

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

    const [scoreMode, setScoreMode] =
        useState<ScoreMode>("inferred");

    const [options, setOptions] =
        useState([
            "",
            "",
            "",
            "",
        ]);


    // -------------------------
    // CARREGAR PESQUISAS
    // -------------------------

    const carregarPesquisas =
        useCallback(async () => {
            setLoadingSurveys(true);
            setError(null);

            try {
                const response = await fetch(
                    `${API_URL}/surveys`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Não foi possível carregar as pesquisas."
                    );
                }

                const data =
                    await response.json();

                setSurveys(data);

            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Erro ao carregar pesquisas."
                );

            } finally {
                setLoadingSurveys(false);
            }
        }, []);


    useEffect(() => {
        carregarPesquisas();
    }, [carregarPesquisas]);


    // -------------------------
    // TEMPLATE
    // -------------------------

    function selecionarTemplate(
        selectedType: SurveyType
    ) {
        setType(selectedType);

        setSuccess(null);
        setError(null);

        if (
            selectedType === "qualitative" ||
            selectedType === "discovery"
        ) {
            setScoreMode("inferred");
        } else {
            setScoreMode("none");
        }
    }


    function limparFormulario() {
        setType(null);

        setTitle("");
        setQuestion("");
        setContext("");
        setProfile("");

        setValidityDays(30);

        setScoreMode("inferred");

        setOptions([
            "",
            "",
            "",
            "",
        ]);
    }


    // -------------------------
    // CRIAR PESQUISA
    // -------------------------

    async function criarPesquisa() {
        if (!type) {
            return;
        }

        setError(null);
        setSuccess(null);

        if (!title.trim()) {
            setError(
                "Informe um título para a pesquisa."
            );

            return;
        }

        if (!question.trim()) {
            setError(
                "Informe a pergunta-base ou objetivo da pesquisa."
            );

            return;
        }

        if (validityDays < 1) {
            setError(
                "A validade deve ser de pelo menos 1 dia."
            );

            return;
        }

        if (
            type === "quantitative" &&
            options.some(
                (option) => !option.trim()
            )
        ) {
            setError(
                "Preencha as quatro alternativas da pesquisa quantitativa."
            );

            return;
        }

        setCreating(true);

        try {
            const response = await fetch(
                `${API_URL}/surveys`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        title:
                            title.trim(),

                        question:
                            question.trim(),

                        survey_type:
                            type,

                        context:
                            context.trim() ||
                            null,

                        profile:
                            type === "discovery"
                                ? profile.trim() ||
                                  null
                                : null,

                        options:
                            type === "quantitative"
                                ? options.map(
                                    (option) =>
                                        option.trim()
                                )
                                : null,

                        validity_days:
                            validityDays,

                        score_mode:
                            scoreMode,
                    }),
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail ??
                    "Não foi possível criar a pesquisa."
                );
            }

            setSuccess(
                `Pesquisa "${result.title}" criada com sucesso.`
            );

            await carregarPesquisas();

            limparFormulario();

            setTab("created");

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao criar pesquisa."
            );

        } finally {
            setCreating(false);
        }
    }


    return (
        <main className="min-h-[calc(100vh-73px)] bg-[#F7F7F8] px-6 py-10">
            <div className="mx-auto max-w-6xl">

                {/* CABEÇALHO */}

                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-[#EC7000]">
                            Gestão de pesquisas
                        </p>

                        <h1 className="mt-1 text-3xl font-bold text-[#231F20]">
                            Pesquisas do Pulso
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666]">
                            Crie pesquisas a partir de templates
                            estruturados e acompanhe as pesquisas
                            disponíveis para coleta de feedback.
                        </p>
                    </div>

                    <div className="rounded-full bg-[#EAF2F8] px-4 py-2 text-sm font-semibold text-[#003C7A]">
                        {surveys.length} pesquisa
                        {surveys.length !== 1
                            ? "s"
                            : ""}
                    </div>
                </div>


                {/* AVISO DO PROTÓTIPO */}

                <div className="mt-6 rounded-2xl border border-[#BDD5EA] bg-[#F4F8FC] px-5 py-4">
                    <p className="text-sm text-[#003C7A]">
                        🔒 Protótipo do hackathon:
                        utilize apenas dados fictícios durante
                        os testes.
                    </p>
                </div>


                {/* MENSAGENS */}

                {error && (
                    <div className="mt-6 rounded-xl border border-[#F2C4C4] bg-[#FDECEC] px-4 py-3 text-sm text-[#C62828]">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-6 rounded-xl border border-[#BDE4D4] bg-[#E8F6F0] px-4 py-3 text-sm text-[#16865C]">
                        ✓ {success}
                    </div>
                )}


                {/* ABAS */}

                <div className="mt-8 flex border-b border-[#DDD]">
                    <button
                        onClick={() =>
                            setTab("templates")
                        }
                        className={`
                            border-b-2 px-5 py-3 text-sm font-semibold transition
                            ${
                                tab === "templates"
                                    ? "border-[#003C7A] text-[#003C7A]"
                                    : "border-transparent text-[#777] hover:text-[#003C7A]"
                            }
                        `}
                    >
                        Criar pesquisa
                    </button>

                    <button
                        onClick={() =>
                            setTab("created")
                        }
                        className={`
                            border-b-2 px-5 py-3 text-sm font-semibold transition
                            ${
                                tab === "created"
                                    ? "border-[#003C7A] text-[#003C7A]"
                                    : "border-transparent text-[#777] hover:text-[#003C7A]"
                            }
                        `}
                    >
                        Pesquisas criadas

                        {surveys.length > 0 && (
                            <span className="ml-2 rounded-full bg-[#EAF2F8] px-2 py-0.5 text-xs text-[#003C7A]">
                                {surveys.length}
                            </span>
                        )}
                    </button>
                </div>


                {/* ========================= */}
                {/* ABA: CRIAR PESQUISA */}
                {/* ========================= */}

                {tab === "templates" && (
                    <section className="mt-8">

                        {!type ? (
                            <>
                                <div>
                                    <h2 className="text-xl font-semibold text-[#231F20]">
                                        Escolha um template
                                    </h2>

                                    <p className="mt-1 text-sm text-[#666]">
                                        Selecione o tipo de pesquisa que
                                        melhor representa o objetivo da
                                        investigação.
                                    </p>
                                </div>

                                <div className="mt-6 grid gap-5 md:grid-cols-2">

                                    <TemplateCard
                                        title="User Research Qualitativa"
                                        badge="Conversacional"
                                        description="Coleta relatos abertos para entender dificuldades, percepções e experiências do cliente."
                                        buttonLabel="Selecionar qualitativa"
                                        accent="blue"
                                        onClick={() =>
                                            selecionarTemplate(
                                                "qualitative"
                                            )
                                        }
                                    />

                                    <TemplateCard
                                        title="User Research Quantitativa"
                                        badge="Múltipla escolha"
                                        description="Coleta respostas estruturadas a partir de alternativas previamente definidas."
                                        buttonLabel="Selecionar quantitativa"
                                        accent="orange"
                                        onClick={() =>
                                            selecionarTemplate(
                                                "quantitative"
                                            )
                                        }
                                    />

                                    <div className="md:col-span-2">
                                        <TemplateCard
                                            title="Discovery Interview"
                                            badge="Roteiro guiado"
                                            description="Define um objetivo de descoberta, público e hipótese para orientar uma investigação qualitativa."
                                            buttonLabel="Selecionar Discovery"
                                            accent="green"
                                            onClick={() =>
                                                selecionarTemplate(
                                                    "discovery"
                                                )
                                            }
                                        />
                                    </div>

                                </div>
                            </>
                        ) : (
                            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-sm md:p-8">

                                {/* CABEÇALHO FORM */}

                                <div className="flex flex-col gap-4 border-b border-[#EEE] pb-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#777]">
                                            Template selecionado
                                        </p>

                                        <h2 className="mt-1 text-xl font-bold text-[#003C7A]">
                                            {getTypeLabel(
                                                type
                                            )}
                                        </h2>
                                    </div>

                                    <button
                                        onClick={
                                            limparFormulario
                                        }
                                        className="rounded-lg border border-[#003C7A] px-4 py-2 text-sm font-semibold text-[#003C7A] transition hover:bg-[#EAF2F8]"
                                    >
                                        ← Escolher outro
                                    </button>
                                </div>


                                {/* TÍTULO */}

                                <Field
                                    label="Título da pesquisa"
                                    helper="Nome usado pela squad para identificar a pesquisa."
                                >
                                    <input
                                        value={title}
                                        onChange={(event) =>
                                            setTitle(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Ex.: Experiência com comprovante Pix"
                                        className={inputClass}
                                    />
                                </Field>


                                {/* PERGUNTA */}

                                <Field
                                    label={
                                        type === "discovery"
                                            ? "Objetivo da Discovery Interview"
                                            : "Pergunta-base"
                                    }
                                    helper={
                                        type === "discovery"
                                            ? "Descreva o que a investigação precisa compreender."
                                            : "Essa será a pergunta principal apresentada ao cliente."
                                    }
                                >
                                    <textarea
                                        rows={3}
                                        value={question}
                                        onChange={(event) =>
                                            setQuestion(
                                                event.target.value
                                            )
                                        }
                                        placeholder={
                                            type ===
                                            "discovery"
                                                ? "Ex.: Entender como usuários acompanham uma transferência após concluir um Pix."
                                                : "Ex.: Conte como foi sua experiência para encontrar o comprovante."
                                        }
                                        className={inputClass}
                                    />
                                </Field>


                                {/* QUALITATIVA */}

                                {type ===
                                    "qualitative" && (
                                    <Field
                                        label="Contexto / objetivo"
                                        helper="Opcional. Ajuda a documentar o que a squad deseja investigar."
                                    >
                                        <textarea
                                            rows={4}
                                            value={context}
                                            onChange={(
                                                event
                                            ) =>
                                                setContext(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Ex.: Entender as principais dificuldades para localizar comprovantes após uma transferência."
                                            className={
                                                inputClass
                                            }
                                        />
                                    </Field>
                                )}


                                {/* QUANTITATIVA */}

                                {type ===
                                    "quantitative" && (
                                    <div className="mt-6">
                                        <label className="font-semibold text-[#333]">
                                            Alternativas
                                        </label>

                                        <p className="mt-1 text-xs text-[#777]">
                                            Preencha as quatro opções
                                            que serão apresentadas ao
                                            cliente.
                                        </p>

                                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            {options.map(
                                                (
                                                    option,
                                                    index
                                                ) => (
                                                    <input
                                                        key={
                                                            index
                                                        }
                                                        value={
                                                            option
                                                        }
                                                        onChange={(
                                                            event
                                                        ) => {
                                                            const next =
                                                                [
                                                                    ...options,
                                                                ];

                                                            next[
                                                                index
                                                            ] =
                                                                event.target.value;

                                                            setOptions(
                                                                next
                                                            );
                                                        }}
                                                        placeholder={`Alternativa ${
                                                            index +
                                                            1
                                                        }`}
                                                        className={
                                                            inputClass
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}


                                {/* DISCOVERY */}

                                {type ===
                                    "discovery" && (
                                    <>
                                        <Field
                                            label="Perfil / público"
                                            helper="Quem deve participar dessa investigação?"
                                        >
                                            <input
                                                value={
                                                    profile
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setProfile(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Ex.: Clientes que fizeram um Pix nos últimos 30 dias."
                                                className={
                                                    inputClass
                                                }
                                            />
                                        </Field>

                                        <Field
                                            label="Contexto ou hipótese"
                                            helper="Opcional. Registre o problema ou hipótese que motivou a pesquisa."
                                        >
                                            <textarea
                                                rows={4}
                                                value={
                                                    context
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setContext(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Ex.: Usuários podem ter dificuldade para reencontrar comprovantes após concluir a jornada."
                                                className={
                                                    inputClass
                                                }
                                            />
                                        </Field>

                                        <div className="mt-6 rounded-2xl border border-[#B7DFD0] bg-[#F7FAF9] p-5">
                                            <p className="text-sm font-semibold text-[#16865C]">
                                                ✨ Papel do Pulso
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-[#555]">
                                                A IA poderá interpretar
                                                as respostas,
                                                identificar sinais e
                                                sintetizar padrões. A
                                                decisão final continua
                                                com a squad.
                                            </p>
                                        </div>
                                    </>
                                )}


                                {/* CONFIGURAÇÕES */}

                                <div className="mt-8 grid gap-5 md:grid-cols-2">

                                    <Field
                                        label="Validade da pesquisa"
                                        helper="Usada pelo indicador de frescor no dashboard."
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min={1}
                                                value={
                                                    validityDays
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setValidityDays(
                                                        Number(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    )
                                                }
                                                className={`${inputClass} max-w-32`}
                                            />

                                            <span className="text-sm text-[#777]">
                                                dias
                                            </span>
                                        </div>
                                    </Field>


                                    <Field
                                        label="Forma de avaliação"
                                        helper="Define de onde virá a nota usada nas métricas."
                                    >
                                        <select
                                            value={
                                                scoreMode
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setScoreMode(
                                                    event
                                                        .target
                                                        .value as ScoreMode
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                        >
                                            <option value="inferred">
                                                Inferida pelo Pulso
                                            </option>

                                            <option value="explicit">
                                                Nota explícita de
                                                1 a 10
                                            </option>

                                            <option value="none">
                                                Sem nota
                                            </option>
                                        </select>
                                    </Field>

                                </div>


                                {/* INFO SCORE */}

                                <div className="mt-5 rounded-xl bg-[#F7F7F8] p-4">
                                    {scoreMode ===
                                        "inferred" && (
                                        <p className="text-xs leading-5 text-[#666]">
                                            ✨ O cliente responde
                                            em texto e o Pulso
                                            estima uma avaliação
                                            de 1 a 10. O dashboard
                                            identifica esse valor
                                            como inferido.
                                        </p>
                                    )}

                                    {scoreMode ===
                                        "explicit" && (
                                        <p className="text-xs leading-5 text-[#666]">
                                            O cliente informa
                                            diretamente uma nota
                                            de 1 a 10.
                                        </p>
                                    )}

                                    {scoreMode ===
                                        "none" && (
                                        <p className="text-xs leading-5 text-[#666]">
                                            A pesquisa não utiliza
                                            nota; apenas as
                                            respostas
                                            estruturadas serão
                                            armazenadas.
                                        </p>
                                    )}
                                </div>


                                {/* BOTÃO */}

                                <button
                                    onClick={
                                        criarPesquisa
                                    }
                                    disabled={creating}
                                    className="mt-8 w-full rounded-xl bg-[#EC7000] py-3.5 font-semibold text-white transition hover:bg-[#C95F00] disabled:cursor-not-allowed disabled:bg-[#CCC]"
                                >
                                    {creating
                                        ? "Criando pesquisa..."
                                        : "Criar pesquisa"}
                                </button>

                            </div>
                        )}
                    </section>
                )}


                {/* ========================= */}
                {/* ABA: PESQUISAS CRIADAS */}
                {/* ========================= */}

                {tab === "created" && (
                    <section className="mt-8">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-[#231F20]">
                                    Pesquisas criadas
                                </h2>

                                <p className="mt-1 text-sm text-[#666]">
                                    Pesquisas atualmente
                                    registradas no banco de dados.
                                </p>
                            </div>

                            <button
                                onClick={
                                    carregarPesquisas
                                }
                                disabled={
                                    loadingSurveys
                                }
                                className="rounded-xl border border-[#003C7A] px-4 py-2 text-sm font-semibold text-[#003C7A] transition hover:bg-[#EAF2F8]"
                            >
                                ↻ Atualizar lista
                            </button>
                        </div>


                        {loadingSurveys ? (
                            <div className="mt-6 rounded-2xl border bg-white p-8 text-center text-sm text-[#777]">
                                Carregando pesquisas...
                            </div>
                        ) : surveys.length === 0 ? (
                            <div className="mt-6 rounded-3xl border border-dashed border-[#CCC] bg-white p-10 text-center">
                                <div className="text-3xl">
                                    📋
                                </div>

                                <h3 className="mt-4 font-semibold">
                                    Nenhuma pesquisa criada
                                </h3>

                                <p className="mt-2 text-sm text-[#666]">
                                    Escolha um template e crie
                                    sua primeira pesquisa.
                                </p>

                                <button
                                    onClick={() =>
                                        setTab(
                                            "templates"
                                        )
                                    }
                                    className="mt-5 rounded-xl bg-[#EC7000] px-5 py-3 text-sm font-semibold text-white"
                                >
                                    Criar pesquisa
                                </button>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {surveys.map(
                                    (survey) => (
                                        <SurveyCard
                                            key={
                                                survey.id
                                            }
                                            survey={
                                                survey
                                            }
                                            onView={() =>
                                                setSelectedSurvey(
                                                    survey
                                                )
                                            }
                                        />
                                    )
                                )}
                            </div>
                        )}

                    </section>
                )}

            </div>


            {/* MODAL */}

            {selectedSurvey && (
                <SurveyModal
                    survey={
                        selectedSurvey
                    }
                    onClose={() =>
                        setSelectedSurvey(
                            null
                        )
                    }
                />
            )}

        </main>
    );
}


// =====================================================
// COMPONENTES
// =====================================================

const inputClass =
    "mt-2 w-full rounded-xl border border-[#D8D8D8] bg-white p-3 text-sm outline-none transition focus:border-[#EC7000] focus:ring-2 focus:ring-[#EC7000]/10";


function Field({
    label,
    helper,
    children,
}: {
    label: string;
    helper?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mt-6">
            <label className="font-semibold text-[#333]">
                {label}
            </label>

            {helper && (
                <p className="mt-1 text-xs text-[#777]">
                    {helper}
                </p>
            )}

            {children}
        </div>
    );
}


function TemplateCard({
    title,
    badge,
    description,
    buttonLabel,
    accent,
    onClick,
}: {
    title: string;
    badge: string;
    description: string;
    buttonLabel: string;
    accent:
        | "blue"
        | "orange"
        | "green";
    onClick: () => void;
}) {
    const config = {
        blue: {
            border:
                "hover:border-[#003C7A]",

            badge:
                "bg-[#EAF2F8] text-[#003C7A]",

            button:
                "bg-[#003C7A] hover:bg-[#002E5D]",
        },

        orange: {
            border:
                "hover:border-[#EC7000]",

            badge:
                "bg-[#FFF0E4] text-[#C95F00]",

            button:
                "bg-[#EC7000] hover:bg-[#C95F00]",
        },

        green: {
            border:
                "hover:border-[#16865C]",

            badge:
                "bg-[#E8F6F0] text-[#16865C]",

            button:
                "bg-[#16865C] hover:bg-[#126F4D]",
        },
    }[accent];

    return (
        <div
            className={`
                flex h-full flex-col justify-between
                rounded-2xl border-2 border-[#E5E5E5]
                bg-white p-6 shadow-sm transition
                hover:-translate-y-1 hover:shadow-md
                ${config.border}
            `}
        >
            <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-[#231F20]">
                        {title}
                    </h3>

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
                    >
                        {badge}
                    </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#666]">
                    {description}
                </p>
            </div>

            <button
                onClick={onClick}
                className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${config.button}`}
            >
                {buttonLabel}
            </button>
        </div>
    );
}


function SurveyCard({
    survey,
    onView,
}: {
    survey: Survey;
    onView: () => void;
}) {
    return (
        <div className="rounded-2xl border border-[#E5E5E5] border-l-4 border-l-[#16865C] bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                <div>
                    <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-lg font-semibold text-[#231F20]">
                            {survey.title}
                        </h3>

                        <span className="rounded-full bg-[#EAF2F8] px-3 py-1 text-xs font-semibold text-[#003C7A]">
                            {getTypeLabel(
                                survey.survey_type
                            )}
                        </span>

                    </div>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#555]">
                        {survey.question}
                    </p>
                </div>

                <span className="text-xs text-[#999]">
                    ID #{survey.id}
                </span>
            </div>


            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#666]">

                <span>
                    📅 Criada em{" "}
                    <strong>
                        {formatDate(
                            survey.created_at
                        )}
                    </strong>
                </span>

                <span>
                    ⏱ Validade:{" "}
                    <strong>
                        {survey.validity_days} dias
                    </strong>
                </span>

                <span>
                    📊 Avaliação:{" "}
                    <strong>
                        {getScoreModeLabel(
                            survey.score_mode
                        )}
                    </strong>
                </span>

            </div>


            <div className="mt-5">
                <button
                    onClick={onView}
                    className="rounded-lg bg-[#003C7A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#002E5D]"
                >
                    👁 Visualizar
                </button>
            </div>

        </div>
    );
}


function SurveyModal({
    survey,
    onClose,
}: {
    survey: Survey;
    onClose: () => void;
}) {
    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
            <div
                onClick={(event) =>
                    event.stopPropagation()
                }
                className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4">

                    <div>
                        <span className="rounded-full bg-[#EAF2F8] px-3 py-1 text-xs font-semibold text-[#003C7A]">
                            {getTypeLabel(
                                survey.survey_type
                            )}
                        </span>

                        <h2 className="mt-4 text-2xl font-bold">
                            {survey.title}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-2xl text-[#999] hover:text-black"
                    >
                        ×
                    </button>

                </div>


                <Detail
                    label="Pergunta / objetivo"
                    value={survey.question}
                />

                {survey.context && (
                    <Detail
                        label="Contexto / hipótese"
                        value={survey.context}
                    />
                )}

                {survey.profile && (
                    <Detail
                        label="Perfil / público"
                        value={survey.profile}
                    />
                )}

                {survey.options &&
                    survey.options.length >
                        0 && (
                    <div className="mt-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#777]">
                            Alternativas
                        </p>

                        <div className="mt-2 grid gap-2">
                            {survey.options.map(
                                (
                                    option,
                                    index
                                ) => (
                                    <div
                                        key={
                                            index
                                        }
                                        className="rounded-xl bg-[#F7F7F8] px-4 py-3 text-sm"
                                    >
                                        {index +
                                            1}
                                        .{" "}
                                        {
                                            option
                                        }
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}


                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <Detail
                        label="Validade"
                        value={`${survey.validity_days} dias`}
                    />

                    <Detail
                        label="Forma de avaliação"
                        value={getScoreModeLabel(
                            survey.score_mode
                        )}
                    />

                </div>


                <p className="mt-6 text-xs text-[#999]">
                    Criada em{" "}
                    {formatDate(
                        survey.created_at
                    )}{" "}
                    · ID #{survey.id}
                </p>

            </div>
        </div>
    );
}


function Detail({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#777]">
                {label}
            </p>

            <p className="mt-2 rounded-xl bg-[#F7F7F8] px-4 py-3 text-sm leading-6 text-[#444]">
                {value}
            </p>
        </div>
    );
}


function getTypeLabel(
    type: SurveyType
) {
    const labels: Record<
        SurveyType,
        string
    > = {
        qualitative:
            "Qualitativa",

        quantitative:
            "Quantitativa",

        discovery:
            "Discovery Interview",
    };

    return labels[type];
}


function getScoreModeLabel(
    mode: ScoreMode
) {
    const labels: Record<
        ScoreMode,
        string
    > = {
        explicit:
            "Nota explícita",

        inferred:
            "Inferida pelo Pulso",

        none:
            "Sem nota",
    };

    return labels[mode];
}


function formatDate(
    value: string
) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }
    );
}