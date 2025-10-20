# Мемный бинго — как опубликовать на GitHub/GitHub Pages

Небольшая статическая страница (HTML/CSS/JS). Инструкции ниже помогут опубликовать текущую папку как GitHub Pages сайт и открыть проект по ссылке.

Важно: перед публикацией убедитесь, что в `index.html` и в `script.js` используются относительные пути (у вас уже такие: `icons/...`), тогда GitHub Pages будет корректно показывать иконки.

1) Локально — подготовка (один раз)

Откройте терминал и перейдите в папку проекта:

```bash
cd "/Users/grikkco/Новая папка"
```

Инициализировать git, закоммитить файлы:

```bash
git init
git add .
git commit -m "Initial commit: AI Bullshit Bingo"
git branch -M main
```

2) Создать репозиторий на GitHub и запушить

Вариант A — через веб-интерфейс GitHub
- Создайте новый публичный репозиторий (например `ai-bullshit-bingo`) на github.com
- Затем в терминале выполните (замените URL репозитория):

```bash
git remote add origin git@github.com:YOUR_USERNAME/ai-bullshit-bingo.git
git push -u origin main
```

Вариант B — через GitHub CLI (`gh`) (если установлен и вы залогинены)

```bash
gh repo create YOUR_USERNAME/ai-bullshit-bingo --public --source=. --remote=origin --push
```

3) Включить GitHub Pages (публикация)

Способ 1 — через веб UI (самый простой):
- Откройте репозиторий на GitHub → Settings → Pages
- В разделе Source выберите ветку `main` и папку `/ (root)` → Save
- Через минуту-несколько минут сайт будет доступен по адресу: `https://YOUR_USERNAME.github.io/ai-bullshit-bingo`

Способ 2 — (альтернатива) опубликовать ветку `gh-pages` вручную

```bash
git checkout -b gh-pages
git push -u origin gh-pages
# В настройках GitHub Pages выберите ветку gh-pages
```

4) Проверка
- Откройте URL (пример выше). Убедитесь, что иконки и логотип загружены.
- Если картинки не видны — проверьте в DevTools → Network, что запрашиваемые пути совпадают с файлами в репозитории (`icons/...`).

Советы и замечания
- Убедитесь, что файлы не в `.gitignore` и что вы закоммитили папку `icons/`.
- Если используете HTTPS remote, замените SSH URL на `https://github.com/YOUR_USERNAME/ai-bullshit-bingo.git`.
- Если хотите, могу подготовить репозиторий и дать точные команды под ваш `USERNAME` и `REPO` (но для этого мне нужны ваши реквизиты или вы выполните команды сами).

Готов помочь дальше: автоматически создать `gh-pages` ветку, настроить CI или добавить badge'ы в README.
