export function parseAllowedOrigins(frontendUrl: string): string[] {
  return frontendUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isAllowedCorsOrigin(origin: string | undefined, frontendUrl: string, isDev: boolean): boolean {
  if (!origin) {
    return true;
  }

  const isLocalDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  return parseAllowedOrigins(frontendUrl).includes(origin) || (isDev && isLocalDevOrigin);
}
