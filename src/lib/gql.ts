// Tiny GraphQL client: no library, just fetch (queries/mutations) and EventSource (subscriptions).

/** Send a query or mutation and return its `data`. */
export async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (body.errors?.length) throw new Error(body.errors[0].message);
  return body.data as T;
}

/**
 * Start a subscription over Server-Sent Events (the server streams "next" events, then "complete").
 * Returns a function that stops listening.
 */
export function subscribe<T>(
  query: string,
  variables: Record<string, unknown>,
  onData: (data: T) => void,
  onComplete: () => void = () => {},
): () => void {
  const url = `/graphql?query=${encodeURIComponent(query)}&variables=${encodeURIComponent(JSON.stringify(variables))}`;
  const source = new EventSource(url);
  source.addEventListener("next", (e) => onData(JSON.parse((e as MessageEvent).data).data as T));
  source.addEventListener("complete", () => { source.close(); onComplete(); });
  source.onerror = () => { source.close(); onComplete(); }; // server gone or stream ended
  return () => source.close();
}
