const route = require('express-promise-router')();
const SpellChecker = require('simple-spellchecker');
const autocorrect = require('autocorrect')();

const { formatText } = require('../util/formatter');
const { getChatText, getRandomChatText } = require('../db/chat');

const charLimit = 250;

const dictionary = SpellChecker.getDictionarySync('en-US');

const spellCheck = (word) => new Promise((resolve, reject) => {
  const misspelled = dictionary.isMisspelled(word);
  if (misspelled) {
    reject(new Error('misspelled'));
  } else {
    resolve(word);
  }
});

const generateRandomMessage = async () => {
  const textUnformattedQuery = await getRandomChatText();
  return formatText(textUnformattedQuery);
};

const sendRandomMessage = async (res) => {
  const message = await generateRandomMessage();
  if (message) return res.status(200).send({ message, random: true });
  return res.send(400).send({ error: 'Could not generate random response.' });
};

route.get('/', async (req, res) => {
  const { query } = req;
  if (!query || !query.text) {
    return sendRandomMessage(res);
  }

  const { text: rawText, limit } = query;
  const maxLimit = (!limit || isNaN(limit) || limit <= 0 || limit > 20) ? 20 : 1;

  const text = (rawText.length > charLimit) ? rawText.substring(0, 250).split(' ').slice(0, -1).join(' ') : rawText;

  // first attempt
  const firstResponse = await getChatText(text, maxLimit);
  const firstComment = formatText(firstResponse);

  if (firstComment && firstComment.length > 0) {
    return res.status(200).send({ message: firstComment, random: false });
  }

  // second attempt, autocorrect everything we can
  const args = text.split(' ');
  const autoCorrectedText = args.map((a) => autocorrect(a.toLowerCase()));
  const secondResponse = await getChatText(autoCorrectedText.join(' '), maxLimit);
  const secondCommentAutocorrect = formatText(secondResponse);
  if (secondCommentAutocorrect && secondCommentAutocorrect.length > 0) {
    return res.status(200).send({ message: secondCommentAutocorrect, random: false });
  }

  // third attempt, keep the autocorrect, but remove anything that seems weird
  const promises = autoCorrectedText.map((p) => spellCheck(p));
  // eslint-disable-next-line arrow-parens
  const wordArray = await Promise.all(promises.map((p => p.catch(e => e))).filter(p => p != null));


  const thirdResponse = await getChatText(wordArray.join(' '), maxLimit);
  const thirdCommentAutocorrectRemoval = formatText(thirdResponse);
  if (thirdCommentAutocorrectRemoval && thirdCommentAutocorrectRemoval.length > 0) {
    return res.status(200).send({ message: thirdCommentAutocorrectRemoval, random: false });
  }

  // remove half of the end.
  const removeHalfAttempt = await getChatText(wordArray.slice(0, Math.ceil(wordArray.length / 2)), maxLimit);
  const removeHalfComment = formatText(removeHalfAttempt);
  if (removeHalfComment && removeHalfComment.length > 0) {
    return res.status(200).send({ message: removeHalfComment, random: false });
  }

  // longest word final attempt
  const longestWord = wordArray.reduce((prev, current) => prev.length > current.length ? prev : current);
  const longestWordAttempt = await getChatText(longestWord, maxLimit);
  const longestWordComment = formatText(longestWordAttempt);
  if (longestWordComment && longestWordComment.length > 0) {
    return res.status(200).send({ message: longestWordComment, random: false });
  }

  // finally send a random message, if we couldn't find one.
  return sendRandomMessage(res);
});

module.exports = route;
