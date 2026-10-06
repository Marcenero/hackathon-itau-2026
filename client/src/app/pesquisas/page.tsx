"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import SquadTabs from "@/components/SquadTabs";

type SurveyType =
  | "qualitative"
  | "quantitative"
  | "discovery";

type Survey = {
  id: number;
  title: string;
  question: string;
  survey_type: SurveyType;
  created_at?: string;
};

export default function PesquisasPage() {
  const [type, setType] =
    useState<SurveyType | null>(null);

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [profile, setProfile] = useState("");

  const [validityDays, setValidityDays] =
    useState(30);

  const [options, setOptions] = useState([
    "",
    "",
    "",
    "",
  ]);

  const [surveys, setSurveys] =
    useState<Survey[]>([]);

  const [creating, setCreating] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function carregarPesquisas() {
    try {
      const response = await fetch(
        `${API_URL}/surveys`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erro ao carregar pesquisas"
        );
      }

      const result = await response.json();

      setSurveys(result);
    } catch (error) {
      console.error(
        "Erro ao carregar pesquisas:",
        error
      );
    }
  }

  useEffect(() => {
    carregarPesquisas();
  }, []);

  async function criarPesquisa() {
    if (
      !type ||
      !title.trim() ||
      !question.trim()
    ) {
      setMessage(
        "Preencha o tipo, o título e a pergunta da pesquisa."
      );

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
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title,
            question,
            survey_type: type,

            context:
              context.trim() || null,

            profile:
              type === "discovery"
                ? profile.trim() || null
                : null,

            options:
              type === "quantitative"
                ? options.filter(
                    (option) =>
                      option.trim() !== ""
                  )
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

      if (!response.ok) {
        console.error(
          "Erro ao criar pesquisa:",
          result
        );

        setMessage(
          result.detail ??
            "Não foi possível criar a pesquisa."
        );

        return;
      }

      setSuccessMessage(
        `Pesquisa "${result.title}" criada com sucesso!`
      );

      await carregarPesquisas();

      setCreating(false);
      setType(null);

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

      setMessage(
        "Não foi possível conectar ao servidor."
      );
    } finally {
      setLoading(false);
    }
  }

  function cancelarCriacao() {
    setCreating(false);
    setType(null);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-[#FFF8F3] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">
          Pulso
        </h1>

        <p className="text-gray-500">
          Voz do cliente · Squad
        </p>

        <SquadTabs />

        {/* LISTA DE PESQUISAS */}
        {!creating && (
          <>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Pesquisas
                </h2>

                <p className="mt-1 text-sm text-[#666]">
                  Gerencie as pesquisas utilizadas
                  para coletar feedbacks dos clientes.
                </p>
              </div>

              <button
                onClick={() => {
                  setCreating(true);
                  setSuccessMessage("");
                  setMessage("");
                }}
                className="rounded-xl bg-[#EC7000] px-5 py-3 font-semibold text-white transition hover:bg-[#C95F00]"
              >
                + Nova pesquisa
              </button>
            </div>

            {successMessage && (
              <div className="mt-6 rounded-xl border border-[#B9E4D2] bg-[#F0FBF6] p-4 text-sm font-medium text-[#16865C]">
                {successMessage}
              </div>
            )}

            {surveys.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[#CCC] bg-white p-8 text-center">
                <p className="font-semibold">
                  Nenhuma pesquisa encontrada
                </p>

                <p className="mt-2 text-sm text-[#666]">
                  Crie uma pesquisa para começar
                  a coletar feedbacks.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {surveys.map((survey) => (
                  <div
                    key={survey.id}
                    className="rounded-2xl border border-[#E5E5E5] bg-white p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-[#231F20]">
                          {survey.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#666]">
                          {survey.question}
                        </p>

                        <p className="mt-3 text-xs text-[#999]">
                          Pesquisa #{survey.id}
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-[#FFF0E4] px-3 py-1 text-xs font-semibold text-[#C95F00]">
                        {getTypeLabel(
                          survey.survey_type
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ESCOLHA DO TEMPLATE */}
        {creating && !type && (
          <>
            <button
              onClick={cancelarCriacao}
              className="mt-8 text-sm font-semibold text-[#003C7A]"
            >
              &larr; Voltar para pesquisas
            </button>

            <h2 className="mt-5 text-2xl font-bold">
              Criar nova pesquisa
            </h2>

            <p className="mt-2 text-[#666]">
              Escolha o tipo de pesquisa que
              deseja criar.
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

        {/* CONFIGURAÇÃO DA PESQUISA */}
        {creating && type && (
          <div className="mt-8 rounded-3xl border bg-white p-8">
            <button
              onClick={() => {
                setType(null);
                setMessage("");
              }}
              className="text-sm font-semibold text-[#003C7A]"
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
              className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#EC7000]"
            />

            <label className="mt-5 block font-semibold">
              Pergunta-base
            </label>

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }
              placeholder="Ex.: Como você avalia sua experiência?"
              rows={3}
              className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#EC7000]"
            />

            {type === "qualitative" && (
              <>
                <label className="mt-5 block font-semibold">
                  Contexto / objetivo
                </label>

                <textarea
                  value={context}
                  onChange={(event) =>
                    setContext(
                      event.target.value
                    )
                  }
                  placeholder="O que a squad deseja entender com esta pesquisa?"
                  rows={3}
                  className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#EC7000]"
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
                    setProfile(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Clientes que realizaram Pix nos últimos 30 dias"
                  className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#EC7000]"
                />

                <label className="mt-5 block font-semibold">
                  Hipótese / contexto
                </label>

                <textarea
                  value={context}
                  onChange={(event) =>
                    setContext(
                      event.target.value
                    )
                  }
                  placeholder="Qual hipótese a squad deseja investigar?"
                  rows={3}
                  className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#EC7000]"
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
                        onChange={(
                          event
                        ) => {
                          const next = [
                            ...options,
                          ];

                          next[index] =
                            event.target.value;

                          setOptions(next);
                        }}
                        placeholder={`Alternativa ${
                          index + 1
                        }`}
                        className="rounded-xl border p-3 outline-none focus:border-[#EC7000]"
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
                  setValidityDays(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-32 rounded-xl border p-3 outline-none focus:border-[#EC7000]"
              />

              <span className="text-sm text-[#666]">
                dias
              </span>
            </div>

            {message && (
              <p className="mt-5 rounded-xl bg-[#FFF8F3] p-4 text-sm text-[#555]">
                {message}
              </p>
            )}

            <div className="mt-8 flex gap-3">
              <button
                onClick={cancelarCriacao}
                disabled={loading}
                className="flex-1 rounded-xl border border-[#CCC] py-3 font-semibold text-[#555] transition hover:bg-[#F5F5F5]"
              >
                Cancelar
              </button>

              <button
                onClick={criarPesquisa}
                disabled={loading}
                className="flex-1 rounded-xl bg-[#EC7000] py-3 font-semibold text-white transition hover:bg-[#C95F00] disabled:bg-[#CCC]"
              >
                {loading
                  ? "Criando pesquisa..."
                  : "Criar pesquisa"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function getTypeLabel(
  type: SurveyType
) {
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
      <h3 className="font-semibold text-[#003C7A]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#666]">
        {description}
      </p>

      <span className="mt-5 inline-block text-sm font-semibold text-[#EC7000]">
        Selecionar &rarr;
      </span>
    </button>
  );
}