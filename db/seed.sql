insert into communities (slug,name,description,community_type,department) values
('casino-gaming','Casino & Gaming','Table games, slots, casino operations, training and leadership.','department','Casino'),
('hotel-operations','Hotel Operations','Guest services, housekeeping, food and beverage, hotel leadership.','department','Hotel'),
('deck-marine','Deck & Marine','Navigation, deck operations, safety and marine leadership.','department','Deck'),
('engine-technical','Engine & Technical','Engineering, electrical, technical operations and maintenance.','department','Engine')
on conflict (slug) do nothing;
