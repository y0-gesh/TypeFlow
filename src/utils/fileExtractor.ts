/**
 * Dynamic File Extractor
 * Loads client-side PDF.js and Mammoth on-demand to parse .pdf and .docx documents without bloating bundle.
 */

const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Cannot load PDF.js server-side"));
      return;
    }
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js script"));
    document.body.appendChild(script);
  });
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  
  return fullText;
};

const loadMammoth = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Cannot load Mammoth server-side"));
      return;
    }
    if ((window as any).mammoth) {
      resolve((window as any).mammoth);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
    script.onload = () => resolve((window as any).mammoth);
    script.onerror = () => reject(new Error("Failed to load Mammoth script"));
    document.body.appendChild(script);
  });
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
  const mammoth = await loadMammoth();
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  if (fileExt === ".txt" || fileExt === ".md") {
    return await file.text();
  }
  if (fileExt === ".pdf") {
    return await extractTextFromPdf(file);
  }
  if (fileExt === ".docx") {
    return await extractTextFromDocx(file);
  }
  throw new Error(`Unsupported file format: ${fileExt}. Supported formats are .txt, .md, .pdf, and .docx.`);
};
