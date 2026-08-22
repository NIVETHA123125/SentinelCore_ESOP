TRUNCATE TABLE user_roles, users, roles RESTART IDENTITY CASCADE;

INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN'), (2, 'ROLE_OPERATOR'), (3, 'ROLE_VIEWER') ON CONFLICT DO NOTHING;

-- admin / admin123 (ROLE_ADMIN)
INSERT INTO users (username, password, enabled) 
VALUES ('admin', '$2a$10$v5cFS3eZ57hSehzzLkRCj.Wup7OrYt6B3ssJcQ3e8jWU0t11zQMxC', true);

-- viewer / viewer123 (ROLE_VIEWER)
INSERT INTO users (username, password, enabled) 
VALUES ('viewer', '$2a$10$4C2.OOhmi3K/QhDzvUOz/Oq4BLQ.NJNv.m2eZ95et5LJ2z/roHsx6', true);

-- operator / operator123 (ROLE_OPERATOR)
INSERT INTO users (username, password, enabled) 
VALUES ('operator', '$2a$10$H8kWWBwUPPstXmAAp2CgsOHCgxS6C.b5KbHSnD1MWOZmJlpZishs2', true);

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);  -- admin  -> ROLE_ADMIN
INSERT INTO user_roles (user_id, role_id) VALUES (2, 3);  -- viewer  -> ROLE_VIEWER
INSERT INTO user_roles (user_id, role_id) VALUES (3, 2);  -- operator -> ROLE_OPERATOR
