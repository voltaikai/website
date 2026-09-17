# Voltaik AI website

## Chat assistant deployment

The chatbot UI is shared by every HTML page and sends questions to `/api/chat`. The Gemini credential is intentionally read only from the server environment.

For the chatbot to work, deploy this repository on Vercel and add the provided Gemini key as an environment variable named `GEMINI_API_KEY` for the Production environment. Do not paste the key into any HTML, JavaScript, or committed file.

GitHub Pages can serve the static pages, but it cannot execute the `/api/chat` serverless function. If the site remains on GitHub Pages, set `VOLTAIK_CHAT_ENDPOINT` in a small browser-side configuration to point at a separately hosted copy of this API route.
