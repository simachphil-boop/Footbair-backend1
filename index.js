const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEY = "0d515b6fd44590086c1c7ddd4d17aabb";

// Проверка работы сервера
app.get('/', (req, res) => {
  res.send('✅ Backend FootBet Mini работает!');
});

// Получить следующие матчи
app.get('/matches', async (req, res) => {
  try {
    const response = await fetch('https://v3.football.api-sports.io/fixtures?next=20', {
      headers: {
        'x-apisports-key': API_KEY
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении матчей' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});