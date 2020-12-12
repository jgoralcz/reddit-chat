const { Pool } = require('pg');
const logger = require('log4js').getLogger();

const chatDB = require('../util/constants/paths');

const pool = new Pool(chatDB);

pool.on('error', (error) => {
  logger.error(error);
});

const poolQuery = async (query, paramsArray) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, paramsArray);
    if (!result || !result.rows || !result.rowCount || result.rows.length <= 0) return undefined;

    return result.rows;
  } catch (error) {
    logger.error(error);
  } finally {
    client.release();
  }
  return undefined;
};

const getChatText = async (text, limit) => poolQuery(`
  SELECT comment
  FROM (
    SELECT comment
    FROM comments c
    JOIN (
      SELECT comment_id, subreddit_id
      FROM comments
      WHERE tsv @@plainto_tsquery($1)
      LIMIT 1000
    ) as r
    ON r.comment_id = c.parent_id AND c.subreddit_id = r.subreddit_id
    ORDER BY ts_rank_cd(c.tsv, plainto_tsquery($1))
    DESC LIMIT 100
  ) t ORDER BY random()
  LIMIT $2;
`, [text, limit]);

const getRandomChatText = () => poolQuery(`
  SELECT comment
  FROM comments
  TABLESAMPLE SYSTEM((1000 * 100) / 1900000.0)
  LIMIT 1;
`, []);

module.exports = {
  getChatText,
  getRandomChatText,
};
