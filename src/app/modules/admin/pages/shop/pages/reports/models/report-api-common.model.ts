/** Period echoed by the API; `from` / `to` are inclusive `YYYY-MM-DD`. */
export type ReportApiPeriod = {
  from?: string | null;
  to?: string | null;
  days?: number | null;
};

export type FinanceInsightApi = {
  code?: string | null;
  severity?: string | null;
  message?: string | null;
};
