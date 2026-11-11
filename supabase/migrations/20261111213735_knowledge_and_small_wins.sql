alter table public.daily_checkins
 add column if not exists studied boolean not null default false,
 add column if not exists learning_note text not null default '' check(char_length(learning_note)<=4000),
 add column if not exists one_percent text not null default '' check(char_length(one_percent)<=500),
 add column if not exists one_percent_done boolean not null default false;
