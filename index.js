const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEY = "0d515b6fd44590086c1c7ddd4d17aabb";

app.get('/', (req, res) => {
  res.send('✅ Backend FootBet Mini работает!');
});

// Получить ближайшие матчи (топ-5 лиг)
app.get('/matches', async (req, res) => {
  try {
    // Популярные лиги: 135=Серия А, 140=Ла Лига, 39=АПЛ, 78=Бундеслига, 61=Лига 1
    const leagues = [135, 140, 39, 78, 61];
    let allFixtures = [];

    for (const leagueId of leagues) {
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=2025&next=10`,
        {
          headers: {
            'x-apisports-key': API_KEY
          }
        }
      );
      
      const data = await response.json();
      if (data.response) {
        allFixtures = [...allFixtures, ...data.response];
      }
      
      // Небольшая задержка, чтобы не превысить лимиты API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Сортируем по дате
    allFixtures.sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));
    
    res.json({ response: allFixtures.slice(0, 30) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении матчей: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});