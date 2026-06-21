export type Locale = 'ru' | 'en';

export type Messages = {
  lang: {
    switchToEn: string;
    switchToRu: string;
    ariaRu: string;
    ariaEn: string;
  };
  toolbar: {
    undo: string;
    undoAria: string;
    redo: string;
    redoAria: string;
    addCard: string;
    addCardShort: string;
    addGroup: string;
    addGroupShort: string;
    save: string;
    saveTitle: string;
    load: string;
    loadTitle: string;
    newBoard: string;
    newBoardTitle: string;
    demo: string;
    demoTitle: string;
    statsTitle: string;
  };
  hints: {
    desktop: string;
    mobile: string;
  };
  footer: {
    donate: string;
    donateTitle: string;
    donateHint: string;
    donateCopy: string;
    donateCopied: string;
    donateLink: string;
  };
  edgePanel: {
    title: string;
    placeholder: string;
    hint: string;
    clearLabel: string;
    delete: string;
  };
  selectionPanel: {
    group: string;
    card: string;
    groupNamePlaceholder: string;
    cardNamePlaceholder: string;
    color: string;
  };
  saveModal: {
    title: string;
    description: string;
    nameLabel: string;
    namePlaceholder: string;
    filenamePrefix: string;
    enterName: string;
    saveFailed: string;
    saving: string;
    done: string;
    saveButton: string;
    defaultName: string;
  };
  demoSplash: {
    welcome: string;
    title: string;
    subtitle: string;
    close: string;
    cards: (n: number) => string;
    groups: (n: number) => string;
    links: (n: number) => string;
  };
  boardStats: {
    cards: (n: number) => string;
    links: (n: number) => string;
  };
  colors: Record<string, string>;
  colorsCustom: string;
  card: {
    newIdea: string;
    placeholder: string;
    defaultText: string;
  };
  group: {
    defaultLabel: string;
    namePlaceholder: string;
    renameTitle: string;
  };
  confirm: {
    newBoard: string;
  };
  toast: {
    opened: (filename: string) => string;
    close: string;
  };
  errors: {
    loadFailed: string;
    invalidCanvas: string;
    readFailed: string;
    parseFailed: string;
    missingCanvas: string;
  };
  file: {
    defaultTitle: string;
    fallbackTitle: string;
    savedAs: (filename: string) => string;
    savedDownloads: (filename: string) => string;
    typeDescription: string;
  };
  demoBoardName: string;
};

const colorIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${n} ${many}`;
  if (mod10 === 1) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} ${few}`;
  return `${n} ${many}`;
}

function pluralEn(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

function colorRecord(names: Record<(typeof colorIds)[number], string>): Record<string, string> {
  return names;
}

export const messagesRu: Messages = {
  lang: {
    switchToEn: 'English',
    switchToRu: 'Русский',
    ariaRu: 'Русский язык',
    ariaEn: 'English language',
  },
  toolbar: {
    undo: 'Отменить (Ctrl+Z)',
    undoAria: 'Отменить',
    redo: 'Вернуть (Ctrl+Shift+Z)',
    redoAria: 'Вернуть',
    addCard: 'Добавить карточку',
    addCardShort: '+ Карточка',
    addGroup: 'Добавить группу',
    addGroupShort: '◻ Группа',
    save: 'Сохранить',
    saveTitle: 'Сохранить схему в файл на компьютер',
    load: 'Загрузить',
    loadTitle: 'Загрузить схему с компьютера',
    newBoard: '↺ Сначала',
    newBoardTitle: 'Новая пустая схема',
    demo: 'Демо',
    demoTitle: 'Загрузить демо-схему MindStorm',
    statsTitle: 'Сколько карточек и линий на доске',
  },
  hints: {
    desktop:
      'Двойной клик — карточка · Клик по узлу — цвет и название · Линия — подпись · Delete',
    mobile: 'Тап×2 — карточка · Узел — цвет · Линия — подпись',
  },
  footer: {
    donate: '☕ Донат',
    donateTitle: 'Поддержать автора',
    donateHint:
      'Скопируйте адрес и отправьте USDT (Tron TRC20), мин. 0,01 USDT. Приложение бесплатное.',
    donateCopy: 'Скопировать адрес',
    donateCopied: 'Скопировано ✓',
    donateLink: 'Открыть страницу доната',
  },
  edgePanel: {
    title: 'Связь',
    placeholder: 'Подпись...',
    hint: 'Потяните кружок на конце — перенаправить. Delete — удалить.',
    clearLabel: 'Убрать подпись',
    delete: 'Удалить связь',
  },
  selectionPanel: {
    group: 'Группа',
    card: 'Карточка',
    groupNamePlaceholder: 'Название группы...',
    cardNamePlaceholder: 'Название карточки...',
    color: 'Цвет',
  },
  saveModal: {
    title: 'Сохранить схему',
    description:
      'Укажите имя — файл появится на вашем компьютере. Потом его можно снова открыть через «Загрузить».',
    nameLabel: 'Название',
    namePlaceholder: 'брейншторм-2026',
    filenamePrefix: 'Будет сохранён файл:',
    enterName: 'Введите название схемы',
    saveFailed: 'Не удалось сохранить файл',
    saving: 'Сохраняю…',
    done: 'Готово',
    saveButton: 'Сохранить на компьютер',
    defaultName: 'моя-схема',
  },
  demoSplash: {
    welcome: 'Добро пожаловать',
    title: 'Демо MindStorm',
    subtitle: 'Исследуйте схему запуска продукта на холсте ниже',
    close: 'Закрыть',
    cards: (n) => pluralRu(n, 'карточка', 'карточки', 'карточек'),
    groups: (n) => pluralRu(n, 'группа', 'группы', 'групп'),
    links: (n) => pluralRu(n, 'связь', 'связи', 'связей'),
  },
  boardStats: {
    cards: (n) => pluralRu(n, 'карточка', 'карточки', 'карточек'),
    links: (n) => pluralRu(n, 'связь', 'связи', 'связей'),
  },
  colors: colorRecord({
    '1': 'Красный',
    '2': 'Оранжевый',
    '3': 'Жёлтый',
    '4': 'Зелёный',
    '5': 'Бирюзовый',
    '6': 'Фиолетовый',
    '7': 'Розовый',
    '8': 'Фуксия',
    '9': 'Лайм',
    '10': 'Морская волна',
    '11': 'Синий',
    '12': 'Серый',
  }),
  colorsCustom: 'Свой цвет',
  card: {
    newIdea: 'Новая идея',
    placeholder: 'Markdown-текст...',
    defaultText: '## Новая идея\nОпишите мысль...',
  },
  group: {
    defaultLabel: 'Группа',
    namePlaceholder: 'Название группы',
    renameTitle: 'Двойной клик — переименовать',
  },
  confirm: {
    newBoard:
      'Создать пустую схему?\n\nТекущую доску можно вернуть кнопкой «Отменить» (Ctrl+Z).',
  },
  toast: {
    opened: (filename) => `Открыто: ${filename}`,
    close: 'Закрыть',
  },
  errors: {
    loadFailed: 'Не удалось загрузить файл',
    invalidCanvas: 'Неверный формат .canvas',
    readFailed: 'Ошибка чтения файла',
    parseFailed: 'Не удалось прочитать файл',
    missingCanvas: 'В файле .mindstorm нет данных схемы',
  },
  file: {
    defaultTitle: 'моя-схема',
    fallbackTitle: 'схема',
    savedAs: (filename) => `Сохранено: ${filename}`,
    savedDownloads: (filename) => `Файл ${filename} отправлен в папку «Загрузки»`,
    typeDescription: 'Схема MindStorm',
  },
  demoBoardName: 'Демо · Запуск MindStorm',
};

export const messagesEn: Messages = {
  lang: {
    switchToEn: 'English',
    switchToRu: 'Russian',
    ariaRu: 'Russian language',
    ariaEn: 'English language',
  },
  toolbar: {
    undo: 'Undo (Ctrl+Z)',
    undoAria: 'Undo',
    redo: 'Redo (Ctrl+Shift+Z)',
    redoAria: 'Redo',
    addCard: 'Add card',
    addCardShort: '+ Card',
    addGroup: 'Add group',
    addGroupShort: '◻ Group',
    save: 'Save',
    saveTitle: 'Save board to your computer',
    load: 'Open',
    loadTitle: 'Open board from your computer',
    newBoard: '↺ New',
    newBoardTitle: 'Start with a blank board',
    demo: 'Demo',
    demoTitle: 'Load the MindStorm demo board',
    statsTitle: 'Number of cards and connections on the board',
  },
  hints: {
    desktop:
      'Double-click — new card · Click a node — name & color · Click a line — label · Delete',
    mobile: 'Double-tap — card · Node — color · Line — label',
  },
  footer: {
    donate: '☕ Donate',
    donateTitle: 'Support the author',
    donateHint: 'Copy the address and send any amount — the app is free and stays free.',
    donateCopy: 'Copy address',
    donateCopied: 'Copied ✓',
    donateLink: 'GitHub — star the repo ★',
  },
  edgePanel: {
    title: 'Connection',
    placeholder: 'Label...',
    hint: 'Drag the handle at either end to reroute. Delete — remove.',
    clearLabel: 'Clear label',
    delete: 'Delete connection',
  },
  selectionPanel: {
    group: 'Group',
    card: 'Card',
    groupNamePlaceholder: 'Group name...',
    cardNamePlaceholder: 'Card name...',
    color: 'Color',
  },
  saveModal: {
    title: 'Save board',
    description:
      'Choose a name — the file will be saved on your computer. Open it later with Open.',
    nameLabel: 'Name',
    namePlaceholder: 'brainstorm-2026',
    filenamePrefix: 'File to save:',
    enterName: 'Enter a board name',
    saveFailed: 'Could not save the file',
    saving: 'Saving…',
    done: 'Done',
    saveButton: 'Save to computer',
    defaultName: 'my-board',
  },
  demoSplash: {
    welcome: 'Welcome',
    title: 'MindStorm Demo',
    subtitle: 'Explore the product launch canvas below',
    close: 'Close',
    cards: (n) => pluralEn(n, 'card', 'cards'),
    groups: (n) => pluralEn(n, 'group', 'groups'),
    links: (n) => pluralEn(n, 'connection', 'connections'),
  },
  boardStats: {
    cards: (n) => pluralEn(n, 'card', 'cards'),
    links: (n) => pluralEn(n, 'connection', 'connections'),
  },
  colors: colorRecord({
    '1': 'Red',
    '2': 'Orange',
    '3': 'Yellow',
    '4': 'Green',
    '5': 'Teal',
    '6': 'Purple',
    '7': 'Pink',
    '8': 'Fuchsia',
    '9': 'Lime',
    '10': 'Sea green',
    '11': 'Blue',
    '12': 'Gray',
  }),
  colorsCustom: 'Custom color',
  card: {
    newIdea: 'New idea',
    placeholder: 'Markdown text...',
    defaultText: '## New idea\nDescribe your thought...',
  },
  group: {
    defaultLabel: 'Group',
    namePlaceholder: 'Group name',
    renameTitle: 'Double-click to rename',
  },
  confirm: {
    newBoard:
      'Create a blank board?\n\nYou can restore the current board with Undo (Ctrl+Z).',
  },
  toast: {
    opened: (filename) => `Opened: ${filename}`,
    close: 'Close',
  },
  errors: {
    loadFailed: 'Could not load the file',
    invalidCanvas: 'Invalid .canvas format',
    readFailed: 'Failed to read the file',
    parseFailed: 'Could not read the file',
    missingCanvas: 'The .mindstorm file contains no board data',
  },
  file: {
    defaultTitle: 'my-board',
    fallbackTitle: 'board',
    savedAs: (filename) => `Saved: ${filename}`,
    savedDownloads: (filename) => `${filename} was saved to your Downloads folder`,
    typeDescription: 'MindStorm board',
  },
  demoBoardName: 'Demo · MindStorm Launch',
};

export function messagesFor(locale: Locale): Messages {
  return locale === 'en' ? messagesEn : messagesRu;
}
