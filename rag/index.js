import dotenv from "dotenv";
dotenv.config();

import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { PromptTemplate } from "@langchain/core/prompts";

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

const vectorStoreRetriever = vectorStore.asRetriever();

const llmName = process.env.LLM_NAME || "gpt-4o-mini";
const llm = new ChatOpenAI({ model: llmName });

const customTemplate = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.
Always say "thanks for asking!" at the end of the answer.

{context}

Question: {question}

Helpful Answer:`;

const ragPrompt = PromptTemplate.fromTemplate(customTemplate);

const runnableRagChain = RunnableSequence.from([
  {
    context: vectorStoreRetriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  ragPrompt,
  llm,
  new StringOutputParser(),
]);

console.log("PROMPT:");
console.log(ragPrompt.template);
console.log("=======================");

const question = "What is task decomposition?";
console.log("QUESTION:");
console.log(question);
console.log("=======================");

console.log("ANSWER:");

// for await (const chunk of await runnableRagChain.stream(question)) {
//   console.log(chunk);
// }

const answer = await runnableRagChain.invoke(question);
console.log(answer);
