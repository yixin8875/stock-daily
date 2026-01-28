import axios, { AxiosRequestConfig } from 'axios';

interface RetryConfig {
  retries?: number;
  delay?: number;
  timeout?: number;
}

const defaultConfig: RetryConfig = {
  retries: 3,
  delay: 1000,
  timeout: 10000,
};

export async function fetchWithRetry<T>(
  url: string,
  config?: AxiosRequestConfig,
  retryConfig?: RetryConfig
): Promise<T> {
  const { retries, delay, timeout } = { ...defaultConfig, ...retryConfig };
  let lastError: Error | null = null;

  for (let i = 0; i <= retries!; i++) {
    try {
      const response = await axios.get<T>(url, {
        ...config,
        timeout,
      });
      return response.data;
    } catch (error) {
      lastError = error as Error;
      if (i < retries!) {
        await new Promise(r => setTimeout(r, delay! * (i + 1)));
      }
    }
  }

  throw lastError;
}
