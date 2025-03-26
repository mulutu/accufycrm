declare module 'pdf-parse' {
  interface PDFInfo {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    CreationDate?: string;
    ModDate?: string;
    Producer?: string;
    Creator?: string;
    [key: string]: string | undefined;
  }

  interface PDFMetadata {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    CreationDate?: string;
    ModDate?: string;
    Producer?: string;
    Creator?: string;
    [key: string]: string | undefined;
  }

  interface PDFData {
    text: string;
    numpages: number;
    info: PDFInfo;
    metadata: PDFMetadata;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFData>;
  export default pdfParse;
} 