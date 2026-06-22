import type { Locale } from './locales';

export type Messages = {
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
    groupNamePlaceholder: string;
    cardNamePlaceholder: string;
    titleFontSize: string;
    titleFontSizeDecrease: string;
    titleFontSizeIncrease: string;
    bodyFontSize: string;
    bodyFontSizeDecrease: string;
    bodyFontSizeIncrease: string;
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
    groupNamePlaceholder: 'Название группы...',
    cardNamePlaceholder: 'Заголовок карточки...',
    titleFontSize: 'Размер заголовка',
    titleFontSizeDecrease: 'Уменьшить размер заголовка',
    titleFontSizeIncrease: 'Увеличить размер заголовка',
    bodyFontSize: 'Размер текста',
    bodyFontSizeDecrease: 'Уменьшить размер текста',
    bodyFontSizeIncrease: 'Увеличить размер текста',
    groupLabelFontSize: 'Размер метки',
    groupLabelFontSizeDecrease: 'Уменьшить размер метки группы',
    groupLabelFontSizeIncrease: 'Увеличить размер метки группы',
    fontSizeUnit: 'px',
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
    placeholder: 'Текст карточки...',
    defaultText: '',
    titlePlaceholder: 'Заголовок',
    titleEditHint: 'Двойной клик — редактировать заголовок',
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
    savedDownloads: (filename) => `Файл ${filename} отправлен в папку «Загрузки»`,
    typeDescription: 'Схема MindStorm',
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
    groupNamePlaceholder: 'Group name...',
    cardNamePlaceholder: 'Card title...',
    titleFontSize: 'Title size',
    titleFontSizeDecrease: 'Decrease title size',
    titleFontSizeIncrease: 'Increase title size',
    bodyFontSize: 'Body text size',
    bodyFontSizeDecrease: 'Decrease body text size',
    bodyFontSizeIncrease: 'Increase body text size',
    groupLabelFontSize: 'Label size',
    groupLabelFontSizeDecrease: 'Decrease group label size',
    groupLabelFontSizeIncrease: 'Increase group label size',
    fontSizeUnit: 'px',
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
    placeholder: 'Card body text...',
    defaultText: '',
    titlePlaceholder: 'Title',
    titleEditHint: 'Double-click to edit title',
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
    typeDescription: 'MindStorm board',
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
    addGroup: 'Añadir grupo',
    addGroupShort: '◻ Grupo',
    save: 'Guardar',
    saveTitle: 'Guardar esquema en tu computadora',
    load: 'Abrir',
    loadTitle: 'Abrir esquema desde tu computadora',
    newBoard: '↺ Nuevo',
    newBoardTitle: 'Tablero vacío',
    demo: 'Demo',
    demoTitle: 'Cargar el tablero demo de MindStorm',
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
    groupNamePlaceholder: 'Nombre del grupo...',
    cardNamePlaceholder: 'Título de la carta...',
    titleFontSize: 'Tamaño del título',
    titleFontSizeDecrease: 'Reducir tamaño del título',
    titleFontSizeIncrease: 'Aumentar tamaño del título',
    bodyFontSize: 'Tamaño del texto',
    bodyFontSizeDecrease: 'Reducir tamaño del texto',
    bodyFontSizeIncrease: 'Aumentar tamaño del texto',
    groupLabelFontSize: 'Tamaño de la etiqueta',
    groupLabelFontSizeDecrease: 'Reducir tamaño de la etiqueta del grupo',
    groupLabelFontSizeIncrease: 'Aumentar tamaño de la etiqueta del grupo',
    fontSizeUnit: 'px',
    color: 'Color',
  },
  saveModal: {
    title: 'Guardar esquema',
    description:
      'Elige un nombre — el archivo se guardará en tu computadora. Ábrelo después con Abrir.',
    nameLabel: 'Nombre',
    namePlaceholder: 'brainstorm-2026',
    filenamePrefix: 'Archivo a guardar:',
    enterName: 'Introduce un nombre',
    saveFailed: 'No se pudo guardar el archivo',
    saving: 'Guardando…',
    done: 'Listo',
    saveButton: 'Guardar en computadora',
    defaultName: 'mi-esquema',
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
    typeDescription: 'Esquema MindStorm',
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
    addGroup: '添加分组',
    addGroupShort: '◻ 分组',
    save: '保存',
    saveTitle: '将画布保存到电脑',
    load: '打开',
    loadTitle: '从电脑打开画布',
    newBoard: '↺ 新建',
    newBoardTitle: '空白画布',
    demo: '演示',
    demoTitle: '加载 MindStorm 演示画布',
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
    groupNamePlaceholder: '分组名称...',
    cardNamePlaceholder: '卡片标题...',
    titleFontSize: '标题字号',
    titleFontSizeDecrease: '减小标题字号',
    titleFontSizeIncrease: '增大标题字号',
    bodyFontSize: '正文字号',
    bodyFontSizeDecrease: '减小正文字号',
    bodyFontSizeIncrease: '增大正文字号',
    groupLabelFontSize: '标签字号',
    groupLabelFontSizeDecrease: '减小分组标签字号',
    groupLabelFontSizeIncrease: '增大分组标签字号',
    fontSizeUnit: 'px',
    color: '颜色',
  },
  saveModal: {
    title: '保存画布',
    description: '输入名称 — 文件将保存到电脑。之后可用「打开」重新加载。',
    nameLabel: '名称',
    namePlaceholder: 'brainstorm-2026',
    filenamePrefix: '将保存文件：',
    enterName: '请输入名称',
    saveFailed: '无法保存文件',
    saving: '保存中…',
    done: '完成',
    saveButton: '保存到电脑',
    defaultName: '我的画布',
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
    typeDescription: 'MindStorm 画布',
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
