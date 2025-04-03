INSERT INTO Users (username, email, pw, created_at)
VALUES (
  'hunorko',
  'huko2764@colorado.edu',
  -- crypt('securepassword', gen_salt('bf')),
  'huko2764',
  CURRENT_TIMESTAMP
);