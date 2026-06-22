# Инспекция проекта MindStorm (2026-06-22)

## Область проверки

- Кодовая база `src/` (canvas, resize, i18n, storage, UX).
- Документация (`CONTEXT.md`, `README.md`, `AGENTS.md`, `docs/*`).
- CI/deploy (`.github/workflows/deploy.yml`, `scripts/deploy-pages.ps1`).

## Итог

- **Critical:** не обнаружено.
- Проект стабилен и деплоится через GitHub Pages.
- На 2026-06-22 основные пункты техдолга из этого отчёта закрыты (см. статус ниже).

## Статус после закрытия техдолга (2026-06-22)

- ✅ **Resize race** закрыт: `commitNow`/`persistCanvas` используют финальный snapshot после group resize.
- ✅ **Unit-тесты resize** добавлены: `src/lib/groupResize.test.ts` (selection, nested, minimums, outside bbox).
- ✅ **CI quality gate** усилен: в workflow добавлен шаг `npm run test` перед `npm run build`.
- ✅ **Node policy** обновлён: CI на Node 22 LTS; документация синхронизирована.
- ✅ **i18n/a11y хвосты** закрыты: `toggleLocale` удалён из provider API, `languageAria` локализован.

## Findings

### High

1. **Риск гонки на конце resize группы**  
   - Файлы: `src/components/MindCanvas.tsx`, `src/hooks/useCanvasHistory.ts`  
   - Симптом: в `onGroupResizeEnd` вызываются `commitNow()` и `persistCanvas(nodesRef.current, ...)`, когда последний `setNodes` из `onGroupResize` может еще не отрендериться.  
   - Эффект: возможен устаревший snapshot в undo/localStorage при очень быстром завершении действия.

2. **Нет автотестов на рекурсивный resize**  
   - Файлы: `src/lib/groupResize.ts`, CI  
   - Эффект: регрессии nested resize сложно ловить до релиза.

### Medium

1. **CI quality gate минимальный**  
   - Статус: **закрыто частично** — добавлен `test + build`; ESLint осознанно отложен и зафиксирован в документации.  
   - Эффект: логические регрессии и style-ошибки не блокируются автоматически.

2. **Node version policy требует актуализации**  
   - Файл: `.github/workflows/deploy.yml`  
   - На раннерах GitHub видны предупреждения про deprecation для Node 20-экшнов.  
   - Эффект: шум в CI сейчас, потенциальные риски поддержки позже.

3. **`toggleLocale` устарел функционально**  
   - Файл: `src/i18n/LocaleProvider.tsx`  
   - Контекст: переключение в UI уже через `setLocale` с 4 локалями; `toggleLocale` сейчас только `ru/en`.

### Low

1. **Жестко заданный EN aria-label в LanguageToggle**  
   - Файл: `src/components/Toolbar.tsx` (`aria-label="Language"`).  
   - Эффект: minor a11y/локализация.

2. **Документация раньше отставала от кода**  
   - На момент инспекции уже синхронизируется (см. «Обновления документации» ниже).

## Обновления документации в этой сессии

- Актуализированы локали в `CONTEXT.md`, `README.md`, `AGENTS.md`, `.cursor/rules/mindstorm.mdc`.
- Обновлены архитектурные и dev-описания в:
  - `docs/ARCHITECTURE.md`
  - `docs/DEVELOPMENT.md`
  - `docs/FILE_FORMAT.md`
  - `docs/GROUPING.md`
- Зафиксированы:
  - 4 языка UI (`ru/en/es/zh`),
  - рекурсивный resize групп и карточек,
  - `demoLocaleCopies.ts`,
  - новые требования к синхронизации i18n.

## Рекомендуемый next step (практический)

~~1. Закрыть риск race в `onGroupResizeEnd`~~ ✅  
~~2. Добавить unit-тесты для `groupResize.ts`~~ ✅  
~~3. Ввести минимальный quality gate в CI: test + build~~ ✅  
~~4. Уточнить Node policy (22 LTS)~~ ✅  

См. [TECH_DEBT_PLAN.md](./TECH_DEBT_PLAN.md) — чекпоинты закрыты 2026-06-22.  
CI: run `27961757501` (commit `3b75326`) — success.
