import mysql from "mysql2/promise";

const conn = await mysql.createConnection("mysql://habari_user:xjXerkV8Su@localhost:3306/habari_db");

await conn.execute(`INSERT IGNORE INTO \`countries\` (\`code\`, \`name\`, \`flag\`) VALUES
('AO','Angola','🇦🇴'),('BI','Burundi','🇧🇮'),('CM','Cameroun','🇨🇲'),
('CG','Congo (Brazzaville)','🇨🇬'),('GA','Gabon','🇬🇦'),('GQ','Guinée Équatoriale','🇬🇶'),
('CF','RCA (Centrafrique)','🇨🇫'),('CD','RDC (Congo-Kinshasa)','🇨🇩'),
('RW','Rwanda','🇷🇼'),('ST','São Tomé-et-Príncipe','🇸🇹'),('TD','Tchad','🇹🇩'),
('AF','Autre pays africain','🌍'),('EU','Europe','🌍'),('AM','Amérique','🌎'),
('AS','Asie','🌏'),('OT','Autre','🌐')`);
console.log("✓ countries seeded");

await conn.execute(`INSERT IGNORE INTO \`articleCategories\` (\`name\`, \`slug\`) VALUES
('Politique','politique'),('Économie','economie'),('Business','business'),
('Investissements','investissements'),('Société','societe'),('Culture','culture'),
('Sport','sport'),('Technologie','technologie'),('Environnement','environnement'),
('Santé','sante'),('Éducation','education'),('Diplomatie','diplomatie'),
('Sécurité','securite'),('Énergie','energie'),('Agriculture','agriculture'),
('Mines & Ressources','mines-ressources'),('Transport & Infrastructures','transport-infrastructures'),
('International','international'),('Opinion','opinion'),('Interview','interview')`);
console.log("✓ articleCategories seeded");

await conn.end();
