import process from "process";
import axios from "axios";

export const askMe = async ({prompt, messages}: QueryParams): Promise<AnthropicResponse | null> => {
    return new Promise<AnthropicResponse | null>((resolve, reject) => {
        const url = '/api/anthropic'
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
        const payload: AnthropicPayload = {
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 1024,
            messages: messages.concat([{role: 'user', content: prompt}])
        };
        const body = JSON.stringify(payload)
        axios.post(url, body, {headers}).then(response => {
            resolve(response.data)
        }).catch(reject)
    })
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface QueryParams {
    prompt: string,
    messages: Message[]
}

export interface AnthropicResponse {
    id: string;
    type: string;
    role: string;
    content?: MessageContent[];
    model: string;
    stop_reason: string;
    stop_sequence: string | null;
    usage: Usage;
    error?: {
        type: string
        message: string
    }
}

interface MessageContent {
    type: string;
    text: string;
}

interface AnthropicPayload {
    model: string;
    max_tokens: number;
    messages: Message[];
}

interface Usage {
    input_tokens: number;
    output_tokens: number;
}