import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { ParsedQs } from "qs";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import Langchain_PDF from "./langchain_PDF";
import JoinPdf from "./joinPdf";

dotenv.config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT;
const cors = require("cors");
// Define `guardarData` como un arreglo vacío al inicio
const guardarData: { label: string; valor: string }[] = [];


app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//    ************      API Rest User      ************
let names = [
  {
    id: uuidv4(),
    firstName: "Manuel",
    lastName: "López",
  },
];

app.get("/nombres", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(names);
});

app.get("/nombres/:id", (req: Request, res: Response) => {
  const searchedName = names.find((n) => n.id === req.params.id);
  if (!searchedName) res.status(400).end();
  res.send(searchedName);
});

app.post("/nombres", (req: Request, res: Response) => {
  const item = { ...req.body, id: uuidv4() };
  names.push(item);
  res.send(item);
});

app.delete("/nombres/:id", (req: Request, res: Response) => {
  names = names.filter((n) => n.id !== req.params.id);
  res.status(204).end();
});

app.put("/nombres/:id", (req: Request, res: Response) => {
  const index = names.findIndex((n) => n.id === req.params.id);
  if (index === -1) res.status(404).end();
  names[index] = { ...req.body, id: req.params.id };
  res.status(204).end();
});

//    ************      API Rest OpenAI Convert      ************
app.post("/openapi", async (req: Request, res: Response) => {
  const prompt = ChatPromptTemplate.fromMessages([
    ["human", "Convierte este numero {topic} en binario"], //prompt con marcador de posicion
  ]);
  const model = new ChatOpenAI({}); //instancia del modelo
  const outputParser = new StringOutputParser(); //parsear la salida
  const chain = prompt.pipe(model).pipe(outputParser); // encadenar el procesamiento
  const response = await chain.invoke({ topic: req.body.num,  });
  res.send({ result: response }); //enviar la respuesta al cliente
});




//      *********** API Rest OpenAI Order  ******************
app.post('/openapi', async (req: Request, res: Response) => {
  const { llamada: userCode, valor: userValue } = req.body;
  const prompt = ChatPromptTemplate.fromMessages([
    ["human", `Quiero que clasifiques el mensaje en dos partes por medio de la coma.
      Aquí están los datos: 
      Antes de la coma - code: ${userCode}
      Despues de la coma - Valor: ${userValue} 
  
    Primero, convierte a binario el codigo ${userCode} y cuenta el número de letras que tiene el valor ${userValue}
    Finalmente, guardas el historial de respuestas que entreges. 
    Proporciona la respuesta en el siguiente formato JSON:
    {
    "code": numero convertido en binario,
    "valor": "el contador del texto"
    }`],
  ]);
  const model = new ChatOpenAI({});
  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(outputParser);
  try {
    const response = await chain.invoke({
      topic: userCode,
    });
    let respuesta = response.trim();

    // Eliminar delimitadores de bloque de código
    if (respuesta.startsWith('```json\n') && respuesta.endsWith('\n```')) {
      respuesta = respuesta.substring(8, respuesta.length - 4).trim();
    }
    try {
      const respuestaJson = JSON.parse(respuesta);
      guardarData.push(respuestaJson);
      res.json(guardarData);
    } catch (error) {
      console.error('Error decodificando JSON:', error);
      res.status(500).json({ error: 'No puedo generar una respuesta , porque solo tengo el entrenamiento en binario y contar vocales' });
    }
  } catch (error) {
    console.error('Error en la solicitud a OpenAI:', error);
    res.status(500).json({ error: 'No puedo generar una respuesta , porque solo tengo el entrenamiento en binario y contar vocales' });
  }
});





//    ************      API Rest OpenAI PDF      ************
const fs = require("fs");
app.post("/upload", async (req: Request, res: Response) => {
  const copyFilePromise = new Promise<void>((resolve, reject) => {
    req
      .pipe(fs.createWriteStream(`./uploads/${req.headers.name}`))
      .on("finish", resolve)
      .on("error", reject);
  });
  try {
    await copyFilePromise;
    res.send(copyFilePromise);
  } catch (error) {
    res.status(500).send("Error al copiar el archivo");
  }
});

app.get("/question", async (req: Request, res: Response) => {
  const langchain = new Langchain_PDF();
  try {
    const question: string = req.query.question as string;
    const pdfsParam: string | string[] | ParsedQs | ParsedQs[] | undefined = req.query.pdfs;
    if (pdfsParam === undefined) {
      throw new Error("PDFs parameter is missing.");
    }
    const pdfs = JSON.parse(pdfsParam as string);
    let name: string = "";
    if (pdfs.length > 1) {
      const pdfString: string[] = [];
      for (let i = 0; i < pdfs.length; i++) {
        pdfString.push(`./uploads/${pdfs[i].title}`);
      }
      new JoinPdf()
        .unirPDFs(pdfString, "./uploads/joinPdf.pdf")
        .catch((error) => console.error("Error:", error));
      name = "joinPdf.pdf";
    } else {
      name = pdfs[0].title as string;
    }
    await langchain.processPDFToVectorStore(name);
    const response = await langchain.useFaissVectorStrore(question);
    res.send(response.text);
  } catch (error) {
    res.status(500).send("Error generando respuesta");
  }
});

//    ************      API Rest PDF to Text      ************
const pdfPasrse = require("pdf-parse");
app.get("/getText", async (req: Request, res: Response) => {
  try {
    const pdf = `./uploads/${req.query.name}`;
    let dataBuffer = fs.readFileSync(pdf);
    pdfPasrse(dataBuffer).then(function (data: any) {
      res.send(data.text);
    });
  } catch (error) {
    res.status(500).send("Error al obtener texto del PDF");
  }
});

app.listen(PORT, () => {
  console.log(`running application ${PORT}`);
});

