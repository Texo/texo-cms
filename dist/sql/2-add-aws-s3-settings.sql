CREATE TABLE IF NOT EXISTS awssettings (
	id INT PRIMARY KEY,
	accessKeyId VARCHAR(50),
	secretAccessKey VARCHAR(50),
	s3Bucket VARCHAR(100)
) ENGINE=MyISAM;

INSERT IGNORE INTO awssettings (accessKeyId, secretAccessKey, s3Bucket) VALUES ('', '', '');

