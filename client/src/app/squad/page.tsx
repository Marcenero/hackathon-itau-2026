"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

import Sentiment from "@/components/Sentiment";
import CategoryBadge from "@/components/CategoryBadge";
import FreshnessBadge from "@/components/FreshnessBadge";
import ValidationBadge from "@/components/ValidationBadge";

export default function SquadPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function carregar() {
    const response = await fetch(
      `${API_URL}/surveys/1/dashboard`,
      { cache: "no-store" }
    );

    setData(await response.json());
  }

  useEffect(() => {
    carregar();
  }, []);

  async function analisar() {
    setLoading(true);

    await fetch(
      `${API_URL}/surveys/1/analyze`,
      {
        method: "POST",
      }
    );

    await carregar();

    setLoading(false);
  }

  async function gerarRelatorio() {
    setLoading(true);

    await fetch(
      `${API_URL}/surveys/1/report`,
      {
        method: "POST",
      }
    );

    await carregar();

    setLoading(false);
  }

  if (!data) {
    return <main className="p-10">Carregando...</main>;
  }

  async function validarAnalise(item: any) {
    await fetch(
        `${API_URL}/analyses/${item.id}`,
        {
            method: "PATCH",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                category: item.category,
                reviewer: "Designer",
            }),
        }
    );

    await carregar();
}

  return (
    <main className="max-w-6xl mx-auto p-8">

      <h1 className="text-3xl font-bold">
        Pulso
      </h1>

      <p className="text-gray-500">
        Voz do cliente · Squad
      </p>

      {data.inferred_scores_count > 0 && (
        <p className="mt-3 text-xs text-[#777]">
            ✨ {data.inferred_scores_count} avaliação
            {data.inferred_scores_count !== 1
                ? "ões foram estimadas"
                : " foi estimada"}{" "}
            pelo Pulso a partir do feedback textual.
        </p>
    )}

      <div className="grid grid-cols-2 gap-4 mt-8">
        <Card
            title="Respostas"
            value={data.total_responses}
        />

        <Card
            title="Nota média"
            value={data.average_score ?? "—"}
        />
    </div>

    {data.freshness && (
        <div className="mt-4">
            <FreshnessBadge
                status={data.freshness.status}
                lastResponseAt={
                    data.freshness.last_response_at
                }
                validityDays={
                    data.freshness.validity_days
                }
            />
        </div>
    )}

      <div className="flex gap-3 mt-8">
        <button
          onClick={analisar}
          className="bg-black text-white px-5 py-3 rounded-xl"
        >
          {loading
            ? "Processando..."
            : "✨ Analisar com Pulso"}
        </button>

        <button
          onClick={gerarRelatorio}
          className="border px-5 py-3 rounded-xl"
        >
          Gerar síntese
        </button>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Principais temas
        </h2>

        <div className="mt-4 space-y-3">
          {Object.entries(
            data.categories
          ).map(([category, value]: any) => (
            <div
              key={category}
              className="border p-4 rounded-xl flex justify-between"
            >
              <span className="capitalize">
                {category}
              </span>

              <strong>
                {value}%
              </strong>
            </div>
          ))}
        </div>
      </section>

      {data.report && (
        <section className="mt-10 border rounded-2xl p-6">
          <p className="text-sm">
            ✨ INSIGHT PULSO
          </p>

          <p className="mt-3 text-lg">
            {data.report.summary}
          </p>

          <p className="mt-6 font-semibold">
            Questão para investigação
          </p>

          <p className="text-gray-600">
            {data.report.investigation_question}
          </p>
        </section>
      )}

      {data.qualitative_summary && (
        <section className="mt-10">
            <h2 className="text-xl font-semibold">
                Sinais qualitativos
            </h2>

            <p className="mt-1 text-sm text-[#666]">
                Como os clientes estão reagindo à experiência.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                {Object.entries(
                    data.qualitative_summary
                ).map(([signal, group]: any) => (
                    <div
                        key={signal}
                        className="rounded-2xl border border-[#E5E5E5] bg-white p-5"
                    >
                        <div className="flex items-center justify-between">
                            <strong className="capitalize">
                                {signal}
                            </strong>

                            <span className="text-sm text-[#777]">
                                {group.count} feedback
                                {group.count !== 1
                                    ? "s"
                                    : ""}
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            {group.examples.map(
                                (example: any) => (
                                    <div
                                        key={
                                            example.response_id
                                        }
                                        className="border-l-4 border-[#EC7000] pl-4"
                                    >
                                        <p className="text-sm italic leading-6 text-[#555]">
                                            “{example.text}”
                                        </p>

                                        {example.validated && (
                                            <span className="mt-2 inline-block text-xs font-semibold text-[#16865C]">
                                                ✓ Validado
                                            </span>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )}

      {data.validation && (
        <section className="mt-10">
            <h2 className="text-xl font-semibold">
                Governança
            </h2>

            <div className="mt-4 rounded-2xl border border-[#E5E5E5] bg-white p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">
                            Validação humana
                        </p>

                        <p className="mt-1 text-sm text-[#666]">
                            {data.validation.reviewed} de{" "}
                            {data.validation.total} análises revisadas
                        </p>
                    </div>

                    <strong className="text-2xl text-[#16865C]">
                        {data.validation.percentage}%
                    </strong>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEE]">
                    <div
                        className="h-full rounded-full bg-[#16865C]"
                        style={{
                            width: `${data.validation.percentage}%`,
                        }}
                    />
                </div>
            </div>
        </section>
    )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Evidências
        </h2>

        <div className="space-y-3 mt-4">
          {data.analyses.map((item: any) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#e5e5e5] bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <CategoryBadge category={item.category} />

                <Sentiment value={item.sentiment} />
              </div>

              <div className="mt-3">
                  <ValidationBadge
                      status={item.status}
                  />
              </div>

              <p className="mt-4 text-sm leading-6 text-[#555]">
                {item.summary}
              </p>

              {item.status !== "reviewed" && (
                  <button
                      onClick={() =>
                          validarAnalise(item)
                      }
                      className="mt-4 rounded-xl border border-[#16865C] px-4 py-2 text-sm font-semibold text-[#16865C] transition hover:bg-[#E8F6F0]"
                  >
                      Validar análise
                  </button>
              )}
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}


function Card({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="border rounded-2xl p-6">
      <p className="text-gray-500">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}