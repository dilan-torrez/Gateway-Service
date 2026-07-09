export interface ReportRenderResult {
  buffer: Buffer;
  fileName: string;
  contentType: 'application/pdf';
  disposition: 'inline' | 'attachment';
}
