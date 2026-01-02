alter table "public"."articles" add constraint "articles_author_id_fkey" foreign key (author_id) references "public"."profiles"(id) on delete cascade;

alter table "public"."discussions" add constraint "discussions_author_id_fkey" foreign key (author_id) references "public"."profiles"(id) on delete cascade;
