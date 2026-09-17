const siteContext = `You are the Voltaik AI website assistant. Answer only from the website context supplied by the user and the facts below. If the answer is not on the website, say you do not have that information and direct the visitor to mohamed@voltaikai.com or the booking page. Never invent pricing, guarantees, customer results, service areas beyond the United States, or technical capabilities.

Voltaik AI helps U.S. solar installers and solar sales organizations generate and convert leads. Its system includes AI-generated UGC-style Meta ads with instant lead forms, an AI voice agent that calls new leads within 0-5 minutes to double-qualify and book consultations, and automated SMS/email reminders plus a pre-call reminder call to reduce no-shows. Qualification can include criteria such as minimum monthly utility bill, homeowner status, and roof condition. The business operates on a pay-per-sit model and visitors can book a strategy call. The founder is Mohamed Boualamallah. Contact: mohamed@voltaikai.com and +1 (213) 789-4750.`;

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    response.status(503).json({ error: 'The assistant is not configured yet.' });
    return;
  }

  const { question, page } = request.body || {};
  if (typeof question !== 'string' || !question.trim() || question.length > 500) {
    response.status(400).json({ error: 'Please enter a question under 500 characters.' });
    return;
  }

  const prompt = `${siteContext}\n\nCurrent website page context:\n${typeof page === 'string' ? page.slice(0, 24000) : ''}\n\nVisitor question:\n${question.trim()}`;

  try {
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 350 }
        })
      }
    );

    const result = await geminiResponse.json();
    if (!geminiResponse.ok) {
      const errorMessage = result.error?.message || `HTTP ${geminiResponse.status}`;
      console.error('Gemini request failed:', errorMessage);
      if (geminiResponse.status === 401 || geminiResponse.status === 403) {
        response.status(503).json({ error: 'The assistant is temporarily misconfigured. Please try again later.' });
        return;
      }
      if (geminiResponse.status === 429) {
        response.status(503).json({ error: 'The assistant is busy right now. Please try again in a moment.' });
        return;
      }
      response.status(502).json({ error: 'The assistant is unavailable right now. Please try again shortly.' });
      return;
    }

    const answer = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!answer) throw new Error('Empty Gemini response');
    response.status(200).json({ answer });
  } catch (error) {
    console.error('Chat request failed:', error.message);
    response.status(502).json({ error: 'The assistant is unavailable right now. Please email mohamed@voltaikai.com.' });
  }
}
