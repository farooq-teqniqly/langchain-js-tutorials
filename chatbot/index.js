import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";

const modelName = process.env.MODEL_NAME || "gpt-4o-mini";
const model = new ChatOpenAI({ model: modelName });

let result = await model.invoke([
    {role: "user", content: "Hi, I'm Farooq."},
    {role: "assistant", content: "Hello Farooq! How can I assist you today?"},
    {role: "user", content: "What's my name?"}
]);

console.log(result);
