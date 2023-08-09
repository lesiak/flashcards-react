export function getForvoPronunciations(lang: string, word: string): Promise<Response> {
  const url = `/api/word-pronunciations/word/${word}/language/${lang}`
  console.log(url);
  // call the web server asynchronously
  return fetch(url);
}