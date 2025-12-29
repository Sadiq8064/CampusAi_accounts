
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import * as XLSX from 'xlsx';

// Set up PDF.js worker
// We use a CDN for the worker to avoid complex build configurations
// Note: pdfjs-dist@5.x uses .mjs extension for the worker in the build folder
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Extracts text from various file formats and returns it as a string.
 */
export async function extractTextFromFile(file: File): Promise<string> {
    const name = file.name.toLowerCase();

    try {
        if (name.endsWith(".pdf")) {
            return await extractPDF(file);
        } else if (name.endsWith(".docx")) {
            return await extractDOCX(file);
        } else if (name.endsWith(".xlsx")) {
            return await extractExcel(file);
        } else if (name.endsWith(".json")) {
            return await extractJSON(file);
        } else if (name.match(/\.(png|jpg|jpeg)$/)) {
            return await extractImage(file);
        } else if (name.endsWith(".txt")) {
            return await file.text();
        } else {
            // For other files, try reading as text
            return await file.text();
        }
    } catch (error) {
        console.error("Text extraction failed:", error);
        throw new Error(`Failed to extract text from ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// --- Helper Functions ---

async function extractPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;

    let txt = "";

    for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();

        const lines: Record<number, string[]> = {};

        content.items.forEach((item: any) => {
            // item.transform[5] is the y-coordinate
            const y = Math.round(item.transform[5]);
            if (!lines[y]) lines[y] = [];
            lines[y].push(item.str);
        });

        // Sort lines top -> bottom (descending Y)
        const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);

        sortedY.forEach(y => {
            const line = lines[y].join(" ").trim();
            if (line) {
                txt += line + "\n";
            }
        });

        txt += `\n---- PAGE ${p} ----\n\n`;
    }

    return txt;
}

async function extractDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    // Convert HTML -> TXT
    // Simple regex-based cleanup as per user's snippet
    let clean = result.value
        .replace(/<table[\s\S]*?<\/table>/g, m => htmlTableToAscii(m))
        .replace(/<[^>]*>/g, "") // Remove tags
        .replace(/\n{3,}/g, "\n\n"); // Normalize newlines

    return clean.trim();
}

function htmlTableToAscii(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const rows: string[][] = [];
    doc.querySelectorAll("tr").forEach(tr => {
        const row: string[] = [];
        tr.querySelectorAll("td,th").forEach(cell => {
            row.push(cell.textContent?.trim() || "");
        });
        rows.push(row);
    });

    return makeAsciiTable(rows);
}

function makeAsciiTable(rows: string[][]): string {
    if (!rows || rows.length === 0) return "";

    const colWidths: number[] = [];
    rows.forEach(row => {
        row.forEach((cell, i) => {
            colWidths[i] = Math.max(colWidths[i] || 0, cell.length);
        });
    });

    function formatRow(row: string[]) {
        return "| " + row.map((cell, i) =>
            cell.padEnd(colWidths[i])).join(" | ") + " |";
    }

    const border = "+-" + colWidths.map(w => "-".repeat(w)).join("-+-") + "-+";

    return border + "\n" +
        rows.map(formatRow).join("\n") +
        "\n" + border + "\n\n";
}

async function extractExcel(file: File): Promise<string> {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: "array" });

    let txt = "";

    wb.SheetNames.forEach(sheetName => {
        const sheet = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

        txt += `\n=== ${sheetName} ===\n\n`;
        // Cast rows to string[][] for makeAsciiTable
        const strRows = rows.map(row => row.map(cell => String(cell || "")));
        txt += makeAsciiTable(strRows);
    });

    return txt;
}

async function extractJSON(file: File): Promise<string> {
    const text = await file.text();
    try {
        const obj = JSON.parse(text);
        return JSON.stringify(obj, null, 4);
    } catch {
        return "Invalid JSON";
    }
}

async function extractImage(file: File): Promise<string> {
    // Tesseract worker creation and termination is handled cleanly
    const worker = await Tesseract.createWorker('eng');
    const result = await worker.recognize(file);
    await worker.terminate();
    return result.data.text;
}
