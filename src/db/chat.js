const { Pool } = require('pg');
const { chatDB } = require('../util/constants/paths');
const nconf = require('nconf').file('chatDB', chatDB);

const chat_db = nconf.get('chat_db');

const pool = new Pool(chat_db);

/**
 * pool query function
 * @param {string} query the query to use against
 * @param {array<string>} paramsArray the array of arguments to use against the query.
 * @returns {Promise<*>} a resolved query.
 */
const poolQuery = async (query, paramsArray) => {
  const client = await pool.connect();
  try {
    return await client.query(query, paramsArray);
  } finally {
    client.release();
  }
};

/**
 * gets the text that's closely matched in our database.
 * @param {string} text the user's text to search against in our database.
 * @param {BigInteger} limit the limit out of 20
 * @returns {Promise<*>} the response based off their text.
 */
const getChatText = async (text, limit) => {
  if (!limit || isNaN(limit) || limit <= 0 || limit > 20) limit = 1;
  return poolQuery(`
    SELECT comment
    FROM (
      SELECT comment
      FROM comments c
      JOIN (
        SELECT comment_id, subreddit_id
        FROM comments
        WHERE tsv @@plainto_tsquery($1)
        LIMIT 300
      ) as r
      ON r.comment_id = c.parent_id AND c.subreddit_id = r.subreddit_id
      ORDER BY ts_rank_cd(c.tsv, plainto_tsquery($1))
      DESC LIMIT 20
    ) t ORDER BY random()
    LIMIT $2;
  `, [text, limit]);
};

const getRandomChatText = async () => poolQuery(`
  SELECT comment
  FROM comments
  TABLESAMPLE SYSTEM((1000 * 100) / 1900000.0)
  LIMIT 1;
`, []);

module.exports = {
  getChatText,
  getRandomChatText,
};
