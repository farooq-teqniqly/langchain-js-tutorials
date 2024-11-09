import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { v4 as uuidv4 } from "uuid";

import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
  Annotation,
} from "@langchain/langgraph";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful assistant. Answer all questions to the best of your ability in {language}. Answer in the informal or conversational form of {language}.",
  ],
  new MessagesPlaceholder("messages"),
]);

const modelName = process.env.MODEL_NAME || "gpt-4o-mini";
const model = new ChatOpenAI({ model: modelName });

const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  language: Annotation(),
});

const callModel = async (state) => {
  const chain = prompt.pipe(model);
  const response = await chain.invoke(state);
  return { messages: [response] };
};

const workflow = new StateGraph(GraphAnnotation)
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

const app = workflow.compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: uuidv4() } };

const input = {
  messages: [
    {
      role: "user",
      content: "hi im Farooq",
    },
  ],
  language: "German",
};

const output = await app.invoke(input, config);
console.log(output.messages[output.messages.length - 1]);

const input2 = {
  messages: [
    {
      role: "user",
      content: "hi im Farooq",
    },
  ],
};

const output2 = await app.invoke(input2, config);
console.log(output2.messages[output2.messages.length - 1]);

const config2 = { configurable: { thread_id: uuidv4() } };
const input3 = {
  messages: [
    {
      role: "user",
      content: "hi im Farooq",
    },
  ],
};

const output3 = await app.invoke(input3, config2);
console.log(output3.messages[output3.messages.length - 1]);

const output4 = await app.invoke(input2, config);
console.log(output4.messages[output4.messages.length - 1]);
