export function sanitizeUsername(username: string) {
  return username.toLowerCase().replace(/\s/g, '');
}
