-- Set password "111111" for Q&A answers
INSERT INTO admin_passwords (action, password_hash)
VALUES ('qa_answers', '111111')
ON CONFLICT (action) 
DO UPDATE SET password_hash = '111111';