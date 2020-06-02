const route = require('express-promise-router')();
const SpellChecker = require('simple-spellchecker');
const autocorrect = require('autocorrect')();

const { formatText } = require('../util/formatter');
const { getChatText, getRandomChatText } = require('../db/chat');

const spellCheck = (word) => new Promise((resolve, reject) => {
  SpellChecker.getDictionary('en-US', (err, dictionary) => {
    if (!err) {
      const misspelled = dictionary.isMisspelled(word);
      if (misspelled) {
        reject(new Error('misspelled'));
      } else {
        resolve(word);
      }
    } else {
      reject(err);
    }
  });
});

const generateRandomMessage = async () => {
  const textUnformattedQuery = await getRandomChatText();
  return formatText(textUnformattedQuery);
};

const charLimit = 250;

const sendRandomMessage = async (res) => {
  const message = await generateRandomMessage();
  if (message) {
    return res.status(200).send({ message, random: true });
  }
  return res.send(400).send({ error: 'Could not generate random response.' });
};

route.get('/', async (req, res) => {
  const { query } = req;
  if (!query || !query.text) {
    return sendRandomMessage(res);
  }

  const { text: rawText, limit } = query;

  const text = (rawText.length > charLimit) ? rawText.substring(0, 250).split(' ').slice(0, -1).join(' ') : rawText;

  // first attempt
  let response = await getChatText(text, limit);
  let comment = formatText(response);

  // second attempt, autocorrect everything we can
  if (!comment || comment.length <= 0) {
    const args = text.split(' ');
    const autoCorrectedText = args.map((a) => autocorrect(a.toLowerCase()));
    response = await getChatText(autoCorrectedText.join(' '), limit);
    comment = formatText(response);

    // third attempt, keep the autocorrect, but remove anything that seems weird
    if (!comment || comment.length <= 0) {
      const promises = autoCorrectedText.map((p) => spellCheck(p));
      // eslint-disable-next-line arrow-parens
      const prom = await Promise.all(promises.map((p => p.catch(e => e))).filter(p => p != null));
      response = await getChatText(prom.join(' '), limit);
      comment = formatText(response);

      // final attempt, remove half of the end.
      if (!comment || comment.length <= 0) {
        response = await getChatText(prom.slice(0, Math.ceil(prom.length / 2)), limit);
        comment = formatText(response);
      }
    }
  }

  // finally send a random message, if we couldn't find one.
  if (!comment || comment.length <= 0) {
    return sendRandomMessage(res);
  }

  return res.status(200).send({ message: comment, random: false });
});

module.exports = route;
