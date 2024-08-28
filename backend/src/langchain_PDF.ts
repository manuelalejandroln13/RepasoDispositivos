import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

dotenv.config();

class Langchain_PDF {
  private model: OpenAI;

  constructor() {
    this.model = new OpenAI({
      temperature: 0.5,
      modelName: "gpt-3.5-turbo",
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token) {
            process.stdout.write(token);
          },
        },
      ],
    });
  }

  async main(prompt: string) {
    try {
      const res = await this.model.call(prompt);
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  async processPDFToVectorStore(name: string) {
    const loader = new PDFLoader(`./uploads/${name}`, {
      splitPages: false,
    });
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 50,
    });
    const documents = await splitter.splitDocuments(docs);
    const embeddings = new OpenAIEmbeddings();
    const vectorstore = await FaissStore.fromDocuments(documents, embeddings);
    await vectorstore.save("./vector-store-pdf");
    // console.log("PDF to Faiss Vector Store Created successfully");
  }

  async useFaissVectorStrore(prompt: string) {
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await FaissStore.load("./vector-store-pdf", embeddings);

    const template = `Si no sabes la respuesta, di simplemente que no la sabes, no intentes inventarte una respuesta. 
    Además, DEBES poner la {question} en mayúsculas al principio de cada respuesta. 
    {context} 
    Question: {question}
    Must Display the Question in full: {question}
    Di siempre "¡Gracias por preguntar!" al final de la respuesta.`;

    const QA_CHAIN_PROMPT = new PromptTemplate({
      inputVariables: ["context", "question"],
      template,
    });

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(this.model, {
        prompt: QA_CHAIN_PROMPT,
      }),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: false,
    });

    const res = await chain.call({
      query: prompt,
    });

    const tokens = res.response.split(" ");
    const numTokens = tokens.length;
    const responseWithTokens = `${res.response} (Número de tokens utilizados: ${numTokens})`;
    return responseWithTokens;
  }
}

export default Langchain_PDF;
