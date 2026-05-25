const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// TheSportsDB бесплатный API ключ
const API_KEY = "123"; // бесплатный ключ для всех

// ID популярных команд (можно добавить любые)
const TEAMS = {
  arsenal: 133604,
  mancity: 133602,
  liverpool: 133605,
  chelsea: 133603,
  manutd: 133600,
  barcelona: 133680,
  realmadrid: 133681,
  bayern: 133709,
  psg: 133717,
  juventus: 133630,
  milan: 133631,
  inter: 133632
};

app.get('/', (req, res) => {
  res.send('✅ Backend FootBet Mini работает на TheSportsDB!');
});

// Получить ближайшие матчи (первые 30)
app.get('/matches', async (req, res) => {
  try {
    let allMatches = [];
    
    // Проходим по всем командам и собираем матчи
    for (const [teamName, teamId] of Object.entries(TEAMS)) {
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsnext.php?id=${teamId}`
      );
      
      const data = await response.json();
      
      if (data.events && data.events.length > 0) {
        // Добавляем название команды к каждому матчу
        const matchesWithTeam = data.events.map(match => ({
          ...match,
          sourceTeam: teamName
        }));
        allMatches = [...allMatches, ...matchesWithTeam];
      }
      
      // Небольшая задержка, чтобы не перегружать API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Убираем дубликаты матчей (по idEvent)
    const uniqueMatches = [];
    const seenIds = new Set();
    
    for (const match of allMatches) {
      if (!seenIds.has(match.idEvent)) {
        seenIds.add(match.idEvent);
        uniqueMatches.push(match);
      }
    }
    
    // Сортируем по дате
    uniqueMatches.sort((a, b) => new Date(a.dateEvent) - new Date(b.dateEvent));
    
    // Отдаём первые 30 матчей
    res.json({
      success: true,
      count: uniqueMatches.slice(0, 30).length,
      matches: uniqueMatches.slice(0, 30)
    });
    
  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Получить матчи конкретной команды
app.get('/team/:name', async (req, res) => {
  try {
    const teamName = req.params.name.toLowerCase();
    const teamId = TEAMS[teamName];
    
    if (!teamId) {
      return res.status(404).json({ 
        success: false, 
        error: `Команда "${teamName}" не найдена` 
      });
    }
    
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsnext.php?id=${teamId}`
    );
    
    const data = await response.json();
    
    res.json({
      success: true,
      team: teamName,
      matches: data.events || []
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Поиск команды по названию
app.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchteams.php?t=${query}`
    );
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📋 Доступные команды: ${Object.keys(TEAMS).join(', ')}`);
});