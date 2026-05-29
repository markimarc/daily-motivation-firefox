let settingsGear = document.getElementsByClassName('settings')[0];
let closeButton = document.getElementsByClassName('close')[0];
let connectedThemeOption = document.getElementById('connected');
let connectedBlueThemeOption = document.getElementById('connectedBlue');
let clearThemeOption = document.getElementById('clear');
let connectedDarkBlueThemeOption = document.getElementById('connectedDarkBlue');
let connectedDarkThemeOption = document.getElementById('connectedDark');
let clearDarkThemeOption = document.getElementById('clearDark');

const FALLBACK_QUOTE = { quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain' };

async function newQuote() {
  try {
    const response = await fetch('./src/data/quotes.json');
    const quotes = await response.json();
    const randomNumber = Math.round(Math.random() * (quotes.length - 1));
    setQuote(quotes[randomNumber].quote, quotes[randomNumber].author);
  } catch (e) {
    setQuote(FALLBACK_QUOTE.quote, FALLBACK_QUOTE.author);
  }
}

function setQuote(quote, author) {
  document.getElementById('quote').textContent = quote;
  document.getElementById('author').textContent = author;
}

let applyTheme = () => {
  let theme = localStorage.getItem('theme');

  if (theme === 'clear') {
    settingGearColorInvert(false);
    clear();
  } else if (theme === 'connected' || !theme) {
    if (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      settingGearColorInvert(true);
      canvasDots('#fff', '#000', '#fff');
    } else {
      settingGearColorInvert(false);
      canvasDots();
    }
  } else if (theme === 'connectedBlue') {
    settingGearColorInvert(true);
    canvasDots('#fff', '#2196F3', '#fff');
  } else if (theme === 'connectedDarkBlue') {
    settingGearColorInvert(true);
    canvasDots('#5cdb95', '#05386b', '#edf5e1');
  } else if (theme === 'connectedDark') {
    settingGearColorInvert(true);
    canvasDots('#fff', '#000', '#fff');
  } else if (theme === 'clearDark') {
    settingGearColorInvert(true);
    clear('#fff', '#000');
  }
};

let setTheme = function (theme) {
  localStorage.setItem('theme', theme);
  clear();
  applyTheme();
};

document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  newQuote();
});

/* EVENT LISTENERS */
settingsGear.addEventListener('click', () => {
  openNav();
});

closeButton.addEventListener('click', () => {
  closeNav();
});

connectedThemeOption.addEventListener('click', () => {
  setTheme('connected');
  closeNav();
});

connectedBlueThemeOption.addEventListener('click', () => {
  setTheme('connectedBlue');
  closeNav();
});

connectedDarkBlueThemeOption.addEventListener('click', () => {
  setTheme('connectedDarkBlue');
  closeNav();
});

connectedDarkThemeOption.addEventListener('click', () => {
  setTheme('connectedDark');
  closeNav();
});

clearThemeOption.addEventListener('click', () => {
  setTheme('clear');
  closeNav();
});

clearDarkThemeOption.addEventListener('click', () => {
  setTheme('clearDark');
  closeNav();
});

function settingGearColorInvert(invert) {
  if (invert) {
    let style = document.createElement('style');
    style.id = 'style';
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);
    style.sheet.insertRule("img.settings { filter: invert(100%); }");
  } else {
    let styleElement = document.getElementById('style');
    if (styleElement) {
      document.head.removeChild(styleElement);
    }
  }
}