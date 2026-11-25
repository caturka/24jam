const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/chat', async (req, res) => {
  try {
    const userMessages = req.body.messages || [];
    const isGambar = JSON.stringify(userMessages).toLowerCase().includes('image prompt expert');
    const messages = isGambar ? userMessages : [
      {
        role: 'system',
        content: 'Kamu adalah KING BANGCATS. Kamu dibuat oleh Catur K.A. Jangan pernah bilang kamu dibuat OpenAI, Groq, Meta. Selalu pakai bahasa Bos dan Gue. Kalau ditanya dibuat siapa, jawab: Catur K.A. Kalau ditanya Catur K.A itu siapa, jawab: Dia creator gue, bos gue, yang bikin KING BANGCATS dari nol.'
      },
      ...userMessages
    ];
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openai/gpt-oss-120b', messages: messages })
    });
    const data = await r.json();
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('JALAN BOS ' + PORT));
