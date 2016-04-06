# Solid Pastebin Tutorial
[![](https://img.shields.io/badge/project-Solid-7C4DFF.svg?style=flat-square)](https://github.com/solid/solid)

Example application used in the
[Solid intro tutorial](https://github.com/solid/solid-tutorial-intro).

# Setup

**Step 1:** Have a container URL ready, where you'll be writing the
pastebins. (Either create an account on a Solid server, or use the URL provided
by your tutorial instructor.) This will look something like:
`https://username.databox.me/Public/bins/`

**Step 2:** Locate the following line, near the top of
[`app/app.js`](app/app.js):

```js
   var defaultContainer = '';
```

Change the empty string to the URL of teh container you want to use.

**Step 3:** Open `index.html` in your web browser.
