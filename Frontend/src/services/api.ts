const API_BASE_URL = "http://localhost:5000/api";

export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> => {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = (await response.json()) as T;

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Something went wrong";
    throw new Error(errorMessage);
  }

  return data;
};
