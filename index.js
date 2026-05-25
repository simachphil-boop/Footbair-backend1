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

// Диагностический эндпоинт - покажет реальную ошибку
app.get('/matches', async (req, res) => {
  try {
    console.log('Запрос к API-Football...');
    
    // Простой тестовый запрос к API
    const response = await fetch('https://v3.football.api-sports.io/status', {
      headers: {
        'x-apisports-key': API_KEY
      }
    });
    
    const statusData = await response.json();
    console.log('Статус API:', statusData);
    
    // Если статус ОК - пробуем получить матчи
    if (statusData.response?.account?.subscription?.plan) {
      const fixturesResponse = await fetch(
        'https://v3.football.api-sports.io/fixtures?league=135&season=2025&next=5',
        {
          headers: {
            'x-apisports-key': API_KEY
          }
        }
      );
      
      const fixturesData = await fixturesResponse.json();
      
      // Отправляем полный ответ API (включая ошибки, если есть)
      res.json({
        apiStatus: statusData.response.account.subscription.plan,
        fixtures: fixturesData
      });
    } else {
      res.json({
        error: 'API ключ не активен',
        statusResponse: statusData
      });
    }
    
  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});