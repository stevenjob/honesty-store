interface Paged {
    NextMarker?: string;
}

interface Promiseable<T> {
    promise(): Promise<T>;
}

export async function describeAll<Response extends Paged, Result>(
    requestFactory: (Marker: string) => Promiseable<Response>,
    resultSelector: (response: Response) => Result[]
): Promise<Result[]> {
    const results = [];
    let marker = null;
    do {
        const result = await requestFactory(marker)
            .promise();
        results.push(...resultSelector(result));
        marker = result.NextMarker;
    }
    while (marker != null);
    return results;
}
