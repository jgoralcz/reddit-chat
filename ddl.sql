CREATE TABLE public.comments (
    parent_id text NOT NULL,
    comment_id text NOT NULL,
    comment character varying(256),
    subreddit_id text NOT NULL,
    created_utc bigint,
    score integer NOT NULL,
    tsv tsvector
);

    
CREATE INDEX idx_comment_id ON public.comments USING btree (comment_id);
CREATE INDEX idx_parent_id ON public.comments USING btree (parent_id);
CREATE INDEX idx_subreddit_id ON public.comments USING btree (subreddit_id);
CREATE INDEX tsv_idx ON public.comments USING gin (tsv);

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT subreddit_id_fk FOREIGN KEY (subreddit_id) REFERENCES public.subreddit(id) ON DELETE CASCADE;

CREATE TABLE public.subreddit (
    id text NOT NULL,
    name text
);

ALTER TABLE ONLY public.subreddit
    ADD CONSTRAINT subreddit_pk PRIMARY KEY (id);
