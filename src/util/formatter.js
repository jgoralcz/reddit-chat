const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();

/**
 * properly normalized and formats the text.
 * @param {string} text the text to format
 * @returns {[string]} array of string text that has html codes transferred.
 */
const formatText = (responses) => {
  if (responses && responses.rows) {
    return responses.rows.map((response) => entities.decode(response.comment));
  }
  return [];
};

module.exports = {
  formatText,
};
