// server.js
const express = require('express');
const cors = require('cors');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Настройка CORS для разрешения запросов с порта 3001
  server.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // API-ручка для получения постов
  server.get('/emexlist', async (req, res) => {
    const { docNumber } = req.query;
    console.log('hi')

    const searchDetailsResponse = await fetch(`https://autopiter.ru/api/api/searchdetails?detailNumber=${docNumber}`);
    const autopiterData = await searchDetailsResponse.json()

     const items = autopiterData?.data?.catalogs;

    if (!items || items.length === 0) {
      return res.json({ error: 'No items found' });
    }

    // Извлекаем ID элементов

    const itemIds = items?.map(item => item.id);

    // Второй запрос для получения стоимости элементов
    const costResponse = await fetch(`https://autopiter.ru/api/api/appraise/getcosts?idArticles=${itemIds.join('&idArticles=')}`);
    const costResponseJson = await costResponse.json();
    const costs = costResponseJson.data

    const emexResp = await fetch(`https://emex.ru/api/search/search2?detailNum=${docNumber}&isHeaderSearch=true&showAll=true&searchSource=direct&searchString=${docNumber}`)
    const result = await emexResp.json()
        console.log('result', result)
    const emexData = result.searchResult.makes.list

    // Возвращаем результат

    const autopiterResult = items.map((item, i) => ({ ...item, ...costs[i] }))
    
    const filteredData = filterArrays(autopiterResult, emexData)

    if (emexResp.status === 200) {
      res.json({filteredData});
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  });

  // Обработка всех остальных запросов через Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Запуск сервера на порту 3000
  server.listen(3008, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});

function isSubstring(substring, mainString) {
  // Приводим обе строки к нижнему регистру
  const lowerCaseSubstring = substring.toLowerCase();
  const lowerCaseMainString = mainString.toLowerCase();

  // Проверяем, что подстрока не длиннее основной строки
  if (lowerCaseSubstring.length > lowerCaseMainString.length) {
    return lowerCaseSubstring.includes(lowerCaseMainString)
  }

  // Проверяем, содержится ли подстрока в основной строке
  return lowerCaseMainString.includes(lowerCaseSubstring);
}

function filterArrays(autopiter, emex) {
    // Создаем массивы для хранения результатов фильтрации
    let filteredAutopiter = [];
    let filteredEmex = [];

    // Создаем копии массивов, чтобы не изменять оригинальные данные
    let emexCopy = [...emex];

    // Проходим по каждому элементу в массиве autopiter
    autopiter.forEach(autopiterItem => {
        // Ищем совпадение в массиве emexCopy
      let matchIndex = emexCopy.findIndex(emexItem => isSubstring(autopiterItem.catalogName, emexItem.make));

        // Если есть совпадение, добавляем элементы в результирующие массивы
        if (matchIndex !== -1) {
            filteredAutopiter.push(autopiterItem);
            filteredEmex.push(emexCopy[matchIndex]);
            // Удаляем совпавший элемент из emexCopy, чтобы избежать повторного использования
            emexCopy.splice(matchIndex, 1);
        }
    });

    // Возвращаем объект с отфильтрованными массивами
    return {
        autopiter: filteredAutopiter,
        emex: filteredEmex
    };
}