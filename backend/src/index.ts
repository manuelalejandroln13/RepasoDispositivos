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
    ["human", "Convierte este numero {topic} en binario"],
  ]);
  const model = new ChatOpenAI({});
  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(outputParser);
  const response = await chain.invoke({
    topic: req.body.num,
  });
  res.send({ result: response });
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

