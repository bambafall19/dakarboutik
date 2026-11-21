export function adminImageUrl(value: string, origin: string) {
  const image = value.trim();
  return /^\/api\/media\/file\/[a-zA-Z0-9_-]+$/.test(image)
    ? new URL(image, origin).href
    : image;
}
