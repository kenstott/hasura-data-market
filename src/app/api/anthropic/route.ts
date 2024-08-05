import assert from "assert";
import process from "process";
import {NextApiRequest} from "next";

// noinspection JSUnusedGlobalSymbols
export const maxDuration = 600

export async function POST(req: Request & NextApiRequest) {
    try {
        assert(process.env.ANTHROPIC_API_KEY)
        assert(process.env.ANTHROPIC_URI)
        assert(process.env.ANTHROPIC_VERSION)
        const apiKey = process.env.ANTHROPIC_API_KEY
        const url = process.env.ANTHROPIC_URI
        const headers = {
            'x-api-key': apiKey || '',
            'anthropic-version': process.env.ANTHROPIC_VERSION,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
        const body = await req.text()
        const response = await fetch(url, {method: 'POST', body, headers})
        const anthropicResponse = await response.text()
        return new Response(anthropicResponse)
    } catch (error) {
        return new Response(JSON.stringify(error), {status: 500})
    }
}