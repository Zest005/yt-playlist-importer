// ============================================================
//  YouTube Playlist Importer
//  Languages: EN / RU / UA (auto-detected, user-switchable)
//  Run in DevTools Console on https://www.youtube.com while
//  signed into the TARGET account. See Readme.*.txt
// ============================================================

(() => {
  'use strict';

  // ---------- Guards ----------
  if (!/(^|\.)youtube\.com$/.test(location.hostname)) {
    alert('Open https://www.youtube.com and run the script there.\nОткройте https://www.youtube.com и запустите скрипт там.\nВідкрийте https://www.youtube.com та запустіть скрипт там.');
    return;
  }
  const oldRoot = document.getElementById('yt-importer-root');
  if (oldRoot) oldRoot.remove();
  const oldStyle = document.getElementById('yt-importer-style');
  if (oldStyle) oldStyle.remove();

  // ---------- InnerTube config ----------
  const cfg = (window.ytcfg && (typeof window.ytcfg.get === 'function'
      ? { INNERTUBE_API_KEY: window.ytcfg.get('INNERTUBE_API_KEY'),
          INNERTUBE_CONTEXT: window.ytcfg.get('INNERTUBE_CONTEXT') }
      : window.ytcfg.data_)) || {};
  const API_KEY = cfg.INNERTUBE_API_KEY;
  const CONTEXT = cfg.INNERTUBE_CONTEXT;
  if (!API_KEY || !CONTEXT) {
    alert('Could not read INNERTUBE_API_KEY / INNERTUBE_CONTEXT.\nOpen the YouTube home page and try again.');
    return;
  }

  // ============================================================
  // i18n
  // ============================================================
  const LOCALES = {
    en: {
      title: '📥 YouTube Playlist Importer',
      closeTitle: 'Close',
      warning_title: '⚠ Warning — account risk.',
      warning_body: ' This script automates actions on YouTube on your behalf. At high speed, YouTube may temporarily rate-limit your account, show a CAPTCHA, or, in rare cases, block it for "suspicious activity". ',
      warning_bold: 'For playlists larger than 200 videos, a delay of 10–15 seconds is strongly recommended.',
      warning_tail: ' Use at your own risk; for your main account — with maximum caution.',
      info_title: 'What this script does:',
      info_li1: 'Creates playlists in the current YouTube account from Google Takeout CSV files.',
      info_li2: 'A file named "Watch later" / "Смотреть позже" / "Дивитися пізніше" goes into the system Watch Later.',
      info_li3: 'Configurable delay, batch size and privacy.',
      info_li4: 'Progress bar with ETA, live log, stop button.',
      info_li5: 'Distinguishes "video unavailable" (deleted/private/blocked) from real errors.',
      info_li6: 'At the end — a detailed report with links and an export of failed videos.',
      step1: '1. Upload your playlist CSV files',
      drop_main: '📁 Click or drag CSV files here',
      drop_hint: 'Files from Google Takeout. Playlist name is taken from the file name.',
      step2: '2. Settings',
      label_delay: 'Delay between requests:',
      suffix_ms: 'ms',
      label_batch: 'Videos per request:',
      suffix_batch: 'items (1–50, default 20)',
      label_privacy: 'Playlist privacy:',
      privacy_private: 'Private (only you)',
      privacy_unlisted: 'Unlisted (with link)',
      privacy_public: 'Public',
      btn_close: 'Close',
      btn_start: 'Start import',
      btn_start_count: 'Start import ({0} videos)',
      btn_stop: '⏹ Stop',
      btn_stopping: 'Stopping…',
      preparing: 'Preparing…',
      counts: '{0} / {1} videos',
      eta_calc: 'ETA: calculating…',
      eta: 'ETA: ~{0}',
      log_heading: 'Log',
      wl_tag: ' → Watch Later',
      count_videos: '{0} videos',
      confirm_close: 'Import is running. Abort and close?',
      confirm_fast: 'You have playlists with >200 videos and a delay of <1 second.\nThis is very risky. Continue anyway?',
      confirm_stop: 'Stop the import after the current request?',
      alert_no_sapisid: 'SAPISID cookie not found. Are you signed into YouTube?',
      alert_read_file: 'Could not read file "{0}": {1}',
      alert_clip_fail: 'Could not copy to clipboard',
      log_pl_header: '━━ {0} ({1} videos) ━━',
      log_wl_target: '  → system Watch Later',
      log_created: '  ✓ playlist created, first video added ({0})',
      log_unavail_creating: '  ⊘ {0} — video unavailable (possibly deleted/hidden), trying next…',
      log_ratelimit_30: '  ⏸ rate-limit, pausing 30 seconds…',
      log_create_failed: '  ✗ failed to create playlist: {0}',
      log_batch_ok: '  + batch {0}/{1}: +{2} videos',
      log_batch_ratelimit: '  ⏸ batch rate-limited, pausing 30 seconds, then retrying one by one…',
      log_batch_fail: '  ⚠ batch {0} failed as a whole, checking videos one by one…',
      log_added: '    + {0}',
      log_unavail_adding: '    ⊘ {0} — video unavailable (deleted / private / blocked / age-restricted)',
      log_ratelimit_60: '    ⏸ rate-limit, pausing 60 seconds…',
      log_added_after_pause: '    + {0} (after pause)',
      log_video_err: '    ✗ {0}: {1}',
      log_critical: 'Critical error: {0}',
      reason_unavail: 'video unavailable',
      reason_not_created: 'playlist not created',
      reason_create_err: 'creation error',
      done_stopped: '⏹ Import stopped',
      done_finished: '✓ Import finished',
      done_in: 'in {0}',
      card_added: 'added',
      card_unavail: 'unavailable',
      card_errors: 'errors',
      section_per_pl: 'By playlist',
      th_playlist: 'Playlist',
      th_added: '✓ Added',
      th_unavail: '⊘ Unavailable',
      th_errors: '✗ Errors',
      tag_wl: '→ WL',
      tag_created: 'created',
      tag_not_created: 'not created',
      section_failed: 'Failed videos ({0})',
      btn_copy: '📋 Copy list',
      btn_download: '💾 Download TXT',
      btn_copied: '✓ Copied',
      all_added: '🎉 All available videos successfully added!',
      console_title: ' YouTube Playlist Importer — summary ',
      console_added: '✓ Added:        ',
      console_unavail: '⊘ Unavailable:  ',
      console_errors: '✗ Errors:       ',
      console_time: 'Time:           ',
      console_per_pl: 'By playlist:',
      console_failed: 'Failed videos:',
      console_full: 'Full result object available as window.__importResult',
      col_type: 'Type',
      col_wl_sys: 'WL (system)',
      col_created: 'created',
      col_not_created: 'NOT CREATED',
      col_added: 'Added ✓',
      col_unavail: 'Unavailable ⊘',
      col_errors: 'Errors ✗',
      col_url: 'URL',
      col_reason: 'Reason',
      col_pl: 'Playlist',
      time_h: 'h',
      time_m: 'm',
      time_s: 's',
      btn_remove_file: 'Remove file',
      btn_new_import: '↺ New import',
      clear_wl_label: 'Clear "Watch Later" before importing',
      clear_wl_hint: 'Removes ALL current videos from Watch Later, then adds the ones from your CSV. Has no effect on regular playlists.',
      log_wl_clearing_start: '  🗑 clearing Watch Later page by page…',
      log_wl_page: '    → page {0}: {1} video(s) found (removed so far: {2})',
      log_remove_batch: '    − batch {0}/{1}: −{2} video(s)',
      log_remove_failed: '    ✗ remove batch {0} failed: {1}',
      log_wl_cleared: '  ✓ Watch Later cleared ({0} removed in total)',
      log_clear_failed: '  ✗ could not clear Watch Later: {0}',
      log_clear_stuck: '  ⚠ could not remove any videos on this page, stopping clear',
    },

    ru: {
      title: '📥 YouTube Playlist Importer',
      closeTitle: 'Закрыть',
      warning_title: '⚠ Внимание — риски для аккаунта.',
      warning_body: ' Скрипт автоматизирует действия на YouTube от вашего имени. При высокой скорости YouTube может временно ограничить аккаунт (rate-limit), показать капчу или, в редких случаях, заблокировать за «подозрительную активность». ',
      warning_bold: 'Для плейлистов больше 200 видео настоятельно рекомендуется задержка 10–15 секунд.',
      warning_tail: ' Используйте на свой страх и риск; для основного аккаунта — с максимальной осторожностью.',
      info_title: 'Что умеет этот скрипт:',
      info_li1: 'Создаёт плейлисты в текущем аккаунте YouTube по данным из CSV-файлов Google Takeout.',
      info_li2: 'Файл с именем «Watch later» / «Смотреть позже» / «Дивитися пізніше» добавляет видео в системный «Смотреть позже».',
      info_li3: 'Настраиваемая задержка, размер батча и приватность.',
      info_li4: 'Прогресс-бар с ETA, живой лог, кнопка остановки.',
      info_li5: 'Различает «видео недоступно» (удалено/приватно/заблокировано) и настоящие ошибки.',
      info_li6: 'В конце — подробный отчёт со ссылками и экспортом списка не добавленных видео.',
      step1: '1. Загрузите CSV-файлы плейлистов',
      drop_main: '📁 Кликните или перетащите CSV-файлы сюда',
      drop_hint: 'Файлы из Google Takeout. Имя плейлиста берётся из имени файла.',
      step2: '2. Настройки',
      label_delay: 'Задержка между запросами:',
      suffix_ms: 'мс',
      label_batch: 'Видео в одном запросе:',
      suffix_batch: 'шт. (1–50, по умолчанию 20)',
      label_privacy: 'Приватность плейлистов:',
      privacy_private: 'Приватный (только вы)',
      privacy_unlisted: 'По ссылке (Unlisted)',
      privacy_public: 'Публичный',
      btn_close: 'Закрыть',
      btn_start: 'Запустить импорт',
      btn_start_count: 'Запустить импорт ({0} видео)',
      btn_stop: '⏹ Остановить',
      btn_stopping: 'Останавливаюсь…',
      preparing: 'Подготовка…',
      counts: '{0} / {1} видео',
      eta_calc: 'ETA: вычисляется…',
      eta: 'ETA: ~{0}',
      log_heading: 'Лог',
      wl_tag: ' → Смотреть позже',
      count_videos: '{0} видео',
      confirm_close: 'Идёт импорт. Прервать и закрыть?',
      confirm_fast: 'У вас есть плейлисты больше 200 видео, а задержка <1 секунды.\nЭто очень рискованно. Продолжить всё равно?',
      confirm_stop: 'Остановить импорт после текущего запроса?',
      alert_no_sapisid: 'Не найден SAPISID cookie. Вы точно вошли в YouTube?',
      alert_read_file: 'Не удалось прочитать файл «{0}»: {1}',
      alert_clip_fail: 'Не удалось скопировать в буфер',
      log_pl_header: '━━ {0} ({1} видео) ━━',
      log_wl_target: '  → системный «Смотреть позже»',
      log_created: '  ✓ плейлист создан, первое видео добавлено ({0})',
      log_unavail_creating: '  ⊘ {0} — видео недоступно (возможно удалено/скрыто), пробую следующее…',
      log_ratelimit_30: '  ⏸ rate-limit, пауза 30 секунд…',
      log_create_failed: '  ✗ не удалось создать плейлист: {0}',
      log_batch_ok: '  + батч {0}/{1}: +{2} видео',
      log_batch_ratelimit: '  ⏸ rate-limit на батче, пауза 30 секунд, потом повтор по одному…',
      log_batch_fail: '  ⚠ батч {0} не прошёл целиком, проверяю по одному…',
      log_added: '    + {0}',
      log_unavail_adding: '    ⊘ {0} — видео недоступно (удалено / приватно / заблокировано / возрастное)',
      log_ratelimit_60: '    ⏸ rate-limit, пауза 60 секунд…',
      log_added_after_pause: '    + {0} (после паузы)',
      log_video_err: '    ✗ {0}: {1}',
      log_critical: 'Критическая ошибка: {0}',
      reason_unavail: 'видео недоступно',
      reason_not_created: 'плейлист не создан',
      reason_create_err: 'ошибка создания',
      done_stopped: '⏹ Импорт остановлен',
      done_finished: '✓ Импорт завершён',
      done_in: 'за {0}',
      card_added: 'добавлено',
      card_unavail: 'недоступны',
      card_errors: 'ошибок',
      section_per_pl: 'По плейлистам',
      th_playlist: 'Плейлист',
      th_added: '✓ Добавлено',
      th_unavail: '⊘ Недоступно',
      th_errors: '✗ Ошибки',
      tag_wl: '→ WL',
      tag_created: 'создан',
      tag_not_created: 'не создан',
      section_failed: 'Не добавленные видео ({0})',
      btn_copy: '📋 Скопировать список',
      btn_download: '💾 Скачать TXT',
      btn_copied: '✓ Скопировано',
      all_added: '🎉 Все доступные видео успешно добавлены!',
      console_title: ' YouTube Playlist Importer — итог ',
      console_added: '✓ Добавлено:    ',
      console_unavail: '⊘ Недоступны:   ',
      console_errors: '✗ Ошибки:       ',
      console_time: 'Время:           ',
      console_per_pl: 'По плейлистам:',
      console_failed: 'Не добавленные видео:',
      console_full: 'Полный объект результата доступен как window.__importResult',
      col_type: 'Тип',
      col_wl_sys: 'WL (системный)',
      col_created: 'создан',
      col_not_created: 'НЕ СОЗДАН',
      col_added: 'Добавлено ✓',
      col_unavail: 'Недоступно ⊘',
      col_errors: 'Ошибки ✗',
      col_url: 'URL',
      col_reason: 'Причина',
      col_pl: 'Плейлист',
      time_h: 'ч',
      time_m: 'м',
      time_s: 'с',
      btn_remove_file: 'Удалить файл',
      btn_new_import: '↺ Новый импорт',
      clear_wl_label: 'Очистить «Смотреть позже» перед импортом',
      clear_wl_hint: 'Удалит ВСЕ текущие видео из «Смотреть позже», затем добавит видео из CSV. На обычные плейлисты не влияет.',
      log_wl_clearing_start: '  🗑 очищаю «Смотреть позже» постранично…',
      log_wl_page: '    → страница {0}: найдено {1} видео (удалено всего: {2})',
      log_remove_batch: '    − батч {0}/{1}: −{2} видео',
      log_remove_failed: '    ✗ батч удаления {0} не прошёл: {1}',
      log_wl_cleared: '  ✓ «Смотреть позже» очищен (всего удалено: {0})',
      log_clear_failed: '  ✗ не удалось очистить «Смотреть позже»: {0}',
      log_clear_stuck: '  ⚠ не получается удалить видео с этой страницы, прекращаю очистку',
    },

    uk: {
      title: '📥 YouTube Playlist Importer',
      closeTitle: 'Закрити',
      warning_title: '⚠ Увага — ризики для акаунту.',
      warning_body: ' Скрипт автоматизує дії на YouTube від вашого імені. На високій швидкості YouTube може тимчасово обмежити акаунт (rate-limit), показати капчу або, у рідкісних випадках, заблокувати за «підозрілу активність». ',
      warning_bold: 'Для плейлистів понад 200 відео наполегливо рекомендується затримка 10–15 секунд.',
      warning_tail: ' Використовуйте на свій страх і ризик; для основного акаунту — з максимальною обережністю.',
      info_title: 'Що вміє цей скрипт:',
      info_li1: 'Створює плейлисти в поточному акаунті YouTube за даними з CSV-файлів Google Takeout.',
      info_li2: 'Файл з іменем «Watch later» / «Смотреть позже» / «Дивитися пізніше» додає відео до системного «Дивитися пізніше».',
      info_li3: 'Налаштовувана затримка, розмір батча та приватність.',
      info_li4: 'Прогрес-бар з ETA, живий лог, кнопка зупинки.',
      info_li5: 'Розрізняє «відео недоступне» (видалено/приватне/заблоковано) і справжні помилки.',
      info_li6: 'У кінці — детальний звіт із посиланнями та експортом списку недоданих відео.',
      step1: '1. Завантажте CSV-файли плейлистів',
      drop_main: '📁 Клікніть або перетягніть CSV-файли сюди',
      drop_hint: 'Файли з Google Takeout. Назва плейлиста береться з імені файлу.',
      step2: '2. Налаштування',
      label_delay: 'Затримка між запитами:',
      suffix_ms: 'мс',
      label_batch: 'Відео в одному запиті:',
      suffix_batch: 'шт. (1–50, за замовчуванням 20)',
      label_privacy: 'Приватність плейлистів:',
      privacy_private: 'Приватний (тільки ви)',
      privacy_unlisted: 'За посиланням (Unlisted)',
      privacy_public: 'Публічний',
      btn_close: 'Закрити',
      btn_start: 'Запустити імпорт',
      btn_start_count: 'Запустити імпорт ({0} відео)',
      btn_stop: '⏹ Зупинити',
      btn_stopping: 'Зупиняюся…',
      preparing: 'Підготовка…',
      counts: '{0} / {1} відео',
      eta_calc: 'ETA: обчислюється…',
      eta: 'ETA: ~{0}',
      log_heading: 'Лог',
      wl_tag: ' → Дивитися пізніше',
      count_videos: '{0} відео',
      confirm_close: 'Триває імпорт. Перервати та закрити?',
      confirm_fast: 'У вас є плейлисти понад 200 відео, а затримка <1 секунди.\nЦе дуже ризиковано. Продовжити все одно?',
      confirm_stop: 'Зупинити імпорт після поточного запиту?',
      alert_no_sapisid: 'Не знайдено cookie SAPISID. Ви точно увійшли до YouTube?',
      alert_read_file: 'Не вдалося прочитати файл «{0}»: {1}',
      alert_clip_fail: 'Не вдалося скопіювати до буфера',
      log_pl_header: '━━ {0} ({1} відео) ━━',
      log_wl_target: '  → системний «Дивитися пізніше»',
      log_created: '  ✓ плейлист створено, перше відео додано ({0})',
      log_unavail_creating: '  ⊘ {0} — відео недоступне (можливо видалено/приховано), пробую наступне…',
      log_ratelimit_30: '  ⏸ rate-limit, пауза 30 секунд…',
      log_create_failed: '  ✗ не вдалося створити плейлист: {0}',
      log_batch_ok: '  + батч {0}/{1}: +{2} відео',
      log_batch_ratelimit: '  ⏸ rate-limit на батчі, пауза 30 секунд, потім повтор по одному…',
      log_batch_fail: '  ⚠ батч {0} не пройшов цілком, перевіряю по одному…',
      log_added: '    + {0}',
      log_unavail_adding: '    ⊘ {0} — відео недоступне (видалено / приватне / заблоковано / вікове обмеження)',
      log_ratelimit_60: '    ⏸ rate-limit, пауза 60 секунд…',
      log_added_after_pause: '    + {0} (після паузи)',
      log_video_err: '    ✗ {0}: {1}',
      log_critical: 'Критична помилка: {0}',
      reason_unavail: 'відео недоступне',
      reason_not_created: 'плейлист не створено',
      reason_create_err: 'помилка створення',
      done_stopped: '⏹ Імпорт зупинено',
      done_finished: '✓ Імпорт завершено',
      done_in: 'за {0}',
      card_added: 'додано',
      card_unavail: 'недоступні',
      card_errors: 'помилок',
      section_per_pl: 'За плейлистами',
      th_playlist: 'Плейлист',
      th_added: '✓ Додано',
      th_unavail: '⊘ Недоступні',
      th_errors: '✗ Помилки',
      tag_wl: '→ WL',
      tag_created: 'створено',
      tag_not_created: 'не створено',
      section_failed: 'Недодані відео ({0})',
      btn_copy: '📋 Скопіювати список',
      btn_download: '💾 Завантажити TXT',
      btn_copied: '✓ Скопійовано',
      all_added: '🎉 Усі доступні відео успішно додано!',
      console_title: ' YouTube Playlist Importer — підсумок ',
      console_added: '✓ Додано:       ',
      console_unavail: '⊘ Недоступні:   ',
      console_errors: '✗ Помилки:      ',
      console_time: 'Час:             ',
      console_per_pl: 'За плейлистами:',
      console_failed: 'Недодані відео:',
      console_full: 'Повний об\'єкт результату доступний як window.__importResult',
      col_type: 'Тип',
      col_wl_sys: 'WL (системний)',
      col_created: 'створено',
      col_not_created: 'НЕ СТВОРЕНО',
      col_added: 'Додано ✓',
      col_unavail: 'Недоступні ⊘',
      col_errors: 'Помилки ✗',
      col_url: 'URL',
      col_reason: 'Причина',
      col_pl: 'Плейлист',
      time_h: 'год',
      time_m: 'хв',
      time_s: 'с',
      btn_remove_file: 'Видалити файл',
      btn_new_import: '↺ Новий імпорт',
      clear_wl_label: 'Очистити «Дивитися пізніше» перед імпортом',
      clear_wl_hint: 'Видалить УСІ поточні відео з «Дивитися пізніше», потім додасть відео з CSV. На звичайні плейлисти не впливає.',
      log_wl_clearing_start: '  🗑 очищую «Дивитися пізніше» посторінково…',
      log_wl_page: '    → сторінка {0}: знайдено {1} відео (видалено всього: {2})',
      log_remove_batch: '    − батч {0}/{1}: −{2} відео',
      log_remove_failed: '    ✗ батч видалення {0} не пройшов: {1}',
      log_wl_cleared: '  ✓ «Дивитися пізніше» очищено (всього видалено: {0})',
      log_clear_failed: '  ✗ не вдалося очистити «Дивитися пізніше»: {0}',
      log_clear_stuck: '  ⚠ не виходить видалити відео з цієї сторінки, припиняю очистку',
    },
  };

  function detectLang() {
    try {
      const saved = localStorage.getItem('yt-importer-lang');
      if (saved && LOCALES[saved]) return saved;
    } catch {}
    const nav = (navigator.language || 'en').toLowerCase();
    if (nav.startsWith('ru')) return 'ru';
    if (nav.startsWith('uk') || nav.startsWith('ua')) return 'uk';
    return 'en';
  }

  let currentLang = detectLang();

  function t(key, ...args) {
    let s = (LOCALES[currentLang] && LOCALES[currentLang][key]) || LOCALES.en[key] || key;
    args.forEach((a, i) => { s = s.split('{' + i + '}').join(String(a)); });
    return s;
  }

  // ---------- Helpers ----------
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);

  function getCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  async function sha1Hex(s) {
    const buf = new TextEncoder().encode(s);
    const hash = await crypto.subtle.digest('SHA-1', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function authHeader() {
    const sapisid = getCookie('SAPISID') || getCookie('__Secure-3PAPISID') || getCookie('__Secure-1PAPISID');
    if (!sapisid) throw new Error(t('alert_no_sapisid'));
    const ts = Math.floor(Date.now() / 1000);
    const origin = 'https://www.youtube.com';
    const hash = await sha1Hex(ts + ' ' + sapisid + ' ' + origin);
    return 'SAPISIDHASH ' + ts + '_' + hash;
  }

  async function api(endpoint, body) {
    const auth = await authHeader();
    const res = await fetch('https://www.youtube.com/youtubei/v1/' + endpoint + '?key=' + API_KEY + '&prettyPrint=false', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
        'X-Origin': 'https://www.youtube.com',
        'X-Goog-AuthUser': '0',
        'X-Youtube-Client-Name': '1',
        'X-Youtube-Client-Version': (CONTEXT.client && CONTEXT.client.clientVersion) || '2.0',
      },
      body: JSON.stringify(Object.assign({ context: CONTEXT }, body)),
    });
    const text = await res.text();
    if (!res.ok) {
      const err = new Error('HTTP ' + res.status);
      err.status = res.status;
      err.body = text;
      try {
        const j = JSON.parse(text);
        if (j && j.error && j.error.status === 'FAILED_PRECONDITION') err.code = 'FAILED_PRECONDITION';
      } catch { }
      if (res.status === 429) err.code = 'RATE_LIMIT';
      throw err;
    }
    try { return JSON.parse(text); } catch { return { _raw: text }; }
  }

  async function createPlaylist(title, firstVideoId, privacy) {
    const r = await api('playlist/create', {
      title,
      privacyStatus: privacy,
      videoIds: firstVideoId ? [firstVideoId] : undefined,
    });
    return r.playlistId
      || (r.playlistEditResults && r.playlistEditResults[0] && r.playlistEditResults[0].playlistId)
      || null;
  }

  async function addBatch(playlistId, videoIds) {
    const actions = videoIds.map(v => ({ action: 'ACTION_ADD_VIDEO', addedVideoId: v }));
    return await api('browse/edit_playlist', { playlistId, actions });
  }

  async function removeBatch(playlistId, videoIds) {
    // ACTION_REMOVE_VIDEO_BY_VIDEO_ID removes by videoId (no setVideoId needed).
    const actions = videoIds.map(v => ({ action: 'ACTION_REMOVE_VIDEO_BY_VIDEO_ID', removedVideoId: v }));
    return await api('browse/edit_playlist', { playlistId, actions });
  }

  // ---------- InnerTube response walkers ----------
  function walkTree(obj, cb) {
    if (!obj || typeof obj !== 'object') return;
    cb(obj);
    if (Array.isArray(obj)) for (const x of obj) walkTree(x, cb);
    else for (const k in obj) walkTree(obj[k], cb);
  }

  function extractVideoIds(resp, set) {
    walkTree(resp, node => {
      if (node && node.playlistVideoRenderer && node.playlistVideoRenderer.videoId) {
        set.add(node.playlistVideoRenderer.videoId);
      }
    });
  }

  function chunk(arr, n) { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; }

  function parseCsv(text) {
    const lines = text.split(/\r?\n/);
    const ids = [];
    let skipHeader = true;
    for (const ln of lines) {
      const t = ln.trim();
      if (!t) continue;
      if (skipHeader) { skipHeader = false; continue; }
      const id = t.split(',')[0].trim();
      if (id) ids.push(id);
    }
    return ids;
  }

  function playlistNameFromFile(fname) {
    const base = fname.replace(/\.csv$/i, '');
    const m = base.match(/_(.+)_$/);
    return (m ? m[1] : base).trim();
  }

  function isWatchLater(name) {
    const n = name.toLowerCase().replace(/\s+/g, ' ').trim();
    return n === 'watch later' || n === 'смотреть позже' || n === 'посмотреть позже' || n === 'дивитися пізніше' || n === 'дивитись пізніше';
  }

  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return h + t('time_h') + ' ' + m + t('time_m') + ' ' + s + t('time_s');
    if (m) return m + t('time_m') + ' ' + s + t('time_s');
    return s + t('time_s');
  }

  // ---------- Pure-DOM builder ----------
  function h(tag, opts, ...kids) {
    const el = document.createElement(tag);
    if (opts) for (const k in opts) {
      const v = opts[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style') { if (typeof v === 'string') el.style.cssText = v; else Object.assign(el.style, v); }
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    appendKids(el, kids);
    return el;
  }
  function appendKids(el, kids) {
    for (const c of kids) {
      if (c == null || c === false) continue;
      if (Array.isArray(c)) appendKids(el, c);
      else el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
  }

  // ---------- Styles ----------
  const style = document.createElement('style');
  style.id = 'yt-importer-style';
  style.textContent = `
    #yt-importer-root { position: fixed; inset: 0; z-index: 2147483647; background: rgba(0,0,0,0.78); display: flex; align-items: center; justify-content: center; font-family: 'Roboto', Arial, sans-serif; color: #f1f1f1; }
    #yt-importer-modal { background: #212121; border-radius: 12px; width: min(760px, 96vw); max-height: 92vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
    .yti-header { padding: 16px 22px; border-bottom: 1px solid #383838; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .yti-header h2 { margin: 0; font-size: 17px; font-weight: 500; flex: 1; }
    .yti-lang { display: flex; gap: 4px; }
    .yti-lang-btn { background: #2a2a2a; border: 1px solid #444; color: #aaa; padding: 4px 9px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; min-width: 30px; }
    .yti-lang-btn.active { background: #4a8bf5; color: #fff; border-color: #4a8bf5; }
    .yti-lang-btn:hover:not(.active) { background: #383838; color: #fff; }
    .yti-lang-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .yti-close { background: transparent; border: none; color: #aaa; font-size: 26px; cursor: pointer; padding: 0 6px; line-height: 1; }
    .yti-close:hover { color: #fff; }
    .yti-body { padding: 18px 22px; overflow-y: auto; flex: 1; }
    .yti-section { margin-bottom: 16px; }
    .yti-section h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #aaa; margin: 0 0 8px; font-weight: 500; }
    .yti-warning { background: #3a2222; border-left: 4px solid #f04747; padding: 12px 14px; border-radius: 4px; font-size: 13px; line-height: 1.55; }
    .yti-warning strong { color: #ff8a80; }
    .yti-info { background: #1e2a3a; border-left: 4px solid #4a8bf5; padding: 12px 14px; border-radius: 4px; font-size: 13px; line-height: 1.55; }
    .yti-info ul { margin: 6px 0 0; padding-left: 20px; }
    .yti-info li { margin: 2px 0; }
    .yti-drop { border: 2px dashed #555; border-radius: 8px; padding: 22px; text-align: center; cursor: pointer; transition: border-color .15s, background .15s; }
    .yti-drop:hover, .yti-drop.drag { border-color: #4a8bf5; background: #1a1a1a; }
    .yti-drop input { display: none; }
    .yti-drop .hint { color: #888; font-size: 12px; margin-top: 6px; }
    .yti-files { margin-top: 10px; display: flex; flex-direction: column; gap: 4px; }
    .yti-file-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; background: #2a2a2a; border-radius: 4px; font-size: 13px; }
    .yti-file-row .count { color: #4caf50; }
    .yti-file-row .wl { color: #ffc107; font-size: 11px; margin-left: 4px; }
    .yti-file-right { display: flex; align-items: center; gap: 10px; }
    .yti-file-remove { background: transparent; border: none; color: #777; font-size: 18px; line-height: 1; cursor: pointer; padding: 0 6px; border-radius: 3px; transition: color .1s, background .1s; }
    .yti-file-remove:hover { color: #ef5350; background: #3a2222; }
    .yti-row { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
    .yti-row label { flex: 0 0 180px; font-size: 13px; color: #ddd; }
    .yti-row input[type=number], .yti-row select { background: #2a2a2a; border: 1px solid #444; color: #f1f1f1; padding: 6px 10px; border-radius: 4px; font-size: 13px; width: 110px; box-sizing: border-box; }
    .yti-row .suffix { color: #888; font-size: 12px; }
    .yti-preset { display: flex; gap: 6px; flex-wrap: wrap; }
    .yti-preset button { background: #2a2a2a; border: 1px solid #444; color: #ddd; padding: 4px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; }
    .yti-preset button:hover { background: #383838; }
    .yti-preset button.active { background: #4a8bf5; border-color: #4a8bf5; color: #fff; }
    .yti-checkbox { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; font-size: 13px; color: #ddd; user-select: none; flex: 1; padding: 8px 12px; background: #2a2a2a; border-radius: 6px; border: 1px solid #3a3a3a; transition: border-color .1s; }
    .yti-checkbox:hover { border-color: #555; }
    .yti-checkbox input[type=checkbox] { width: 16px; height: 16px; cursor: pointer; accent-color: #4a8bf5; flex: 0 0 auto; margin-top: 1px; }
    .yti-checkbox-text { display: flex; flex-direction: column; gap: 2px; }
    .yti-checkbox-text .hint { color: #888; font-size: 11px; line-height: 1.4; }
    .yti-footer { padding: 14px 22px; border-top: 1px solid #383838; display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0; }
    .yti-btn { padding: 8px 20px; border-radius: 4px; border: none; cursor: pointer; font-size: 13px; font-weight: 500; }
    .yti-btn-primary { background: #4a8bf5; color: #fff; }
    .yti-btn-primary:disabled { background: #2a3a55; color: #788; cursor: not-allowed; }
    .yti-btn-primary:not(:disabled):hover { background: #5a9bff; }
    .yti-btn-ghost { background: transparent; color: #aaa; border: 1px solid #444; }
    .yti-btn-ghost:hover { color: #fff; background: #2a2a2a; }
    .yti-btn-danger { background: #c0392b; color: #fff; border: none; }
    .yti-btn-danger:hover { background: #d04030; }
    .yti-progress { background: #2a2a2a; border-radius: 4px; height: 12px; overflow: hidden; margin: 6px 0; }
    .yti-progress-bar { height: 100%; background: linear-gradient(90deg, #4a8bf5, #6aa9ff); width: 0%; transition: width .25s; }
    .yti-progress-meta { display: flex; justify-content: space-between; font-size: 12px; color: #aaa; margin-top: 4px; gap: 12px; flex-wrap: wrap; }
    .yti-log { background: #161616; border-radius: 4px; padding: 10px 12px; max-height: 220px; overflow-y: auto; font-family: 'Consolas','Courier New',monospace; font-size: 12px; line-height: 1.55; }
    .yti-log div { white-space: pre-wrap; word-break: break-all; }
    .yti-log .ok { color: #81c784; }
    .yti-log .warn { color: #ffb74d; }
    .yti-log .err { color: #ef5350; }
    .yti-log .info { color: #90caf9; }
    .yti-log .pl { color: #ce93d8; font-weight: bold; margin-top: 8px; border-top: 1px dashed #333; padding-top: 4px; }
    .yti-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 14px; }
    .yti-summary-card { background: #2a2a2a; padding: 14px; border-radius: 6px; text-align: center; }
    .yti-summary-card .num { font-size: 28px; font-weight: 500; line-height: 1.1; }
    .yti-summary-card .lbl { font-size: 11px; color: #aaa; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em; }
    .yti-summary-card.ok .num { color: #81c784; }
    .yti-summary-card.warn .num { color: #ffb74d; }
    .yti-summary-card.err .num { color: #ef5350; }
    .yti-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .yti-table th { text-align: left; padding: 6px 8px; color: #aaa; font-weight: 500; border-bottom: 1px solid #383838; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    .yti-table td { padding: 6px 8px; border-bottom: 1px solid #2a2a2a; }
    .yti-table .num { text-align: right; font-variant-numeric: tabular-nums; }
    .yti-table .green { color: #81c784; }
    .yti-table .amber { color: #ffb74d; }
    .yti-table .red { color: #ef5350; }
    .yti-failed { background: #161616; border-radius: 4px; padding: 10px 12px; max-height: 220px; overflow-y: auto; font-family: 'Consolas',monospace; font-size: 12px; line-height: 1.6; }
    .yti-failed a { color: #6aa9ff; text-decoration: none; }
    .yti-failed a:hover { text-decoration: underline; }
    .yti-failed .pl-tag { color: #ce93d8; }
    .yti-failed .reason { color: #888; }
  `;
  document.head.appendChild(style);

  // ---------- DOM ----------
  const root = document.createElement('div');
  root.id = 'yt-importer-root';
  document.body.appendChild(root);

  let parsed = [];
  let running = false, stopRequested = false;

  let elTitle, elClose, elLangBtns;
  let stageSetup, stageRun, stageDone;
  let elFile, elDrop, elFiles;
  let elDelay, elBatch, elPrivacy, elPreset, elClearWL;
  let elBar, elPct, elCounts, elEta, elCurrent, elLog;
  let elCancel, elStart;

  // ---------- Builders (re-run on language change) ----------
  function buildSetupStage() {
    return h('div', { class: 'yti-body', id: 'yti-stage-setup' }, [
      h('div', { class: 'yti-section' }, [
        h('div', { class: 'yti-warning' }, [
          h('strong', { text: t('warning_title') }),
          t('warning_body'),
          h('br'), h('br'),
          h('strong', { text: t('warning_bold') }),
          t('warning_tail'),
        ]),
      ]),
      h('div', { class: 'yti-section' }, [
        h('div', { class: 'yti-info' }, [
          h('strong', { text: t('info_title') }),
          h('ul', null, [
            h('li', { text: t('info_li1') }),
            h('li', { text: t('info_li2') }),
            h('li', { text: t('info_li3') }),
            h('li', { text: t('info_li4') }),
            h('li', { text: t('info_li5') }),
            h('li', { text: t('info_li6') }),
          ]),
        ]),
      ]),
      h('div', { class: 'yti-section' }, [
        h('h3', { text: t('step1') }),
        h('div', { class: 'yti-drop', id: 'yti-drop' }, [
          h('div', { text: t('drop_main') }),
          h('div', { class: 'hint', text: t('drop_hint') }),
          h('input', { type: 'file', id: 'yti-file', accept: '.csv,text/csv', multiple: true }),
        ]),
        h('div', { class: 'yti-files', id: 'yti-files' }),
      ]),
      h('div', { class: 'yti-section' }, [
        h('h3', { text: t('step2') }),
        h('div', { class: 'yti-row' }, [
          h('label', { text: t('label_delay') }),
          h('input', { type: 'number', id: 'yti-delay', value: '700', min: '100', max: '60000', step: '100' }),
          h('span', { class: 'suffix', text: t('suffix_ms') }),
        ]),
        h('div', { class: 'yti-row' }, [
          h('label'),
          h('div', { class: 'yti-preset', id: 'yti-preset' }, [
            h('button', { 'data-v': '500', text: '⚡ 0.5 ' + t('time_s') }),
            h('button', { 'data-v': '700', class: 'active', text: '⚙ 0.7 ' + t('time_s') }),
            h('button', { 'data-v': '3000', text: '🛡 3 ' + t('time_s') }),
            h('button', { 'data-v': '10000', text: '🐢 10 ' + t('time_s') }),
            h('button', { 'data-v': '15000', text: '🛑 15 ' + t('time_s') }),
          ]),
        ]),
        h('div', { class: 'yti-row' }, [
          h('label', { text: t('label_batch') }),
          h('input', { type: 'number', id: 'yti-batch', value: '20', min: '1', max: '50', step: '1' }),
          h('span', { class: 'suffix', text: t('suffix_batch') }),
        ]),
        h('div', { class: 'yti-row' }, [
          h('label', { text: t('label_privacy') }),
          h('select', { id: 'yti-privacy' }, [
            h('option', { value: 'PRIVATE', text: t('privacy_private') }),
            h('option', { value: 'UNLISTED', text: t('privacy_unlisted') }),
            h('option', { value: 'PUBLIC', text: t('privacy_public') }),
          ]),
        ]),
        h('div', { class: 'yti-row' }, [
          h('label', { class: 'yti-checkbox' }, [
            h('input', { type: 'checkbox', id: 'yti-clear-wl' }),
            h('span', { class: 'yti-checkbox-text' }, [
              h('span', { text: t('clear_wl_label') }),
              h('span', { class: 'hint', text: t('clear_wl_hint') }),
            ]),
          ]),
        ]),
      ]),
    ]);
  }

  function buildRunStage() {
    return h('div', { class: 'yti-body', id: 'yti-stage-run', style: 'display:none;' }, [
      h('div', { class: 'yti-section' }, [
        h('div', { id: 'yti-current', style: 'font-size:14px; margin-bottom:6px;', text: t('preparing') }),
        h('div', { class: 'yti-progress' }, [
          h('div', { class: 'yti-progress-bar', id: 'yti-bar' }),
        ]),
        h('div', { class: 'yti-progress-meta' }, [
          h('span', { id: 'yti-pct', text: '0%' }),
          h('span', { id: 'yti-counts', text: t('counts', 0, 0) }),
          h('span', { id: 'yti-eta', text: t('eta_calc') }),
        ]),
      ]),
      h('div', { class: 'yti-section' }, [
        h('h3', { text: t('log_heading') }),
        h('div', { class: 'yti-log', id: 'yti-log' }),
      ]),
    ]);
  }

  function buildModal() {
    const langBtn = (code, label) => h('button', {
      class: 'yti-lang-btn' + (code === currentLang ? ' active' : ''),
      'data-lang': code,
      text: label,
    });

    root.replaceChildren(h('div', { id: 'yt-importer-modal' }, [
      h('div', { class: 'yti-header' }, [
        h('h2', { id: 'yti-title', text: t('title') }),
        h('div', { class: 'yti-lang' }, [
          langBtn('en', 'EN'),
          langBtn('ru', 'RU'),
          langBtn('uk', 'UA'),
        ]),
        h('button', { class: 'yti-close', title: t('closeTitle'), text: '×' }),
      ]),
      buildSetupStage(),
      buildRunStage(),
      h('div', { class: 'yti-body', id: 'yti-stage-done', style: 'display:none;' }),
      h('div', { class: 'yti-footer', id: 'yti-footer' }, [
        h('button', { class: 'yti-btn yti-btn-ghost', id: 'yti-cancel', text: t('btn_close') }),
        h('button', { class: 'yti-btn yti-btn-primary', id: 'yti-start', disabled: true, text: t('btn_start') }),
      ]),
    ]));

    queryRefs();
    wireAll();
  }

  function queryRefs() {
    elTitle = $('#yti-title', root);
    elClose = root.querySelector('.yti-close');
    elLangBtns = root.querySelectorAll('.yti-lang-btn');
    stageSetup = $('#yti-stage-setup', root);
    stageRun = $('#yti-stage-run', root);
    stageDone = $('#yti-stage-done', root);
    elFile = $('#yti-file', root);
    elDrop = $('#yti-drop', root);
    elFiles = $('#yti-files', root);
    elDelay = $('#yti-delay', root);
    elBatch = $('#yti-batch', root);
    elPrivacy = $('#yti-privacy', root);
    elPreset = $('#yti-preset', root);
    elClearWL = $('#yti-clear-wl', root);
    elBar = $('#yti-bar', root);
    elPct = $('#yti-pct', root);
    elCounts = $('#yti-counts', root);
    elEta = $('#yti-eta', root);
    elCurrent = $('#yti-current', root);
    elLog = $('#yti-log', root);
    elCancel = $('#yti-cancel', root);
    elStart = $('#yti-start', root);
  }

  function wireAll() {
    elClose.addEventListener('click', close);
    elCancel.onclick = close;
    elStart.onclick = () => {
      start().catch(e => logLine(t('log_critical', e.message || e), 'err'));
    };
    elLangBtns.forEach(b => b.addEventListener('click', () => switchLang(b.dataset.lang)));
    wireSetup();
  }

  function wireSetup() {
    elDrop.addEventListener('click', () => elFile.click());
    elFile.addEventListener('change', e => handleFiles(e.target.files));
    ['dragover', 'dragenter'].forEach(ev => elDrop.addEventListener(ev, e => { e.preventDefault(); elDrop.classList.add('drag'); }));
    ['dragleave', 'dragend'].forEach(ev => elDrop.addEventListener(ev, e => { e.preventDefault(); elDrop.classList.remove('drag'); }));
    elDrop.addEventListener('drop', e => { e.preventDefault(); elDrop.classList.remove('drag'); handleFiles(e.dataTransfer.files); });

    elPreset.addEventListener('click', e => {
      const btn = e.target.closest('button[data-v]'); if (!btn) return;
      elDelay.value = btn.dataset.v;
      elPreset.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
    });
    elDelay.addEventListener('input', () => {
      elPreset.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.v === elDelay.value));
    });
  }

  function switchLang(lang) {
    if (!LOCALES[lang] || lang === currentLang) return;
    if (running) return;

    const delay = elDelay ? elDelay.value : '700';
    const batch = elBatch ? elBatch.value : '20';
    const privacy = elPrivacy ? elPrivacy.value : 'PRIVATE';
    const clearWL = elClearWL ? elClearWL.checked : false;

    currentLang = lang;
    try { localStorage.setItem('yt-importer-lang', lang); } catch {}

    const newSetup = buildSetupStage();
    stageSetup.replaceWith(newSetup);
    stageSetup = newSetup;

    const newRun = buildRunStage();
    stageRun.replaceWith(newRun);
    stageRun = newRun;

    elFile = $('#yti-file', root);
    elDrop = $('#yti-drop', root);
    elFiles = $('#yti-files', root);
    elDelay = $('#yti-delay', root);
    elBatch = $('#yti-batch', root);
    elPrivacy = $('#yti-privacy', root);
    elPreset = $('#yti-preset', root);
    elClearWL = $('#yti-clear-wl', root);
    elBar = $('#yti-bar', root);
    elPct = $('#yti-pct', root);
    elCounts = $('#yti-counts', root);
    elEta = $('#yti-eta', root);
    elCurrent = $('#yti-current', root);
    elLog = $('#yti-log', root);

    elDelay.value = delay;
    elBatch.value = batch;
    elPrivacy.value = privacy;
    if (elClearWL) elClearWL.checked = clearWL;
    elPreset.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.v === delay));

    wireSetup();

    elTitle.textContent = t('title');
    elClose.title = t('closeTitle');
    elCancel.textContent = t('btn_close');
    elStart.textContent = t('btn_start');

    elLangBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === currentLang));

    refreshFilesUI();
  }

  function close() {
    if (running) {
      if (!confirm(t('confirm_close'))) return;
      stopRequested = true;
    }
    root.remove();
    style.remove();
  }

  function resetToSetup() {
    parsed = [];
    running = false;
    stopRequested = false;

    if (elLog) elLog.replaceChildren();
    if (elBar) elBar.style.width = '0%';
    if (elPct) elPct.textContent = '0%';
    if (elCurrent) elCurrent.textContent = t('preparing');
    if (elCounts) elCounts.textContent = t('counts', 0, 0);
    if (elEta) elEta.textContent = t('eta_calc');

    stageDone.replaceChildren();

    stageDone.style.display = 'none';
    stageRun.style.display = 'none';
    stageSetup.style.display = '';

    elStart.style.display = '';
    elStart.textContent = t('btn_start');
    elStart.onclick = () => { start().catch(e => logLine(t('log_critical', e.message || e), 'err')); };

    elCancel.textContent = t('btn_close');
    elCancel.className = 'yti-btn yti-btn-ghost';
    elCancel.disabled = false;
    elCancel.onclick = close;

    elLangBtns.forEach(b => b.disabled = false);

    refreshFilesUI();
  }

  function logLine(text, cls) {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    elLog.appendChild(div);
    elLog.scrollTop = elLog.scrollHeight;
  }

  function refreshFilesUI() {
    elFiles.replaceChildren();
    let total = 0;
    for (const p of parsed) {
      const wl = isWatchLater(p.name);
      const item = p; // capture for closure
      const row = h('div', { class: 'yti-file-row' }, [
        h('span', null, [
          (wl ? '⏱ ' : '📁 ') + p.name,
          wl ? h('span', { class: 'wl', text: t('wl_tag') }) : null,
        ]),
        h('span', { class: 'yti-file-right' }, [
          h('span', { class: 'count', text: t('count_videos', p.videos.length) }),
          h('button', {
            class: 'yti-file-remove',
            title: t('btn_remove_file'),
            text: '×',
            onclick: (e) => {
              e.stopPropagation();
              parsed = parsed.filter(x => x !== item);
              refreshFilesUI();
            },
          }),
        ]),
      ]);
      elFiles.appendChild(row);
      total += p.videos.length;
    }
    elStart.disabled = parsed.length === 0 || total === 0;
    elStart.textContent = total ? t('btn_start_count', total) : t('btn_start');
  }

  async function handleFiles(files) {
    for (const f of Array.from(files)) {
      if (!/\.csv$/i.test(f.name)) continue;
      try {
        const text = await f.text();
        const videos = parseCsv(text);
        const name = playlistNameFromFile(f.name);
        parsed = parsed.filter(p => p.name !== name);
        parsed.push({ name, videos, file: f.name });
      } catch (e) {
        alert(t('alert_read_file', f.name, e.message));
      }
    }
    refreshFilesUI();
  }

  buildModal();

  // ---------- Run ----------
  async function start() {
    if (parsed.length === 0) return;
    const delay = Math.max(100, parseInt(elDelay.value, 10) || 700);
    const batchSize = Math.max(1, Math.min(50, parseInt(elBatch.value, 10) || 20));
    const privacy = elPrivacy.value;
    const clearWL = !!(elClearWL && elClearWL.checked);

    if (delay < 1000 && parsed.some(p => p.videos.length > 200)) {
      if (!confirm(t('confirm_fast'))) return;
    }

    stageSetup.style.display = 'none';
    stageRun.style.display = '';
    elStart.style.display = 'none';
    elCancel.textContent = t('btn_stop');
    elCancel.className = 'yti-btn yti-btn-danger';
    elCancel.onclick = () => { if (confirm(t('confirm_stop'))) { stopRequested = true; elCancel.disabled = true; elCancel.textContent = t('btn_stopping'); } };

    elLangBtns.forEach(b => b.disabled = true);

    running = true;

    const plan = parsed
      .map(p => {
        const wl = isWatchLater(p.name);
        const v = wl ? p.videos.slice().reverse() : p.videos.slice();
        const requests = wl ? Math.max(1, Math.ceil(v.length / batchSize)) : 1 + Math.ceil(Math.max(0, v.length - 1) / batchSize);
        return { name: p.name, wl, videos: v, requests };
      })
      .filter(p => p.videos.length > 0);

    let totalRequests = plan.reduce((s, p) => s + p.requests, 0);
    const totalVideos = plan.reduce((s, p) => s + p.videos.length, 0);
    let doneRequests = 0, doneVideos = 0;
    const t0 = Date.now();
    const reqTimes = [];

    const result = { perPlaylist: {}, totalAdded: 0, totalUnavailable: 0, totalOther: 0 };
    const ensure = name => {
      if (!result.perPlaylist[name]) result.perPlaylist[name] = {
        added: [], failedUnavailable: [], failedOther: [],
        playlistId: null, created: false, isWL: false,
      };
      return result.perPlaylist[name];
    };

    function updateProgress() {
      const pct = totalRequests ? Math.min(1, doneRequests / totalRequests) : 0;
      elBar.style.width = (pct * 100).toFixed(1) + '%';
      elPct.textContent = (pct * 100).toFixed(1) + '%';
      elCounts.textContent = t('counts', doneVideos, totalVideos);
      if (reqTimes.length >= 2) {
        const recent = reqTimes.slice(-15);
        const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const remainingReq = Math.max(0, totalRequests - doneRequests);
        const remainingSec = remainingReq * (avg + delay) / 1000;
        elEta.textContent = t('eta', fmtTime(remainingSec));
      }
    }

    async function timed(fn) {
      const tm = Date.now();
      try { const r = await fn(); reqTimes.push(Date.now() - tm); return r; }
      catch (e) { reqTimes.push(Date.now() - tm); throw e; }
    }

    updateProgress();

    for (const pl of plan) {
      if (stopRequested) break;
      const rec = ensure(pl.name);
      rec.isWL = pl.wl;
      elCurrent.textContent = (pl.wl ? '⏱ ' : '📁 ') + pl.name + ' (' + t('count_videos', pl.videos.length) + ')';
      logLine(t('log_pl_header', pl.name, pl.videos.length), 'pl');

      let playlistId = null;
      let startIdx = 0;

      if (pl.wl) {
        playlistId = 'WL';
        logLine(t('log_wl_target'), 'info');

        if (clearWL) {
          try {
            logLine(t('log_wl_clearing_start'), 'warn');
            let removedTotal = 0;
            let pageNum = 0;
            const maxPages = 120;
            while (pageNum++ < maxPages) {
              if (stopRequested) break;

              let r;
              try {
                r = await timed(() => api('browse', { browseId: 'VL' + playlistId }));
              } catch (e) {
                logLine(t('log_clear_failed', e.message || e), 'err');
                break;
              }
              const pageIds = new Set();
              extractVideoIds(r, pageIds);

              if (pageIds.size === 0) break;

              const arr = Array.from(pageIds);
              logLine(t('log_wl_page', pageNum, arr.length, removedTotal), 'info');

              const clearBatches = chunk(arr, batchSize);
              totalRequests += clearBatches.length + 1;
              doneRequests += 1;
              let pageRemoved = 0;
              for (let i = 0; i < clearBatches.length; i++) {
                if (stopRequested) break;
                const b = clearBatches[i];
                try {
                  await timed(() => removeBatch(playlistId, b));
                  pageRemoved += b.length;
                  removedTotal += b.length;
                  logLine(t('log_remove_batch', i + 1, clearBatches.length, b.length), 'ok');
                } catch (e) {
                  logLine(t('log_remove_failed', i + 1, e.message || e), 'warn');
                }
                doneRequests++;
                updateProgress();
                await sleep(delay);
              }

              if (pageRemoved === 0) {
                logLine(t('log_clear_stuck'), 'warn');
                break;
              }

              await sleep(delay);
            }
            logLine(t('log_wl_cleared', removedTotal), 'ok');
          } catch (e) {
            logLine(t('log_clear_failed', e.message || e), 'err');
          }
        }
      } else {
        while (!playlistId && startIdx < pl.videos.length && !stopRequested) {
          const vid = pl.videos[startIdx];
          try {
            playlistId = await timed(() => createPlaylist(pl.name, vid, privacy));
            if (!playlistId) throw new Error('no playlistId returned');
            rec.playlistId = playlistId;
            rec.created = true;
            rec.added.push(vid);
            result.totalAdded++;
            doneVideos++;
            logLine(t('log_created', vid), 'ok');
            startIdx++;
          } catch (e) {
            if (e.code === 'FAILED_PRECONDITION') {
              rec.failedUnavailable.push(vid);
              result.totalUnavailable++;
              doneVideos++;
              logLine(t('log_unavail_creating', vid), 'warn');
              startIdx++;
              totalRequests++;
              await sleep(delay);
            } else if (e.code === 'RATE_LIMIT') {
              logLine(t('log_ratelimit_30'), 'warn');
              await sleep(30000);
            } else {
              logLine(t('log_create_failed', e.message || e), 'err');
              rec.failedOther.push({ id: vid, reason: e.message || t('reason_create_err') });
              result.totalOther++;
              doneVideos++;
              break;
            }
          }
        }
        if (!playlistId) {
          for (let i = startIdx; i < pl.videos.length; i++) {
            rec.failedOther.push({ id: pl.videos[i], reason: t('reason_not_created') });
            result.totalOther++;
            doneVideos++;
          }
          doneRequests = Math.min(totalRequests, doneRequests + pl.requests);
          updateProgress();
          continue;
        }
        doneRequests++;
        updateProgress();
        await sleep(delay);
      }

      const remaining = pl.videos.slice(startIdx);
      const batches = chunk(remaining, batchSize);

      for (let i = 0; i < batches.length; i++) {
        if (stopRequested) break;
        const b = batches[i];
        try {
          await timed(() => addBatch(playlistId, b));
          rec.added.push(...b);
          result.totalAdded += b.length;
          doneVideos += b.length;
          logLine(t('log_batch_ok', i + 1, batches.length, b.length), 'ok');
          doneRequests++;
        } catch (e) {
          if (e.code === 'RATE_LIMIT') {
            logLine(t('log_batch_ratelimit'), 'warn');
            await sleep(30000);
          } else {
            logLine(t('log_batch_fail', i + 1), 'warn');
          }
          totalRequests += b.length - 1;
          for (const v of b) {
            if (stopRequested) break;
            try {
              await timed(() => addBatch(playlistId, [v]));
              rec.added.push(v);
              result.totalAdded++;
              doneVideos++;
              logLine(t('log_added', v), 'ok');
            } catch (e2) {
              if (e2.code === 'FAILED_PRECONDITION') {
                rec.failedUnavailable.push(v);
                result.totalUnavailable++;
                doneVideos++;
                logLine(t('log_unavail_adding', v), 'warn');
              } else if (e2.code === 'RATE_LIMIT') {
                logLine(t('log_ratelimit_60'), 'warn');
                await sleep(60000);
                try {
                  await timed(() => addBatch(playlistId, [v]));
                  rec.added.push(v);
                  result.totalAdded++;
                  doneVideos++;
                  logLine(t('log_added_after_pause', v), 'ok');
                } catch (e3) {
                  rec.failedOther.push({ id: v, reason: e3.message || 'error' });
                  result.totalOther++;
                  doneVideos++;
                  logLine(t('log_video_err', v, e3.message || e3), 'err');
                }
              } else {
                rec.failedOther.push({ id: v, reason: e2.message || 'error' });
                result.totalOther++;
                doneVideos++;
                logLine(t('log_video_err', v, e2.message || e2), 'err');
              }
            }
            doneRequests++;
            updateProgress();
            await sleep(delay);
          }
          continue;
        }
        updateProgress();
        await sleep(delay);
      }
    }

    running = false;
    showResults(result, Date.now() - t0, stopRequested);
  }

  // ---------- Final report ----------
  function showResults(res, elapsedMs, stopped) {
    stageRun.style.display = 'none';
    stageDone.style.display = '';
    elCancel.textContent = t('btn_close');
    elCancel.className = 'yti-btn yti-btn-ghost';
    elCancel.disabled = false;
    elCancel.onclick = close;
    elStart.style.display = '';
    elStart.disabled = false;
    elStart.textContent = t('btn_new_import');
    elStart.onclick = resetToSetup;

    const playlists = Object.entries(res.perPlaylist);
    const totalAdded = res.totalAdded;
    const totalUnavailable = res.totalUnavailable;
    const totalOther = res.totalOther;

    const failedList = playlists.flatMap(([name, p]) => [
      ...p.failedUnavailable.map(id => ({ pl: name, id, reason: t('reason_unavail') })),
      ...p.failedOther.map(o => ({ pl: name, id: o.id, reason: o.reason })),
    ]);

    const tbody = h('tbody', null, playlists.map(([name, p]) => {
      const tag = h('span', { style: p.isWL ? 'color:#ffc107;' : 'color:#90caf9;', text: p.isWL ? '⏱' : '📁' });
      const status = p.isWL
        ? h('span', { style: 'color:#888;font-size:11px;', text: t('tag_wl') })
        : (p.created
          ? h('span', { style: 'color:#81c784;font-size:11px;', text: t('tag_created') })
          : h('span', { style: 'color:#ef5350;font-size:11px;', text: t('tag_not_created') }));
      return h('tr', null, [
        h('td', null, [tag, ' ' + name + ' ', status]),
        h('td', { class: 'num green', text: p.added.length }),
        h('td', { class: 'num amber', text: p.failedUnavailable.length }),
        h('td', { class: 'num red', text: p.failedOther.length }),
      ]);
    }));

    let failedBlock, copyBtn, dlBtn;
    if (failedList.length) {
      const failedListEl = h('div', { class: 'yti-failed' }, failedList.map(f => h('div', null, [
        h('span', { class: 'pl-tag', text: '[' + f.pl + ']' }),
        ' ',
        h('a', { href: 'https://youtu.be/' + encodeURIComponent(f.id), target: '_blank', rel: 'noopener', text: f.id }),
        ' ',
        h('span', { class: 'reason', text: '— ' + f.reason }),
      ])));
      copyBtn = h('button', { class: 'yti-btn yti-btn-ghost', text: t('btn_copy') });
      dlBtn = h('button', { class: 'yti-btn yti-btn-ghost', text: t('btn_download') });
      failedBlock = h('div', { class: 'yti-section' }, [
        h('h3', { text: t('section_failed', failedList.length) }),
        failedListEl,
        h('div', { style: 'margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;' }, [copyBtn, dlBtn]),
      ]);
    } else {
      failedBlock = h('div', {
        class: 'yti-section',
        style: 'color:#81c784; padding:14px; background:#1e2e1e; border-radius:6px; border-left:4px solid #4caf50;',
        text: t('all_added'),
      });
    }

    stageDone.replaceChildren(
      h('div', { class: 'yti-section' }, [
        h('h3', { text: (stopped ? t('done_stopped') : t('done_finished')) + ' ' + t('done_in', fmtTime(elapsedMs / 1000)) }),
        h('div', { class: 'yti-summary' }, [
          h('div', { class: 'yti-summary-card ok' }, [
            h('div', { class: 'num', text: totalAdded }),
            h('div', { class: 'lbl', text: t('card_added') }),
          ]),
          h('div', { class: 'yti-summary-card warn' }, [
            h('div', { class: 'num', text: totalUnavailable }),
            h('div', { class: 'lbl', text: t('card_unavail') }),
          ]),
          h('div', { class: 'yti-summary-card err' }, [
            h('div', { class: 'num', text: totalOther }),
            h('div', { class: 'lbl', text: t('card_errors') }),
          ]),
        ]),
      ]),
      h('div', { class: 'yti-section' }, [
        h('h3', { text: t('section_per_pl') }),
        h('table', { class: 'yti-table' }, [
          h('thead', null, [
            h('tr', null, [
              h('th', { text: t('th_playlist') }),
              h('th', { class: 'num', text: t('th_added') }),
              h('th', { class: 'num', text: t('th_unavail') }),
              h('th', { class: 'num', text: t('th_errors') }),
            ]),
          ]),
          tbody,
        ]),
      ]),
      failedBlock,
    );

    if (failedList.length) {
      const txt = failedList.map(f => '[' + f.pl + ']\thttps://youtu.be/' + f.id + '\t' + f.reason).join('\n');
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(txt).then(
          () => { const old = copyBtn.textContent; copyBtn.textContent = t('btn_copied'); setTimeout(() => copyBtn.textContent = old, 1500); },
          () => alert(t('alert_clip_fail'))
        );
      };
      dlBtn.onclick = () => {
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'failed-videos.txt';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      };
    }

    // Console summary
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#4a8bf5');
    console.log('%c' + t('console_title'), 'color:#fff; background:#4a8bf5; font-weight:bold; font-size:14px; padding:2px 8px;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#4a8bf5');
    console.log('%c' + t('console_added') + '%c' + totalAdded, 'color:#81c784; font-weight:bold', 'color:#81c784');
    console.log('%c' + t('console_unavail') + '%c' + totalUnavailable, 'color:#ffb74d; font-weight:bold', 'color:#ffb74d');
    console.log('%c' + t('console_errors') + '%c' + totalOther, 'color:#ef5350; font-weight:bold', 'color:#ef5350');
    console.log('%c' + t('console_time') + '%c' + fmtTime(elapsedMs / 1000), 'color:#aaa', 'color:#fff');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#4a8bf5');
    console.log('%c' + t('console_per_pl'), 'color:#90caf9; font-weight:bold');
    console.table(playlists.map(([name, p]) => {
      const obj = {};
      obj[t('col_pl')] = name;
      obj[t('col_type')] = p.isWL ? t('col_wl_sys') : (p.created ? t('col_created') : t('col_not_created'));
      obj[t('col_added')] = p.added.length;
      obj[t('col_unavail')] = p.failedUnavailable.length;
      obj[t('col_errors')] = p.failedOther.length;
      return obj;
    }));
    if (failedList.length) {
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#4a8bf5');
      console.log('%c' + t('console_failed'), 'color:#ffb74d; font-weight:bold');
      console.table(failedList.map(f => {
        const obj = {};
        obj[t('col_pl')] = f.pl;
        obj[t('col_url')] = 'https://youtu.be/' + f.id;
        obj[t('col_reason')] = f.reason;
        return obj;
      }));
    }
    window.__importResult = res;
    console.log('%c' + t('console_full'), 'color:#888; font-style:italic');
  }
})();
