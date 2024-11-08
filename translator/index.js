import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

const modelName = "gpt-4o-mini";

const model = new ChatOpenAI({ model: modelName });

const messages = [
    new SystemMessage("Translate the following from English into Italian"),
    new HumanMessage("hi!"),
];

const messageChunk = await model.invoke(messages);

const parser = new StringOutputParser();
const stringResult = await parser.invoke(messageChunk);
console.log(stringResult);