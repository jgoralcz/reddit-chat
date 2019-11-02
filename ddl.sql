CREATE TABLE IF NOT EXISTS comments (
  parent_id text NOT NULL,
  comment_id text NOT NULL,
  comment varchar(256) NOT NULL,
  subreddit text NOT NULL,
  subreddit_id text NOT NULL,
  created_utc bigint NOT NULL,
  controversiality bigint NOT NULL,
  score bigint NOT NULL,
  id text NOT NULL,
  tsv tsvector NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comment_id ON comments(comment_id);
CREATE INDEX IF NOT EXISTS idx_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_subreddit_id ON comments(subreddit_id);
CREATE INDEX IF NOT EXISTS tsv_idx ON comments USING gin(tsv);

-- insert your data then generate the tsv, create a trigger if you plan on adding more data.
-- for more info check out: 
-- https://blog.lateral.io/2015/05/full-text-search-in-milliseconds-with-postgresql/
