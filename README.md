# VelvetMeet Pre-Lander v4

Age-gate с **3 ротирующими заголовками** (A/B тестирование), tracking, geo-IP, cloaking и логированием ботов.

---

## Что нового в v4

### Ротация заголовков (3 варианта)

При каждой загрузке страницы случайно выбирается один из 3 заголовков:

**EN:**
- v1: "She didn’t expect to start over at 52."
- v2: "Is it really too late to meet someone real?"
- v3: "Her last message was three years ago."

**DE:**
- v1: "Mit 52 hätte sie nicht gedacht, nochmal anzufangen."
- v2: "Ist es wirklich zu spät, jemanden Echten zu treffen?"
- v3: "Ihre letzte Nachricht war vor drei Jahren."

**PL:**
- v1: "W wieku 52 lat nie spodziewała się zaczynać od nowa."
- v2: "Czy naprawdę za późno, by poznać kogoś prawdziwego?"
- v3: "Jej ostatnia wiadomość była trzy lata temu."

### Tracking варианта в партнäрке

Номер варианта (v0, v1, v2) передаäтся в `aff_sub4`:

```
aff_sub5 = ig-anna_de   (источник трафика)
aff_sub4 = v1            (вариант заголовка)
```

В партнäрке ты можешь сравнить конверсию по каждому варианту.

### Как использовать A/B-тест

1. Запусти трафик на 1-2 недели
2. В партнäрке смотри статистику по `aff_sub4`:
   - `v0` = первый вариант заголовка
   - `v1` = второй вариант
   - `v2` = третий вариант
3. Определи winner (вариант с лучшей конверсией)
4. Отключи ротацию: убери `VARIANTS` и оставь только winner в `I18N`

---

## Структура проекта

```
velvet-soft-v4/
├── index.html              # Age-gate с ротацией заголовков
├── _redirects              # Cloudflare статические редиректы
├── functions/
│   ├── _middleware.js      # Geo-IP + Cloaking + Bot logging
│   └── go.js               # 302 редирект с tracking + variant
└── images/
    └── bg.jpg              # Фоновое изображение (замени на своё)
```

---

## Деплой

См. полную инструкцию в README v3. Процесс тот же:

1. Cloudflare Pages → Upload assets
2. Перетащи папку `velvet-soft-v4/`
3. Deploy
4. Через 30-60 секунд проверяй

---

## Проверка ротации

Открой `https://your-domain.pages.dev` и обнови страницу (F5) несколько раз. Заголовок должен меняться между 3 вариантами.

В DevTools → Console можно проверить текущий вариант:
```javascript
currentVariant
// вернäт 0, 1 или 2
```

---

## Отключение ротации (после определения winner)

Если хочешь зафиксировать один заголовок:

1. Открой `index.html`
2. Найди блок `VARIANTS` и удали его
3. В `applyLang` замени:
   ```javascript
   // Было:
   document.getElementById("h1Text").textContent = v.h1[currentVariant];
   document.getElementById("subText").textContent = v.sub[currentVariant];
   
   // Станет:
   document.getElementById("h1Text").textContent = "Твой winner текст";
   document.getElementById("subText").textContent = "Твой winner подзаголовок";
   ```
4. В `go.js` убери `&aff_sub4=` из URL (или оставь для консистентности)
5. Deploy

---

## Полная инструкция

См. README v3 за полным руководством по:
- Cloaking (включение/выключение)
- Логированию ботов
- Tracking по источникам (`?s=`)
- Подключению своего домена
- Безопасности аккаунтов
- Чеклисту перед запуском
