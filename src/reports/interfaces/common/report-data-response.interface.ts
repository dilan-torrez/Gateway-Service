export interface ReportDataResponse<TData> {
  error: boolean;
  message: string;
  data: TData | null;
}
