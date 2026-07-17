import type { Locale } from './locales';

export type Messages = {
  toolbar: {
    undo: string;
    undoAria: string;
    redo: string;
    redoAria: string;
    addCard: string;
    addCardShort: string;
    addPlain: string;
    addPlainShort: string;
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
    print: string;
    printShort: string;
    printTitle: string;
    themeToLight: string;
    themeToDark: string;
    themeAria: string;
    statsTitle: string;
    languageAria: string;
  };
  hints: {
    desktop: string;
    mobile: string;
  };
  footer: {
    donate: string;
    donateTitle: string;
    donateHint: string;
    donateSectionCard: string;
    donateSectionCrypto: string;
    donateOpen: string;
    donateCryptoShow: string;
    donateCryptoHide: string;
    donateMin: string;
    donateClose: string;
    donateCopiedHint: string;
    donateCopy: string;
    donateCopied: string;
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
    plain: string;
    groupNamePlaceholder: string;
    cardNamePlaceholder: string;
    plainPlaceholder: string;
    titleFontSize: string;
    titleFontSizeDecrease: string;
    titleFontSizeIncrease: string;
    bodyFontSize: string;
    bodyFontSizeDecrease: string;
    bodyFontSizeIncrease: string;
    plainFontSize: string;
    plainFontSizeDecrease: string;
    plainFontSizeIncrease: string;
    groupLabelFontSize: string;
    groupLabelFontSizeDecrease: string;
    groupLabelFontSizeIncrease: string;
    fontSizeUnit: string;
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
  printModal: {
    title: string;
    description: string;
    all: string;
    allHint: string;
    selection: string;
    selectionHint: string;
    selectionEmpty: string;
    layoutHint: string;
    cancel: string;
    confirm: string;
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
    titlePlaceholder: string;
    titleEditHint: string;
  };
  plain: {
    defaultText: string;
    placeholder: string;
    editHint: string;
  };
  group: {
    defaultLabel: string;
    namePlaceholder: string;
    renameTitle: string;
    lockTitle: string;
    unlockTitle: string;
    lockAria: string;
    unlockAria: string;
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
    savedFolder: (filename: string) => string;
    typeDescription: string;
    pngTypeDescription: string;
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
  toolbar: {
    undo: 'Отменить (Ctrl+Z)',
    undoAria: 'Отменить',
    redo: 'Вернуть (Ctrl+Shift+Z)',
    redoAria: 'Вернуть',
    addCard: 'Добавить карточку',
    addCardShort: '+ Карточка',
    addPlain: 'Добавить текст',
    addPlainShort: 'T Текст',
    addGroup: 'Добавить группу',
    addGroupShort: '◻ Группа',
    save: 'Сохранить как',
    saveTitle: 'Сохранить как (системный диалог): имя и папка',
    load: 'Загрузить',
    loadTitle: 'Загрузить схему .mindstorm из папки сохранений',
    newBoard: 'Сначала',
    newBoardTitle: 'Новая пустая схема',
    demo: 'Демо',
    demoTitle: 'Загрузить демо-схему MindStorm',
    print: 'Печать',
    printShort: '🖨',
    printTitle: 'Печать схемы или выделенного фрагмента',
    themeToLight: 'Светлая тема',
    themeToDark: 'Тёмная тема',
    themeAria: 'Переключить тему',
    statsTitle: 'Сколько карточек и линий на доске',
    languageAria: 'Язык интерфейса',
  },
  hints: {
    desktop:
      'Двойной клик — карточка · Клик по узлу — цвет и название · Ctrl+C / Ctrl+V — копия · Delete',
    mobile: 'Тап×2 — карточка · Узел — цвет · Линия — подпись',
  },
  footer: {
    donate: '☕ Донат',
    donateTitle: 'Поддержать MindStorm',
    donateHint: 'PayPal или USDT — выберите способ.',
    donateSectionCard: 'Картой и PayPal',
    donateSectionCrypto: 'Криптовалюта USDT',
    donateOpen: 'Оплатить →',
    donateCryptoShow: 'Сети →',
    donateCryptoHide: 'Свернуть',
    donateMin: 'Мин. ввод',
    donateClose: 'Закрыть',
    donateCopy: 'Скопировать адрес',
    donateCopied: 'Скопировано ✓',
    donateCopiedHint: 'Адрес в буфере — вставьте в кошелёк',
  },
  edgePanel: {
    title: 'Связь',
    placeholder: 'Подпись...',
    hint: 'Потяните кружок на конце — перенаправить. Delete — удалить.',
    clearLabel: 'Убрать подпись',
    delete: 'Удалить связь',
  },
  selectionPanel: {
    group: 'Название группы',
    card: 'Карточка',
    plain: 'Текст',
    groupNamePlaceholder: 'Название группы...',
    cardNamePlaceholder: 'Заголовок карточки...',
    plainPlaceholder: 'Текст на схеме...',
    titleFontSize: 'Размер заголовка',
    titleFontSizeDecrease: 'Уменьшить размер заголовка',
    titleFontSizeIncrease: 'Увеличить размер заголовка',
    bodyFontSize: 'Размер текста',
    bodyFontSizeDecrease: 'Уменьшить размер текста',
    bodyFontSizeIncrease: 'Увеличить размер текста',
    plainFontSize: 'Размер шрифта',
    plainFontSizeDecrease: 'Уменьшить размер текста',
    plainFontSizeIncrease: 'Увеличить размер текста',
    groupLabelFontSize: 'Размер метки',
    groupLabelFontSizeDecrease: 'Уменьшить размер метки группы',
    groupLabelFontSizeIncrease: 'Увеличить размер метки группы',
    fontSizeUnit: 'px',
    color: 'Цвет',
  },
  saveModal: {
    title: 'Сохранить как',
    description:
      'Задайте имя файла. .mindstorm — в корень папки, PNG-превью — в подпапку png/ (создаётся автоматически).',
    nameLabel: 'Название',
    namePlaceholder: 'брейншторм-2026',
    filenamePrefix: 'Будут сохранены файлы:',
    enterName: 'Введите название схемы',
    saveFailed: 'Не удалось сохранить файл',
    saving: 'Сохраняю…',
    done: 'Готово',
    saveButton: 'Сохранить',
    defaultName: 'моя-схема',
  },
  printModal: {
    title: 'Печать',
    description: 'Что отправить на печать?',
    all: 'Вся схема',
    allHint: 'Все карточки, группы и связи на доске',
    selection: 'Только выделенное',
    selectionHint: 'Выделенные узлы и связи между ними',
    selectionEmpty: 'Сначала выделите карточки, группы или связи (клик / Shift / ПКМ-рамка)',
    layoutHint: 'A4 альбом · весь холст на странице · читаемый текст · без мини-карты · в диалоге печати выберите 300 DPI',
    cancel: 'Отмена',
    confirm: 'Печать',
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
    placeholder: 'Текст карточки...',
    defaultText: '',
    titlePlaceholder: 'Заголовок',
    titleEditHint: 'Двойной клик — редактировать заголовок',
  },
  plain: {
    defaultText: 'Текст',
    placeholder: 'Введите текст…',
    editHint: 'Двойной клик — редактировать',
  },
  group: {
    defaultLabel: 'Группа',
    namePlaceholder: 'Название группы',
    renameTitle: 'Двойной клик — переименовать',
    lockTitle: 'Закрепить — группа станет фоном',
    unlockTitle: 'Открепить — снова можно двигать и менять',
    lockAria: 'Закрепить группу',
    unlockAria: 'Открепить группу',
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
    savedDownloads: (filename) => `Файлы ${filename} отправлены в папку «Загрузки»`,
    savedFolder: (filename) => `Сохранено в папку: ${filename}`,
    typeDescription: 'Схема MindStorm (.mindstorm)',
    pngTypeDescription: 'Картинка схемы (PNG)',
  },
  demoBoardName: 'Демо · Запуск MindStorm',
};

export const messagesEn: Messages = {
  toolbar: {
    undo: 'Undo (Ctrl+Z)',
    undoAria: 'Undo',
    redo: 'Redo (Ctrl+Shift+Z)',
    redoAria: 'Redo',
    addCard: 'Add card',
    addCardShort: '+ Card',
    addPlain: 'Add text',
    addPlainShort: 'T Text',
    addGroup: 'Add group',
    addGroupShort: '◻ Group',
    save: 'Save as',
    saveTitle: 'Save as (system dialog): name and folder',
    load: 'Open',
    loadTitle: 'Open a .mindstorm board from the saves folder',
    newBoard: 'New',
    newBoardTitle: 'Start with a blank board',
    demo: 'Demo',
    demoTitle: 'Load the MindStorm demo board',
    print: 'Print',
    printShort: '🖨',
    printTitle: 'Print the board or the current selection',
    themeToLight: 'Light theme',
    themeToDark: 'Dark theme',
    themeAria: 'Toggle theme',
    statsTitle: 'Number of cards and connections on the board',
    languageAria: 'Interface language',
  },
  hints: {
    desktop:
      'Double-click — new card · Click a node — name & color · Ctrl+C / Ctrl+V — duplicate · Delete',
    mobile: 'Double-tap — card · Node — color · Line — label',
  },
  footer: {
    donate: '☕ Donate',
    donateTitle: 'Support MindStorm',
    donateHint: 'PayPal or USDT — pick your method.',
    donateSectionCard: 'Card & PayPal',
    donateSectionCrypto: 'USDT crypto',
    donateOpen: 'Pay →',
    donateCryptoShow: 'Networks →',
    donateCryptoHide: 'Collapse',
    donateMin: 'Min. deposit',
    donateClose: 'Close',
    donateCopy: 'Copy address',
    donateCopied: 'Copied ✓',
    donateCopiedHint: 'Address in clipboard — paste in your wallet',
  },
  edgePanel: {
    title: 'Connection',
    placeholder: 'Label...',
    hint: 'Drag the handle at either end to reroute. Delete — remove.',
    clearLabel: 'Clear label',
    delete: 'Delete connection',
  },
  selectionPanel: {
    group: 'Group name',
    card: 'Card',
    plain: 'Text',
    groupNamePlaceholder: 'Group name...',
    cardNamePlaceholder: 'Card title...',
    plainPlaceholder: 'Text on the board...',
    titleFontSize: 'Title size',
    titleFontSizeDecrease: 'Decrease title size',
    titleFontSizeIncrease: 'Increase title size',
    bodyFontSize: 'Body text size',
    bodyFontSizeDecrease: 'Decrease body text size',
    bodyFontSizeIncrease: 'Increase body text size',
    plainFontSize: 'Font size',
    plainFontSizeDecrease: 'Decrease text size',
    plainFontSizeIncrease: 'Increase text size',
    groupLabelFontSize: 'Label size',
    groupLabelFontSizeDecrease: 'Decrease group label size',
    groupLabelFontSizeIncrease: 'Increase group label size',
    fontSizeUnit: 'px',
    color: 'Color',
  },
  saveModal: {
    title: 'Save as',
    description:
      'Choose a file name. .mindstorm goes in the saves folder root; the PNG preview goes into png/ (created automatically).',
    nameLabel: 'Name',
    namePlaceholder: 'brainstorm-2026',
    filenamePrefix: 'Files to save:',
    enterName: 'Enter a board name',
    saveFailed: 'Could not save the file',
    saving: 'Saving…',
    done: 'Done',
    saveButton: 'Save',
    defaultName: 'my-board',
  },
  printModal: {
    title: 'Print',
    description: 'What should be printed?',
    all: 'Whole board',
    allHint: 'All cards, groups, and connections',
    selection: 'Selection only',
    selectionHint: 'Selected nodes and links between them',
    selectionEmpty: 'Select cards, groups, or links first (click / Shift / right-drag)',
    layoutHint: 'A4 landscape · full board on page · readable text · no minimap · choose 300 DPI in the print dialog',
    cancel: 'Cancel',
    confirm: 'Print',
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
    placeholder: 'Card body text...',
    defaultText: '',
    titlePlaceholder: 'Title',
    titleEditHint: 'Double-click to edit title',
  },
  plain: {
    defaultText: 'Text',
    placeholder: 'Enter text…',
    editHint: 'Double-click to edit',
  },
  group: {
    defaultLabel: 'Group',
    namePlaceholder: 'Group name',
    renameTitle: 'Double-click to rename',
    lockTitle: 'Lock — group becomes background only',
    unlockTitle: 'Unlock — move and edit again',
    lockAria: 'Lock group',
    unlockAria: 'Unlock group',
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
    savedFolder: (filename) => `Saved to folder: ${filename}`,
    typeDescription: 'MindStorm board (.mindstorm)',
    pngTypeDescription: 'Board image (PNG)',
  },
  demoBoardName: 'Demo · MindStorm Launch',
};

export const messagesEs: Messages = {
  toolbar: {
    undo: 'Deshacer (Ctrl+Z)',
    undoAria: 'Deshacer',
    redo: 'Rehacer (Ctrl+Shift+Z)',
    redoAria: 'Rehacer',
    addCard: 'Añadir carta',
    addCardShort: '+ Carta',
    addPlain: 'Añadir texto',
    addPlainShort: 'T Texto',
    addGroup: 'Añadir grupo',
    addGroupShort: '◻ Grupo',
    save: 'Guardar como',
    saveTitle: 'Guardar como (diálogo del sistema): nombre y carpeta',
    load: 'Abrir',
    loadTitle: 'Abrir un .mindstorm desde la carpeta de guardados',
    newBoard: 'Nuevo',
    newBoardTitle: 'Tablero vacío',
    demo: 'Demo',
    demoTitle: 'Cargar el tablero demo de MindStorm',
    print: 'Imprimir',
    printShort: '🖨',
    printTitle: 'Imprimir el tablero o la selección',
    themeToLight: 'Tema claro',
    themeToDark: 'Tema oscuro',
    themeAria: 'Cambiar tema',
    statsTitle: 'Número de cartas y conexiones en el tablero',
    languageAria: 'Idioma de la interfaz',
  },
  hints: {
    desktop:
      'Doble clic — nueva carta · Clic en nodo — nombre y color · Ctrl+C / Ctrl+V — copia · Delete',
    mobile: 'Doble toque — carta · Nodo — color · Línea — etiqueta',
  },
  footer: {
    donate: '☕ Donar',
    donateTitle: 'Apoyar MindStorm',
    donateHint: 'PayPal o USDT — elige tu método.',
    donateSectionCard: 'Tarjeta y PayPal',
    donateSectionCrypto: 'USDT cripto',
    donateOpen: 'Pagar →',
    donateCryptoShow: 'Redes →',
    donateCryptoHide: 'Ocultar',
    donateMin: 'Depósito mín.',
    donateClose: 'Cerrar',
    donateCopy: 'Copiar dirección',
    donateCopied: 'Copiado ✓',
    donateCopiedHint: 'Dirección en el portapapeles — pega en tu billetera',
  },
  edgePanel: {
    title: 'Conexión',
    placeholder: 'Etiqueta...',
    hint: 'Arrastra el punto en un extremo para redirigir. Delete — eliminar.',
    clearLabel: 'Quitar etiqueta',
    delete: 'Eliminar conexión',
  },
  selectionPanel: {
    group: 'Nombre del grupo',
    card: 'Carta',
    plain: 'Texto',
    groupNamePlaceholder: 'Nombre del grupo...',
    cardNamePlaceholder: 'Título de la carta...',
    plainPlaceholder: 'Texto en el tablero...',
    titleFontSize: 'Tamaño del título',
    titleFontSizeDecrease: 'Reducir tamaño del título',
    titleFontSizeIncrease: 'Aumentar tamaño del título',
    bodyFontSize: 'Tamaño del texto',
    bodyFontSizeDecrease: 'Reducir tamaño del texto',
    bodyFontSizeIncrease: 'Aumentar tamaño del texto',
    plainFontSize: 'Tamaño de fuente',
    plainFontSizeDecrease: 'Reducir tamaño del texto',
    plainFontSizeIncrease: 'Aumentar tamaño del texto',
    groupLabelFontSize: 'Tamaño de la etiqueta',
    groupLabelFontSizeDecrease: 'Reducir tamaño de la etiqueta del grupo',
    groupLabelFontSizeIncrease: 'Aumentar tamaño de la etiqueta del grupo',
    fontSizeUnit: 'px',
    color: 'Color',
  },
  saveModal: {
    title: 'Guardar como',
    description:
      'Elige un nombre. .mindstorm en la raíz de la carpeta; el PNG en png/ (se crea sola).',
    nameLabel: 'Nombre',
    namePlaceholder: 'brainstorm-2026',
    filenamePrefix: 'Archivos a guardar:',
    enterName: 'Introduce un nombre',
    saveFailed: 'No se pudo guardar el archivo',
    saving: 'Guardando…',
    done: 'Listo',
    saveButton: 'Guardar',
    defaultName: 'mi-esquema',
  },
  printModal: {
    title: 'Imprimir',
    description: '¿Qué quieres imprimir?',
    all: 'Todo el tablero',
    allHint: 'Todas las cartas, grupos y conexiones',
    selection: 'Solo selección',
    selectionHint: 'Nodos seleccionados y enlaces entre ellos',
    selectionEmpty: 'Selecciona cartas, grupos o enlaces (clic / Shift / arrastre derecho)',
    layoutHint: 'A4 horizontal · tablero completo · texto legible · sin minimapa · elige 300 DPI en el diálogo de impresión',
    cancel: 'Cancelar',
    confirm: 'Imprimir',
  },
  demoSplash: {
    welcome: 'Bienvenido',
    title: 'Demo MindStorm',
    subtitle: 'Explora el tablero de lanzamiento de producto abajo',
    close: 'Cerrar',
    cards: (n) => pluralEn(n, 'carta', 'cartas'),
    groups: (n) => pluralEn(n, 'grupo', 'grupos'),
    links: (n) => pluralEn(n, 'conexión', 'conexiones'),
  },
  boardStats: {
    cards: (n) => pluralEn(n, 'carta', 'cartas'),
    links: (n) => pluralEn(n, 'conexión', 'conexiones'),
  },
  colors: colorRecord({
    '1': 'Rojo',
    '2': 'Naranja',
    '3': 'Amarillo',
    '4': 'Verde',
    '5': 'Verde azulado',
    '6': 'Morado',
    '7': 'Rosa',
    '8': 'Fucsia',
    '9': 'Lima',
    '10': 'Verde mar',
    '11': 'Azul',
    '12': 'Gris',
  }),
  colorsCustom: 'Color personalizado',
  card: {
    newIdea: 'Nueva idea',
    placeholder: 'Texto de la carta...',
    defaultText: '',
    titlePlaceholder: 'Título',
    titleEditHint: 'Doble clic para editar el título',
  },
  plain: {
    defaultText: 'Texto',
    placeholder: 'Escribe texto…',
    editHint: 'Doble clic para editar',
  },
  group: {
    defaultLabel: 'Grupo',
    namePlaceholder: 'Nombre del grupo',
    renameTitle: 'Doble clic para renombrar',
    lockTitle: 'Fijar — el grupo queda como fondo',
    unlockTitle: 'Desfijar — mover y editar de nuevo',
    lockAria: 'Fijar grupo',
    unlockAria: 'Desfijar grupo',
  },
  confirm: {
    newBoard:
      '¿Crear un tablero vacío?\n\nPuedes restaurar el tablero actual con Deshacer (Ctrl+Z).',
  },
  toast: {
    opened: (filename) => `Abierto: ${filename}`,
    close: 'Cerrar',
  },
  errors: {
    loadFailed: 'No se pudo cargar el archivo',
    invalidCanvas: 'Formato .canvas inválido',
    readFailed: 'Error al leer el archivo',
    parseFailed: 'No se pudo leer el archivo',
    missingCanvas: 'El archivo .mindstorm no contiene datos del tablero',
  },
  file: {
    defaultTitle: 'mi-esquema',
    fallbackTitle: 'esquema',
    savedAs: (filename) => `Guardado: ${filename}`,
    savedDownloads: (filename) => `${filename} se guardó en Descargas`,
    savedFolder: (filename) => `Guardado en carpeta: ${filename}`,
    typeDescription: 'Esquema MindStorm (.mindstorm)',
    pngTypeDescription: 'Imagen del esquema (PNG)',
  },
  demoBoardName: 'Demo · Lanzamiento MindStorm',
};

export const messagesZh: Messages = {
  toolbar: {
    undo: '撤销 (Ctrl+Z)',
    undoAria: '撤销',
    redo: '重做 (Ctrl+Shift+Z)',
    redoAria: '重做',
    addCard: '添加卡片',
    addCardShort: '+ 卡片',
    addPlain: '添加文本',
    addPlainShort: 'T 文本',
    addGroup: '添加分组',
    addGroupShort: '◻ 分组',
    save: '另存为',
    saveTitle: '另存为（系统对话框）：名称和文件夹',
    load: '打开',
    loadTitle: '从保存文件夹打开 .mindstorm',
    newBoard: '新建',
    newBoardTitle: '空白画布',
    demo: '演示',
    demoTitle: '加载 MindStorm 演示画布',
    print: '打印',
    printShort: '🖨',
    printTitle: '打印整个画布或当前选中内容',
    themeToLight: '浅色主题',
    themeToDark: '深色主题',
    themeAria: '切换主题',
    statsTitle: '画布上的卡片和连线数量',
    languageAria: '界面语言',
  },
  hints: {
    desktop: '双击 — 新卡片 · 点击节点 — 名称和颜色 · Ctrl+C / Ctrl+V — 复制 · Delete',
    mobile: '双击 — 卡片 · 节点 — 颜色 · 连线 — 标签',
  },
  footer: {
    donate: '☕ 捐赠',
    donateTitle: '支持 MindStorm',
    donateHint: 'PayPal 或 USDT — 选择方式。',
    donateSectionCard: '银行卡和 PayPal',
    donateSectionCrypto: 'USDT 加密货币',
    donateOpen: '支付 →',
    donateCryptoShow: '网络 →',
    donateCryptoHide: '收起',
    donateMin: '最低充值',
    donateClose: '关闭',
    donateCopy: '复制地址',
    donateCopied: '已复制 ✓',
    donateCopiedHint: '地址已在剪贴板 — 粘贴到钱包',
  },
  edgePanel: {
    title: '连线',
    placeholder: '标签...',
    hint: '拖动端点圆点可改线路。Delete — 删除。',
    clearLabel: '清除标签',
    delete: '删除连线',
  },
  selectionPanel: {
    group: '分组名称',
    card: '卡片',
    plain: '文本',
    groupNamePlaceholder: '分组名称...',
    cardNamePlaceholder: '卡片标题...',
    plainPlaceholder: '画布上的文本...',
    titleFontSize: '标题字号',
    titleFontSizeDecrease: '减小标题字号',
    titleFontSizeIncrease: '增大标题字号',
    bodyFontSize: '正文字号',
    bodyFontSizeDecrease: '减小正文字号',
    bodyFontSizeIncrease: '增大正文字号',
    plainFontSize: '字号',
    plainFontSizeDecrease: '减小字号',
    plainFontSizeIncrease: '增大字号',
    groupLabelFontSize: '标签字号',
    groupLabelFontSizeDecrease: '减小分组标签字号',
    groupLabelFontSizeIncrease: '增大分组标签字号',
    fontSizeUnit: 'px',
    color: '颜色',
  },
  saveModal: {
    title: '另存为',
    description: '输入文件名。.mindstorm 在根目录，PNG 预览写入 png/（自动创建）。',
    nameLabel: '名称',
    namePlaceholder: 'brainstorm-2026',
    filenamePrefix: '将保存文件：',
    enterName: '请输入名称',
    saveFailed: '无法保存文件',
    saving: '保存中…',
    done: '完成',
    saveButton: '保存',
    defaultName: '我的画布',
  },
  printModal: {
    title: '打印',
    description: '要打印什么？',
    all: '整个画布',
    allHint: '所有卡片、分组和连线',
    selection: '仅选中内容',
    selectionHint: '选中的节点及它们之间的连线',
    selectionEmpty: '请先选中卡片、分组或连线（单击 / Shift / 右键框选）',
    layoutHint: 'A4 横向 · 整板入页 · 可读文字 · 无小地图 · 请在打印对话框中选择 300 DPI',
    cancel: '取消',
    confirm: '打印',
  },
  demoSplash: {
    welcome: '欢迎',
    title: 'MindStorm 演示',
    subtitle: '浏览下方的产品发布画布',
    close: '关闭',
    cards: (n) => `${n} 张卡片`,
    groups: (n) => `${n} 个分组`,
    links: (n) => `${n} 条连线`,
  },
  boardStats: {
    cards: (n) => `${n} 张卡片`,
    links: (n) => `${n} 条连线`,
  },
  colors: colorRecord({
    '1': '红色',
    '2': '橙色',
    '3': '黄色',
    '4': '绿色',
    '5': '青色',
    '6': '紫色',
    '7': '粉色',
    '8': '洋红',
    '9': '青柠',
    '10': '海绿',
    '11': '蓝色',
    '12': '灰色',
  }),
  colorsCustom: '自定义颜色',
  card: {
    newIdea: '新想法',
    placeholder: '卡片正文...',
    defaultText: '',
    titlePlaceholder: '标题',
    titleEditHint: '双击编辑标题',
  },
  plain: {
    defaultText: '文本',
    placeholder: '输入文本…',
    editHint: '双击编辑',
  },
  group: {
    defaultLabel: '分组',
    namePlaceholder: '分组名称',
    renameTitle: '双击重命名',
    lockTitle: '锁定 — 分组变为背景',
    unlockTitle: '解锁 — 可再次移动和编辑',
    lockAria: '锁定分组',
    unlockAria: '解锁分组',
  },
  confirm: {
    newBoard: '创建空白画布？\n\n可用撤销 (Ctrl+Z) 恢复当前画布。',
  },
  toast: {
    opened: (filename) => `已打开：${filename}`,
    close: '关闭',
  },
  errors: {
    loadFailed: '无法加载文件',
    invalidCanvas: '无效的 .canvas 格式',
    readFailed: '读取文件失败',
    parseFailed: '无法读取文件',
    missingCanvas: '.mindstorm 文件中没有画布数据',
  },
  file: {
    defaultTitle: '我的画布',
    fallbackTitle: '画布',
    savedAs: (filename) => `已保存：${filename}`,
    savedDownloads: (filename) => `${filename} 已保存到下载文件夹`,
    savedFolder: (filename) => `已保存到文件夹：${filename}`,
    typeDescription: 'MindStorm 画布 (.mindstorm)',
    pngTypeDescription: '画布图片 (PNG)',
  },
  demoBoardName: '演示 · MindStorm 发布',
};

const MESSAGE_MAP: Record<Locale, Messages> = {
  ru: messagesRu,
  en: messagesEn,
  es: messagesEs,
  zh: messagesZh,
};

export function messagesFor(locale: Locale): Messages {
  return MESSAGE_MAP[locale];
}
