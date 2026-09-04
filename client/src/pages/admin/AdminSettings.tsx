import { useState } from "react";
import {
  Database,
  Search,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import { adminApi } from "@/api/admin";

export default function AdminSettings() {
  const [reindexing, setReindexing] =
    useState(false);

  const [testing, setTesting] =
    useState(false);

  const [clusterName, setClusterName] =
    useState<string | null>(null);

  const handleReindex = async () => {
    try {
      setReindexing(true);

      const result =
        await adminApi.reindex();

      toast.success(
        result ||
          "Elasticsearch reindex completed",
      );
    } catch (error) {
      console.error(
        "Failed to reindex Elasticsearch",
        error,
      );

      toast.error(
        "Unable to reindex Elasticsearch",
      );
    } finally {
      setReindexing(false);
    }
  };

  const handleTestElasticsearch =
    async () => {
      try {
        setTesting(true);

        const result =
          await adminApi.elasticsearchTest();

        setClusterName(result);

        toast.success(
          "Elasticsearch connection is healthy",
        );
      } catch (error) {
        console.error(
          "Elasticsearch connection test failed",
          error,
        );

        setClusterName(null);

        toast.error(
          "Elasticsearch connection failed",
        );
      } finally {
        setTesting(false);
      }
    };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* HEADER */}

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Administration
          </p>

          <h1 className="mt-2 font-serif text-3xl font-semibold text-espresso">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-espresso/60">
            Administrative maintenance and
            platform diagnostics.
          </p>
        </div>

        {/* SEARCH INDEX */}

        <section className="overflow-hidden rounded-2xl border border-warm-stone/30 bg-white">
          <div className="border-b border-warm-stone/30 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-bronze/10 p-3">
                <Search className="h-5 w-5 text-bronze" />
              </div>

              <div>
                <h2 className="font-medium text-espresso">
                  Search index
                </h2>

                <p className="mt-1 text-sm text-espresso/55">
                  Maintain the Elasticsearch
                  hotel search index.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <button
              type="button"
              disabled={reindexing}
              onClick={handleReindex}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-bronze
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                hover:bg-bronze/90
                disabled:opacity-50
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  reindexing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {reindexing
                ? "Reindexing..."
                : "Reindex hotels"}
            </button>
          </div>
        </section>

        {/* ELASTICSEARCH HEALTH */}

        <section className="overflow-hidden rounded-2xl border border-warm-stone/30 bg-white">
          <div className="border-b border-warm-stone/30 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-bronze/10 p-3">
                <Database className="h-5 w-5 text-bronze" />
              </div>

              <div>
                <h2 className="font-medium text-espresso">
                  Elasticsearch
                </h2>

                <p className="mt-1 text-sm text-espresso/55">
                  Verify the connection to the
                  search cluster.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <button
              type="button"
              disabled={testing}
              onClick={
                handleTestElasticsearch
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                border
                border-warm-stone/40
                px-5
                py-2.5
                text-sm
                font-medium
                text-espresso
                hover:bg-cream
                disabled:opacity-50
              "
            >
              <ShieldCheck className="h-4 w-4" />

              {testing
                ? "Testing..."
                : "Test connection"}
            </button>

            {clusterName && (
              <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                Connected to cluster:{" "}
                <span className="font-medium">
                  {clusterName}
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}