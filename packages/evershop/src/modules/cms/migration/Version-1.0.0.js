const { execute } = require('@evershop/mysql-query-builder');

// eslint-disable-next-line no-multi-assign
module.exports = exports = async (connection) => {
  await execute(
    connection,
    `CREATE TABLE \`cms_page\` (
  \`cms_page_id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`uuid\` varchar(255) DEFAULT (replace(uuid(),'-','')),
  \`layout\` varchar(255) NOT NULL,
  \`status\` smallint(6) DEFAULT NULL,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (\`cms_page_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Cms page';
`
  );

  await execute(
    connection,
    `CREATE TABLE \`cms_page_description\` (
  \`cms_page_description_id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`cms_page_description_cms_page_id\` int(10) unsigned DEFAULT NULL,
  \`url_key\` varchar(255) NOT NULL,
  \`name\` text NOT NULL,
  \`content\` longtext DEFAULT NULL,
  \`meta_title\` varchar(255) DEFAULT NULL,
  \`meta_keywords\` varchar(255) DEFAULT NULL,
  \`meta_description\` text DEFAULT NULL,
  PRIMARY KEY (\`cms_page_description_id\`),
  UNIQUE KEY \`PAGE_ID_UNIQUE\` (\`cms_page_description_cms_page_id\`),
  CONSTRAINT \`FK_CMS_PAGE_DESCRIPTION\` FOREIGN KEY (\`cms_page_description_cms_page_id\`) REFERENCES \`cms_page\` (\`cms_page_id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Cms page description';
`
  );
};
