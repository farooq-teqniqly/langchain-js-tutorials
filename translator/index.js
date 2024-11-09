import dotenv from "dotenv";
dotenv.config();

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

const allowedLanguages = ["French", "Italian", "German", "Spanish"];

const argv = yargs(hideBin(process.argv)).option("language", {
    alias: "l",
    type: "string",
    description: "Language to translate to",
    demandOption: true,
    choices: allowedLanguages
})
.option("english", {
        alias: "e",
        type: "string",
        description: "English text to translate",
        demandOption: true
})
.argv;

const modelName = "gpt-4o-mini";
const model = new ChatOpenAI({ model: modelName });

const {english} = argv;
const targetLanguage = argv.language;

const messages = [
    new SystemMessage(`Translate the following from English into ${targetLanguage}`),
    new HumanMessage(english),
];

const messageChunk = await model.invoke(messages);

const parser = new StringOutputParser();
const stringResult = await parser.invoke(messageChunk);
console.log(stringResult);