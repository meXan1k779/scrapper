'use client'

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const exportToExcel = (data: any) => {
  // Создаем новый массив для чередования
  const combinedData: any = [];

  // Определяем максимальную длину массивов
  const maxLength = Math.max(data.emex.length, data.autopiter.length);

  // Чередуем элементы из emex и autopiter
  for (let i = 0; i < maxLength; i++) {
    // Добавляем элемент из emex, если он существует
    if (i < data.emex.length) {
      combinedData.push({
        "Источник": "emex",
        "Производитель": data.emex[i].make,
        "Номер": data.emex[i].num,
        "Название": data.emex[i].name,
        "Цена": data.emex[i].bestPrice.value,
        "Валюта": data.emex[i].bestPrice.symbolText,
        "Ссылка": data.emex[i].url
      });
    }

    // Добавляем элемент из autopiter, если он существует
    if (i < data.autopiter.length) {
      combinedData.push({
        "Источник": "autopiter",
        "Производитель": data.autopiter[i].catalogName,
        "Номер": data.autopiter[i].number,
        "Название": data.autopiter[i].name,
        "Цена": data.autopiter[i].analogPrice || data.autopiter[i].originalPrice,
        "Валюта": "руб.",
        "Ссылка": `https://example.com/${data.autopiter[i].catalogUrl}/${data.autopiter[i].number}`
      });
    }
  }

  // Создание Excel файла
  const worksheet = XLSX.utils.json_to_sheet(combinedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Данные");

  // Сохранение файла
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(file, 'data.xlsx');
};

export default function Home() {
  const [docNumber, setDocNumber] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result: any = await fetch(`/api/data?docNumber=${docNumber}`)

      const data = await result.json()
         console.log(data,' re1s')
      setData(data.items)
    } catch (err) {
      setError((err as any).response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Scraper</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={docNumber}
          onChange={(e) => setDocNumber(e.target.value)}
          placeholder="Enter docNumber"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Scrape'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && <button onClick={() => {exportToExcel(data)}} style={{padding: '6px', backgroundColor: 'lightgreen', borderRadius: '6px'}}>Download exel</button>}
    </div>
  );
}
