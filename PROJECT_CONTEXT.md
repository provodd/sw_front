# Swaypik — compact working context

Этот файл — короткая памятка для финальных правок. Он не часть UI, а рабочий
контракт проекта, чтобы не раздувать контекст чата.

## Базовые правила

- Проект: мобильная дизайн-песочница Swaypik, Telegram Mini App.
- Стек: React 18 + Vite 5, обычный JSX и CSS.
- Новые UI/style-зависимости не добавлять: без Tailwind, CSS Modules,
  styled-components, Emotion, Sass.
- Не редактировать `src/api.js`, кроме блока `CONFIG`; не трогать
  `src/components/Sticker.jsx` и `vite.config.js`.
- Сохранять существующий функционал и связи кнопок, если явно не сказано
  обратное.
- Верстать адаптивно под 320–430px, использовать существующие токены и
  `clamp()`.
- Статичные стили — в классах/CSS, `style={{}}` только для динамических значений.
- Предпочитать существующие React-примитивы и utility-классы из `src/styles.css`.

## Материалы и кнопки

- Light glass: навбар, кнопки действий, bottom sheet, попапы. Обводка light glass:
  `#595959`.
- Dark glass больше не используется как отдельный “стеклянный” бордерный
  материал: фоновые плашки должны использовать стандартную тёмную подложку
  (`card-dark` / standard dark substrate). У dark glass обводки нет.
- Bottom sheet: light glass, одинаковое скругление всех углов, отступы по бокам
  и снизу, handle сверху, анимация открытия/закрытия, swipe-down/drag-to-close.
  Вложенные sheets закрываются по очереди, не закрывая родительский sheet.
- Стандартная чёрная кнопка: 244×45, pill, белый текст, центрирована.
  Save/Apply/Close-подобные кнопки внутри sheets тоже центрировать.

## Навбар

- Навбар — `glass-light`, активное состояние — чёрный овал, который плавно
  скользит между пунктами.
- Неактивные иконки — сплошной светло-серый цвет, не opacity.
- Telegram-иконка уже правильная и не меняется.
- Heart, search, award, profile — единый стиль: outline, rounded, одинаковая
  визуальная толщина и высота относительно Telegram.
- Иконка достижений/award взята из Figma node `5827:1093`, в
  `src/components/BottomNav.jsx` как `TrophyIcon`, использует `currentColor`.
  Размер настраивается через `.nav-icon-award` в `src/styles.css`.

## Профили

- Profile header, stats, booster, swipe-points cards — стандартная тёмная
  подложка.
- Premium-профиль: рядом с синей галочкой показывать premium badge, тот же знак,
  что у свайп-очков. Premium имеет бесконечные возвраты; counter возвратов
  не кликается.
- Стандартный пользователь получает 1 суперлайк в сутки; счётчик суперлайков
  синхронизирован везде.
- “Показать” открывает sheet личного профиля. В личном профиле скрыты:
  Telegram paid button, action buttons, report button, compatibility.
- Sheet чужого профиля ведёт себя как bottom sheet, но без боковых/нижних
  отступов и без нижних скруглений; верхняя граница близка к карточке поиска.
- В чужом профиле:
  - фото переключаются тапом по левому/правому краю, если фото больше одного;
  - если фото одно, крайний тап даёт короткую “ошибочную” отдачу;
  - compatibility badge открывает compatibility sheet;
  - report button открывает report sheet для текущего пользователя;
  - achievement thumbnails открывают achievement detail без toggle.
- Если профиль открыт из “Мэтчи” и уже имеет статус match: action buttons и
  Telegram paid button скрыты, имя опускается на их место.
- Если профиль открыт из “Лайки”: Telegram paid button скрыт, потому что ответный
  лайк ведёт к матчу.
- Telegram paid button видна только в поиске для non-match профилей. Размер 244×45,
  цена 1000, белая star icon, Telegram icon слева, текст центрирован между иконками.

## Главный поиск и свайпы

- Карточка свайпается только по X. Swipe up удалён.
- Никаких sticker overlay “pass/like/super”.
- При drag: снизу карточки градиент, red при left, green при right, интенсивность
  зависит от смещения. Верх фото остаётся читаемым.
- Dislike/like buttons запускают ту же анимацию свайпа карточки и затем переход к
  следующей, не мгновенную смену.
- Compatibility badge открывает compatibility sheet.

## Compatibility sheet

- Открывается с главной карточки и из profile sheet.
- Если открыт поверх profile sheet, закрывается отдельно, не закрывая profile sheet.
- Порядок профилей: просматриваемый профиль слева, ваш профиль справа.
- Score текст около 18px.
- Уровни:
  - `<45%` — low;
  - `45–65%` — medium;
  - `>65%` — high.
- Для каждого уровня показывать соответствующие описание и image из Figma.

## Лайки

- Blurred cards не открывают profile sheet; дают короткую ошибочную отдачу и shake
  counter button.
- Unlock button центрирована: `Лайки откроются через N свайпов`.
- Counter уменьшается после любого лайка/дизлайка; click ведёт на поиск.
- Top superlike badge использует project superlike icon.

## Мэтчи

- Cards — standard dark substrate, максимально скруглённые.
- Telegram icons на всех кнопках — та же Telegram icon, что в navbar.
- Тап по avatar/thumbnail открывает profile sheet соответствующего пользователя.
- Если match-профиль имеет собственные данные — оставлять их; если нет, можно
  связать с профилем из поиска.
- Swipe left по карточке раскрывает delete/trash action.

## Ачивки

- Segmented control на Achievements/Tasks/Invites — как в фильтрах, с плавным
  sliding active state.
- Tap по achievement card открывает standard bottom sheet detail.
- Detail sheet использует image из карточки-миниатюры, title, subtitle,
  description.
- Earned achievements показывают toggle “Показывать в профиле”; locked
  achievements не показывают этот элемент.
- Toggle label font-size около 16.65px во всех achievement sheets.
- Subtitle ближе к title; description центрировать по вертикали в оставшейся зоне.
- Achievement thumbnails в профиле показываются только если earned + toggle on.
  Иконки должны иметь padding внутри контейнера, не быть вплотную.

### Описания ачивок

- Ты у меня первый — Всё когда то бывает впервые
- 10 дней онлайна — Да, да, мы все тут чисто по приколу...
- 30 дней онлайна — В свайпик как на работу / (зп не будет)
- 100 дней онлайна — Ты здесь дольше, чем некоторые сотрудники
- Душа компании — Тебя не скипнули, цени их!
- Экстраверт — С тобой опасно спорить
- Инфлюенсер — Ты хайп-машина!
- Не жалея пальца — У тебя особый вкус
- Палец судьбы — Ну ты и привереда!
- Саппорт — Двигаемся потихоньку
- Мажор — Серьёзный вклад от серьёзного человека
- Инвестор — Что-то на богатом
- Король дизлайков — Редкое достижение. Главное никогда не отчаиваться!

## Premium screen

- Фон как у остальных экранов, без лишнего фиолетового overlay.
- Title/subtitle белые.
- Plan buttons чёрные, без border, click сразу открывает соответствующую оплату.
  Нижней кнопки “Оформить подписку” нет.
- Цены: 500 / 1000 / 2500 stars.
- Benefits: 6 items, иконки без фоновых подложек, одинаковые размеры/толщина,
  разделители начинаются от левого края текста.
- Star icon: использовать экспортированный vector везде. Обычно жёлтая, белая
  только на Telegram paid button.

## Фильтры

- Sliders глобально одинаковые: white pill thumb, единый track style.
- Empty-search distance slider имеет inactive zone `#CCCCCC`.
- Zodiac/interests chips сгруппированы по центру.
- Premium filter rows без подложки; icons: blue verified badge и premium/swipe
  points badge; toggles как в настройках профиля; label около 15.79px.
- Additional filters area открывает Premium screen; plus icon — простой белый плюс.

## Edit profile и “Основное”

- Detail sheet для параметров профиля: горизонтальный segmented control как
  фильтры, active width адаптируется к тексту, “Знак зодиака” в одну строку.
- Центральное содержимое выравнивать между segmented control и Save button.
- Save сохраняет текущий параметр и переключает на следующий пункт; закрывает
  окно только после последнего пункта.
- City input выглядит как поле имени при регистрации.
- Height picker даёт короткий haptic click при смене значения.
- Options для children/alcohol/smoking: pill, same width/height as Save button,
  centered text; selected color как у zodiac selected.
- Alcohol options:
  - Не пью вообще
  - Иногда выпиваю
  - Выпиваю часто
  - “Умеренно” удалить.
- Age selector глобально: 3 барабана day/month/year. Сохраняется дата рождения,
  в профилях показывается вычисленный возраст, который меняется после дня рождения.

## Exchange / покупки

- Exchange swipe-points sheet: balance label `Собрано:`, badge icon не растягивать.
- Exchange buttons как в Figma; selected state — accent как в “Основное”/tasks.
- Items дороже баланса: полупрозрачные, disabled, не selectable.
- No undos / no superlikes / booster purchase sheets — standard bottom sheet.
  Emoji placeholder сверху допустим.
- No superlikes warning prices: 40 / 70 / 100.
- Profile superlikes card открывает простую покупку суперлайков, не warning sheet.
- Undo card:
  - 0 открывает “Возвратов нет” purchase sheet;
  - >0 заголовок типа `N возвратов`;
  - premium — infinity и unclickable.
- Booster:
  - 0: button text `Получить`, opens booster purchase sheet;
  - >0: button text `Активировать`.
  - Booster card layout: left text padding как у swipe-points card, right meta
    vertically centered relative to text, activate button fixed width and aligned
    with нижними buttons.

## Проверка

- Для сборки использовать bundled node:
  `/Users/quang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build`
  из `/Users/quang/Documents/swipik1/sw_front`.
- `npm` может быть не в PATH.
- Для предпросмотра использовать in-app browser на актуальном Vite port.
