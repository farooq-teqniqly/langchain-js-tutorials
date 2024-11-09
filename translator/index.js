import dotenv from "dotenv";
dotenv.config();

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const allowedLanguages = ["French", "Italian", "German", "Spanish"];

const argv = yargs(hideBin(process.argv))
  .option("language", {
    alias: "l",
    type: "string",
    description: "Language to translate to",
    demandOption: true,
    choices: allowedLanguages,
  })
  .option("english", {
    alias: "e",
    type: "string",
    description: "English text to translate",
    demandOption: true,
  }).argv;

const { english, language } = argv;

const systemTemplate = "Translate the following from English into {language}:";

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["user", "{text}"],
]);

const modelName = process.env.MODEL_NAME || "gpt-4o-mini";
const model = new ChatOpenAI({ model: modelName });

const parser = new StringOutputParser();

const chain = promptTemplate.pipe(model).pipe(parser);

const stringResult = await chain.invoke({ language, text: english });

console.log(stringResult);
