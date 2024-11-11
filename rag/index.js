import dotenv from "dotenv";
dotenv.config();

import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

const loader = new CheerioWebBaseLoader(
  "https://lilianweng.github.io/posts/2023-06-23-agent/",
);

const docs = await loader.load();

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const splits = await textSplitter.splitDocuments(docs);

const vectorStore = await MemoryVectorStore.fromDocuments(
  splits,
  new OpenAIEmbeddings(),
);

const retriever = vectorStore.asRetriever();

// You can see this prompt at:
// https://smith.langchain.com/hub/rlm/rag-prompt?organizationId=efce71a9-8c40-44b6-a7a6-1954fd15a3b2
const prompt = await pull("rlm/rag-prompt");

const llmName = process.env.LLM_NAME || "gpt-4o-mini";
const llm = new ChatOpenAI({ model: llmName });

const ragChain = await createStuffDocumentsChain({
  llm,
  prompt,
  outputParser: new StringOutputParser(),
});

const retrievedDocs = await retriever.invoke("what is task decomposition");

const question = "What is task decomposition?";

const answer = await ragChain.invoke({
  question,
  context: retrievedDocs,
});

console.log(prompt.promptMessages["0"].lc_kwargs.prompt.lc_kwargs.template);
console.log(question);
console.log(answer);
