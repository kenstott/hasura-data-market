import type {Fetcher, FetcherReturnType} from "@graphiql/toolkit";
import process from "process";

export function createFetcher(setResponse?: (response: string) => void) {
    const fetcher: Fetcher = async (graphQLParams, opts) => {
        const body = JSON.stringify(graphQLParams)
        const uri = process.env.NEXT_PUBLIC_URI || ''
        const data = await fetch(
            uri,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...opts?.headers
                },
                body,
                credentials: 'same-origin',
            },
        );
        const text = await data.text()
        const response = JSON.parse(text)
        setResponse?.(response)
        return response as FetcherReturnType
    };
    return fetcher;
}