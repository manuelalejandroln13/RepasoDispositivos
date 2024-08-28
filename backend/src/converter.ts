import * as fs from "fs";
import * as pdf from "html-pdf";
import { parseString } from "xml2js";
import PDFDocument from "pdfkit";

export default class Converter {
  async htmlToPdf(name: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const namePDF = name.replace(/\.html$/, ".pdf");
      const options: pdf.CreateOptions = { format: "Letter" };
      const html = fs.readFileSync(`./uploads/${name}`, "utf8");
      pdf
        .create(html, options)
        .toFile(`./uploads/${namePDF}`, (err: any, res: any) => {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
    });
  }

  async xmlToPdf(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const namePDF = name.replace(/\.xml$/, ".pdf");
      // Leer el contenido del archivo XML
      fs.readFile(`./uploads/${name}`, "utf8", (err, xmlContent) => {
        if (err) {
          reject(err);
          return;
        }
        // Parsear el XML a un objeto JavaScript
        parseString(xmlContent, (err: any, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          // Extraer texto del objeto JavaScript resultante
          const plainText = extractPlainText(result);
          // Crear un nuevo documento PDF
          const doc = new PDFDocument();
          const stream = fs.createWriteStream(`./uploads/${namePDF}`);
          // Manejar eventos de stream
          stream.on("finish", () => {
            resolve();
          });
          stream.on("error", (error) => {
            reject(error);
          });
          // Escribir el contenido del XML en el PDF
          doc.pipe(stream);
          doc.text(plainText);
          doc.end();
        });
      });
    });
  }
}

function extractPlainText(obj: any): string {
  let plainText = "";
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === "object") {
        plainText += extractPlainText(value);
      } else {
        plainText += value + " ";
      }
    }
  }
  return plainText;
}
