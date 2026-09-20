const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.detail && typeof data.detail !== 'string') {
      console.error("FastAPI Error:", JSON.stringify(data.detail, null, 2));
      throw new Error(JSON.stringify(data.detail));
    }
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
}