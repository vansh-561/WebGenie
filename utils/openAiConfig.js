import { config } from "@/utils/const";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: config.openai.apiKey,
});

export default openai;