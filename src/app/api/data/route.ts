import { filterArrays } from '@/utils/getSubstring';
import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {

  const { searchParams } = new URL(request.url);
  const docNumber = searchParams.get('docNumber');

  if (!docNumber) {
    return Response.json({ error: 'docNumber is required' });
  }

  try {
    // Первый запрос для получения массива элементов
    const searchDetailsResponse = await axios.get(`https://autopiter.ru/api/api/searchdetails?detailNumber=${docNumber}`);
    const items = searchDetailsResponse.data.data.catalogs;

    if (!items || items.length === 0) {
      return Response.json({ error: 'No items found' });
    }

    // Извлекаем ID элементов

    const itemIds = items?.map((item: any) => item.id);

    // Второй запрос для получения стоимости элементов
    const costResponse = await axios.get(`https://autopiter.ru/api/api/appraise/getcosts?idArticles=${itemIds.join('&idArticles=')}`);
    const costs = costResponse.data;

    const resp2 = await axios.get(`https://emex.ru/api/search/search2?detailNum=${docNumber}&isHeaderSearch=true&showAll=true&searchSource=direct&searchString=${docNumber}`)

    const emexData = resp2?.data?.searchResult?.makes?.list

    // Возвращаем результат
    const res = items.map((item: any, i: number) => ({ ...item, ...costs.data[i] }))
console.log('222', emexData)
    const filtered = filterArrays(res, emexData)
    return Response.json({ items: filtered });
  } catch (error) {
    console.error('Error scraping data:', error);
    return Response.json({ error: 'Internal Server Error' });
  }
}