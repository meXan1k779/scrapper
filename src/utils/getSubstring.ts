export function isSubstring(substring: string, mainString: string) {
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

export function filterArrays(autopiter: any, emex: any) {
    // Создаем массивы для хранения результатов фильтрации
    const filteredAutopiter: any = [];
    const filteredEmex: any = [];

    // Создаем копии массивов, чтобы не изменять оригинальные данные
    const emexCopy = [...emex];

    // Проходим по каждому элементу в массиве autopiter
    autopiter.forEach((autopiterItem: any) => {
        // Ищем совпадение в массиве emexCopy
      const matchIndex = emexCopy.findIndex(emexItem => isSubstring(autopiterItem.catalogName, emexItem.make));

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