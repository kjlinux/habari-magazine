import * as mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONTHS: Record<string, number> = {
  janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12,
};

function parseFrDate(dateStr: string): string {
  const parts = dateStr.trim().split(" ");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = MONTHS[parts[1].toLowerCase()];
    const year = parseInt(parts[2], 10);
    if (day && month && year) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} 00:00:00`;
    }
  }
  // fallback: year only → Jan 1st
  const year = parseInt(parts[parts.length - 1], 10);
  return `${year}-01-01 00:00:00`;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const TYPE_MAP: Record<string, string> = {
  conference: "conference",
  networking: "networking",
  formation: "training",
  webinaire: "webinar",
};

const sampleEvents = [
  { title: "PME-Bright Forum — Douala 2026", type: "conference", date: "15 mars 2026", location: "Douala, Cameroun", desc: "Le rendez-vous annuel des PME de la zone CEEAC. Networking, ateliers et conférences." },
  { title: "Petit-déjeuner décideurs CEEAC", type: "networking", date: "22 avril 2026", location: "Libreville, Gabon", desc: "Rencontre exclusive entre décideurs économiques et institutionnels de la zone CEEAC." },
  { title: "Habari Awards — Édition inaugurale", type: "conference", date: "10 mai 2026", location: "Yaoundé, Cameroun", desc: "Cérémonie de remise des prix récompensant l'excellence entrepreneuriale en zone CEEAC." },
  { title: "Formation : Levée de fonds en Afrique", type: "formation", date: "5 juin 2026", location: "En ligne", desc: "Masterclass de 3 jours sur les stratégies de levée de fonds pour les startups africaines." },
  { title: "Webinaire : Réforme fiscale CEEAC", type: "webinaire", date: "18 mars 2026", location: "En ligne", desc: "Analyse des nouvelles dispositions fiscales et leur impact sur les entreprises de la zone." },
  { title: "Salon de l'Agriculture de la zone CEEAC", type: "conference", date: "20 juillet 2026", location: "Brazzaville, Congo", desc: "Exposition et conférences sur l'agro-industrie et la sécurité alimentaire régionale." },
  { title: "Angola Oil & Gas Summit 2026", type: "conference", date: "12 septembre 2026", location: "Luanda, Angola", desc: "Sommet international sur l'énergie et les hydrocarbures en Afrique Centrale. Investisseurs et opérateurs réunis." },
  { title: "DRC Mining Week", type: "conference", date: "8 octobre 2026", location: "Lubumbashi, RDC", desc: "Salon minier de référence en République démocratique du Congo. Cobalt, cuivre et minéraux stratégiques." },
  { title: "Kigali FinTech Summit", type: "conference", date: "25 juin 2026", location: "Kigali, Rwanda", desc: "Sommet dédié à l'innovation financière et à l'inclusion numérique en Afrique de l'Est et Centrale." },
  { title: "Forum café & cacao — Grands Lacs", type: "networking", date: "14 août 2026", location: "Bujumbura, Burundi", desc: "Rencontre entre producteurs, exportateurs et acheteurs internationaux de café et cacao." },
  { title: "PME-Bright Forum — N'Djamena 2026", type: "conference", date: "15 novembre 2026", location: "N'Djamena, Tchad", desc: "Forum dédié aux PME et à l'entrepreneuriat en zone CEEAC. Ateliers, pitchs et rencontres B2B pour accélérer la croissance des entreprises tchadiennes et régionales." },
  { title: "Cultur'Com — Ouagadougou 2026", type: "conference", date: "26 février 2026", location: "Ouagadougou, Burkina Faso", desc: "Rendez-vous des industries culturelles et créatives d'Afrique. Échanges sur la communication, les médias et la culture comme leviers de développement économique." },
  { title: "Petit-déjeuner décideurs CEEAC — Kinshasa", type: "networking", date: "2026", location: "Kinshasa, RDC", desc: "Rencontre exclusive entre décideurs économiques, institutionnels et investisseurs de la zone CEEAC. Échanges stratégiques sur les opportunités en République démocratique du Congo." },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing DATABASE_URL in .env");
    process.exit(1);
  }

  const conn = await mysql.createConnection(databaseUrl);
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const event of sampleEvents) {
    const slug = slugify(event.title);
    const dbType = TYPE_MAP[event.type] ?? "conference";
    const startDate = parseFrDate(event.date);

    try {
      const [rows] = await conn.execute<mysql.RowDataPacket[]>(
        "SELECT id FROM events WHERE slug = ?",
        [slug]
      );
      if (rows.length > 0) {
        console.log(`  SKIP (already exists): ${event.title}`);
        skipped++;
        continue;
      }

      await conn.execute(
        `INSERT INTO events (title, slug, description, type, startDate, location, status, isExclusive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 'upcoming', false, NOW(), NOW())`,
        [event.title, slug, event.desc, dbType, startDate, event.location]
      );
      console.log(`  OK: ${event.title}`);
      inserted++;
    } catch (err) {
      console.error(`  ERROR: ${event.title} — ${(err as Error).message}`);
      errors++;
    }
  }

  await conn.end();
  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped, ${errors} errors`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
