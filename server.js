const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());

// Biar HTML lu bisa kebuka
app.use(express.static(path.join(__dirname)));

// API CHAT - Ini otak nya, Bos
app.post('/api/chat', async (req, res) => {
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: req.body.messages
      })
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('JALAN BOS ' + PORT));