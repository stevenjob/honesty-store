interface Paged {
    nextToken?: string;
}

interface Promiseable<T> {
    promise(): Promise<T>;
}

export async function listAll<Response extends Paged, Result>(
    requestFactory: (nextToken: string) => Promiseable<Response>,
    resultSelector: (response: Response) => Result[]
): Promise<Result[]> {
    const results = [];
    let nextToken = null;
    do {
        const result = await requestFactory(nextToken)
            .promise();
        results.push(...resultSelector(result));
        nextToken = result.nextToken;
    }
    while (nextToken != null);
    return results;
}
