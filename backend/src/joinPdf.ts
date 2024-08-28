import { PDFDocument } from "pdf-lib";
import fs from "fs/promises";

export default class JoinPdf {
  async unirPDFs(
    nombresArchivos: string[],
    nombreArchivoSalida: string
  ): Promise<void> {
    try {
      const pdfDoc = await PDFDocument.create();
      // Iterar sobre cada archivo PDF que queremos unir
      for (const nombreArchivo of nombresArchivos) {
        const contenidoPDF = await fs.readFile(nombreArchivo);
        const doc = await PDFDocument.load(contenidoPDF);
        // Copiar todas las páginas del archivo PDF cargado al nuevo documento PDF
        const paginas = await pdfDoc.copyPages(doc, doc.getPageIndices());
        paginas.forEach((pagina) => {
          pdfDoc.addPage(pagina);
        });
      }
      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(nombreArchivoSalida, pdfBytes);
    } catch (error) {
      throw error;
    }
  }
}
