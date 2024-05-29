import type {Fetcher} from "@graphiql/toolkit";
import process from "process";

export function createFetcher(setResponse?: (response: string) => void) {
    const fetcher: Fetcher = async (graphQLParams, opts) => {
        const body = JSON.stringify(graphQLParams)
        const data = await fetch(
            process.env.NEXT_PUBLIC_URI || '',
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
        const response = await data.json()
        setResponse?.(response)
        return response
    };
    return fetcher;
}