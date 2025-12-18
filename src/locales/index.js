const es = require('./es');
const en = require('./en');

const locales = {
  es,
  en,
  español: es,
  english: en,
};

function getText(lang, key, replacements = {}) {
  const locale = locales[lang.toLowerCase()] || locales.es;
  let text = locale[key] || key;

  // Replace placeholders with values
  Object.keys(replacements).forEach(placeholder => {
    text = text.replace(new RegExp(`{{${placeholder}}}`, 'g'), replacements[placeholder]);
  });

  return text;
}

module.exports = {
  locales,
  getText,
};
