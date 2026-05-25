const express = require('express');
const fetch = require('node-fetch');  // ← теперь работает с версией 2
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEY = "0d515b6fd44590086c1c7ddd4d17aabb";

app.get('/', (req, res) => {
  res.send('✅ Backend FootBet Mini работает!');
});

app.get('/matches', async (req, res) => {
  try {
    const today = new Date();
    const from = today.toISOString().split('T')[0];
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const to = nextWeek.toISOString().split('T')[0];
    
    console.log('Запрос к API-Football...');
    
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?from=${from}&to=${to}&league=135`,
      {
        headers: {
          'x-apisports-key': API_KEY
        }
      }
    );
    
    const data = await response.json();
    console.log('Ответ получен, матчей:', data.response?.length || 0);
    res.json(data);
  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});