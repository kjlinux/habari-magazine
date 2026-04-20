/**
 * seed-content.ts
 * Migrates all hardcoded data from the source project into the database.
 * Run: npx tsx drizzle/seed-content.ts
 *
 * Phases:
 *  1. Download CDN images → public/uploads/
 *  2. Upsert categories + countries + author
 *  3. Insert 15 articles with full HTML content
 *  4. Insert 24 opportunities (11 bids + 7 AMI + 6 jobs)
 *  5. Insert 11 economic actors
 *  6. Insert economic indicators (carbon metrics)
 */

import * as dotenv from "dotenv";
dotenv.config();

import https from "https";
import http from "http";
import path from "path";
import fs from "fs";
import { getDb } from "../server/db";
import { storagePut } from "../server/storage";
import {
  articleCategories,
  countries,
  authors,
  articles,
  economicActors,
  opportunities,
  economicIndicators,
} from "./schema";
import { eq, and } from "drizzle-orm";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[seed] ${msg}`);
}

function fetchBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    proto.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuffer(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (!res.statusCode || res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve({
        buffer: Buffer.concat(chunks),
        contentType: (res.headers["content-type"] || "image/jpeg").split(";")[0],
      }));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function downloadAndStore(url: string, key: string): Promise<string> {
  try {
    const { buffer, contentType } = await fetchBuffer(url);
    const result = await storagePut(key, buffer, contentType);
    log(`  ✓ Downloaded → ${result.url}`);
    return result.url;
  } catch (err) {
    log(`  ✗ Failed to download ${url}: ${(err as Error).message}`);
    return url; // fall back to CDN URL if download fails
  }
}

// ─── Image map ────────────────────────────────────────────────────────────────

const BASE_MANUSN = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/";
const BASE_CF = "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/";

const IMAGE_DOWNLOADS: { url: string; key: string; localVar: string }[] = [
  { url: BASE_MANUSN + "cKOkqXwvCEGzMsUQ.jpg", key: "articles/cemac.jpg", localVar: "cemac" },
  { url: BASE_MANUSN + "ufPCeWOQxrZNjANy.jpg", key: "articles/gabon.jpg", localVar: "gabon" },
  { url: BASE_MANUSN + "bouvLYpOwMPwrZVh.jpg", key: "articles/ceeac-vert.jpg", localVar: "ceeacVert" },
  { url: BASE_MANUSN + "HdYjDeXbHfdvYVDK.jpg", key: "articles/business.jpg", localVar: "business" },
  { url: BASE_MANUSN + "OddcsXlrdntxupnS.jpg", key: "articles/culture-concert.jpg", localVar: "cultureConcert" },
  { url: BASE_MANUSN + "MsiRkJOHcDfupLNH.jpg", key: "articles/culture-portrait.jpg", localVar: "culturePortrait" },
  { url: BASE_MANUSN + "nlkVQeeaJhCivjDJ.jpg", key: "articles/eco-verte.jpg", localVar: "ecoVerte" },
  { url: BASE_MANUSN + "PCoXzDyWdHwRLfKw.jpg", key: "articles/eco-verte2.jpg", localVar: "ecoVerte2" },
  { url: BASE_MANUSN + "oTOnqHICldnZxqIH.jpg", key: "articles/emplois-verts.jpg", localVar: "emploisVerts" },
  { url: BASE_MANUSN + "QiTAGzgXqbChMWfS.jpg", key: "articles/emplois-verts2.jpg", localVar: "emploisVerts2" },
  { url: BASE_MANUSN + "kSvSfdRauRkMtfaJ.jpg", key: "articles/gweth1.jpg", localVar: "gweth1" },
  { url: BASE_MANUSN + "oPJqfcvEEYEtTaYB.jpg", key: "articles/gweth2.jpg", localVar: "gweth2" },
  { url: BASE_MANUSN + "xHsIsQQBVYADZfbj.jpg", key: "articles/hero.jpg", localVar: "hero" },
  { url: BASE_MANUSN + "kJAxGRcqiWlstGKH.webp", key: "green/hero.webp", localVar: "greenHero" },
  { url: BASE_MANUSN + "IaSyzHrryzjyeroU.png", key: "green/carbone.png", localVar: "greenCarbone" },
  { url: BASE_MANUSN + "QSExSDsQzqvwSUqS.webp", key: "green/energie.webp", localVar: "greenEnergie" },
  { url: BASE_MANUSN + "rjQKChcjogvooorf.jpg", key: "green/finance.jpg", localVar: "greenFinance" },
  { url: BASE_MANUSN + "ZKFPmfVfXoybwtyy.jpg", key: "green/solaire.jpg", localVar: "greenSolaire" },
  { url: BASE_CF + "mackosso1_cropped_3c196986.jpg", key: "articles/mackosso1.jpg", localVar: "mackosso1" },
  { url: BASE_CF + "mackosso2_cropped_b4430dc8.jpg", key: "articles/mackosso2.jpg", localVar: "mackosso2" },
  { url: BASE_CF + "nhhpqOsQjMrA_e4729627.jpg", key: "articles/cobalt-mine.jpg", localVar: "cobaltMine" },
  { url: BASE_CF + "DnMwsHIdHFCF_b7dc1960.jpg", key: "articles/cobalt-ore.jpg", localVar: "cobaltOre" },
  { url: BASE_CF + "GQwuI2Igxrdy_a1957686.jpg", key: "articles/villes-afrique.jpg", localVar: "villesAfrique" },
  { url: BASE_CF + "Mt48hpMTzr03_338528cd.jpg", key: "articles/brt-dakar.jpg", localVar: "brtDakar" },
  { url: BASE_CF + "EdN7l9Al3W9c_024d36f8.jpg", key: "articles/ville-durable.jpg", localVar: "villeDurable" },
  { url: BASE_CF + "q66ZJPQU1SQY_02c30c67.jpg", key: "articles/femmes-awief.jpg", localVar: "femmesAwief" },
  { url: BASE_CF + "wB2pF3dEwqRN_76c911c0.jpg", key: "articles/femmes-rdc.jpg", localVar: "femmesRdc" },
  { url: BASE_CF + "LjH0VpBKRnda_20c1a7e4.jpg", key: "articles/femmes-tech.jpg", localVar: "femmesTech" },
  { url: BASE_CF + "qIZrLdK4gbPn_90cf748f.jpg", key: "articles/mobile-money1.jpg", localVar: "mobileMoney1" },
  { url: BASE_CF + "8E7QdTTH6CYT_9ec63b67.jpg", key: "articles/mobile-money2.jpg", localVar: "mobileMoney2" },
  { url: BASE_CF + "heX7F3ftGB56_b9706261.jpg", key: "articles/mobile-money3.jpg", localVar: "mobileMoney3" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log("=== Habari Magazine — Seed Content ===");
  const db = await getDb();
  if (!db) throw new Error("Database not available. Check DATABASE_URL.");

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 1: Download images
  // ──────────────────────────────────────────────────────────────────────────
  log("\n📥 Phase 1: Downloading images...");
  const IMG: Record<string, string> = {};

  for (const { url, key, localVar } of IMAGE_DOWNLOADS) {
    log(`  Downloading ${key}...`);
    IMG[localVar] = await downloadAndStore(url, key);
  }

  log(`  ✓ ${Object.keys(IMG).length} images processed`);

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 2: Categories (upsert)
  // ──────────────────────────────────────────────────────────────────────────
  log("\n📂 Phase 2: Upserting categories...");

  const categoryData = [
    { name: "Dossier Central", slug: "dossier-central", description: "Dossiers approfondis sur les enjeux économiques de la CEMAC/CEEAC" },
    { name: "Enquête", slug: "enquete", description: "Enquêtes journalistiques sur l'économie d'Afrique centrale" },
    { name: "Dossier Stratégique", slug: "dossier-strategique", description: "Analyses stratégiques régionales" },
    { name: "La Grande Interview", slug: "grande-interview", description: "Interviews exclusives de personnalités économiques" },
    { name: "Interview", slug: "interview", description: "Interviews et portraits" },
    { name: "Culture & Société", slug: "culture-societe", description: "Culture, société et mode de vie en Afrique centrale" },
    { name: "Analyse Pays", slug: "analyse-pays", description: "Analyses économiques par pays de la zone CEEAC" },
    { name: "Tribune", slug: "tribune", description: "Tribunes et contributions d'experts" },
    { name: "Éditorial", slug: "editorial", description: "Éditoriaux de la rédaction" },
    { name: "Habari Green", slug: "habari-green", description: "Économie verte et développement durable en Afrique centrale" },
    { name: "Business & Innovation", slug: "business-innovation", description: "Entrepreneuriat, innovation et PME" },
  ];

  const catMap: Record<string, number> = {};

  for (const cat of categoryData) {
    const existing = await db.select().from(articleCategories).where(eq(articleCategories.slug, cat.slug)).limit(1);
    if (existing.length > 0) {
      catMap[cat.name] = existing[0].id;
      catMap[cat.slug] = existing[0].id;
      log(`  ✓ Category exists: ${cat.name} (id=${existing[0].id})`);
    } else {
      const [res] = await db.insert(articleCategories).values(cat);
      const id = (res as any).insertId;
      catMap[cat.name] = id;
      catMap[cat.slug] = id;
      log(`  + Created category: ${cat.name} (id=${id})`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 3: Countries (upsert)
  // ──────────────────────────────────────────────────────────────────────────
  log("\n🌍 Phase 3: Upserting countries...");

  const countryData = [
    { code: "CM", name: "Cameroun", flag: "🇨🇲" },
    { code: "GA", name: "Gabon", flag: "🇬🇦" },
    { code: "CG", name: "Congo", flag: "🇨🇬" },
    { code: "CD", name: "RDC", flag: "🇨🇩" },
    { code: "TD", name: "Tchad", flag: "🇹🇩" },
    { code: "AO", name: "Angola", flag: "🇦🇴" },
    { code: "RW", name: "Rwanda", flag: "🇷🇼" },
    { code: "BI", name: "Burundi", flag: "🇧🇮" },
    { code: "ST", name: "São Tomé-et-Príncipe", flag: "🇸🇹" },
    { code: "GQ", name: "Guinée Équatoriale", flag: "🇬🇶" },
    { code: "CF", name: "RCA", flag: "🇨🇫" },
    { code: "NG", name: "Niger", flag: "🇳🇪" },
    { code: "AF", name: "Afrique", flag: "🌍" },
    { code: "XC", name: "CEEAC", flag: "🌍" },
    { code: "XM", name: "CEMAC", flag: "🌍" },
  ];

  const countryMap: Record<string, number> = {};

  for (const c of countryData) {
    const existing = await db.select().from(countries).where(eq(countries.code, c.code)).limit(1);
    if (existing.length > 0) {
      countryMap[c.name] = existing[0].id;
      countryMap[c.code] = existing[0].id;
      log(`  ✓ Country exists: ${c.name} (id=${existing[0].id})`);
    } else {
      const [res] = await db.insert(countries).values(c);
      const id = (res as any).insertId;
      countryMap[c.name] = id;
      countryMap[c.code] = id;
      log(`  + Created country: ${c.name} (id=${id})`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 4: Default author
  // ──────────────────────────────────────────────────────────────────────────
  log("\n✍️  Phase 4: Creating default author...");

  let authorId: number;
  const existingAuthor = await db.select().from(authors).where(eq(authors.name, "La Rédaction Habari")).limit(1);

  if (existingAuthor.length > 0) {
    authorId = existingAuthor[0].id;
    log(`  ✓ Author exists: La Rédaction Habari (id=${authorId})`);
  } else {
    const [res] = await db.insert(authors).values({
      name: "La Rédaction Habari",
      email: "redaction@habari-magazine.com",
      bio: "L'équipe éditoriale d'Habari Magazine, décryptant l'économie de la zone CEEAC.",
      specialization: "Économie, Finance, Politique",
    });
    authorId = (res as any).insertId;
    log(`  + Created author: La Rédaction Habari (id=${authorId})`);
  }

  let briceMbaId: number;
  const existingBrice = await db.select().from(authors).where(eq(authors.name, "Brice MBA")).limit(1);
  if (existingBrice.length > 0) {
    briceMbaId = existingBrice[0].id;
    log(`  ✓ Author exists: Brice MBA (id=${briceMbaId})`);
  } else {
    const [res] = await db.insert(authors).values({
      name: "Brice MBA",
      specialization: "Culture, Société, Arts",
    });
    briceMbaId = (res as any).insertId;
    log(`  + Created author: Brice MBA (id=${briceMbaId})`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 5: Articles
  // ──────────────────────────────────────────────────────────────────────────
  log("\n📰 Phase 5: Inserting articles...");

  const articlesToInsert = [
    {
      slug: "cemac-panne-seche",
      title: "Panne sèche à la CEMAC — Crise financière et ajustements budgétaires",
      excerpt: "La CEMAC traverse une crise existentielle. Suspension des activités de la Commission, arriérés de contributions, dette souveraine hors de contrôle.",
      authorId,
      categoryName: "Dossier Central",
      countryName: "CEMAC",
      access: "free" as const,
      image: IMG.cemac,
      content: `
<h2>Une Commission à l'arrêt</h2>
<p>La Commission de la CEMAC a suspendu ses activités faute de financement. Les arriérés de contributions des États membres ont atteint des niveaux critiques, paralysant le fonctionnement de l'institution. Cette situation inédite révèle la fragilité du modèle de financement communautaire, entièrement dépendant de la bonne volonté budgétaire des États.</p>
<p>Le Cameroun, premier contributeur, accumule lui-même des retards significatifs. Le Gabon, en pleine transition politique, a d'autres priorités budgétaires. Le Tchad consacre l'essentiel de ses ressources à la sécurité. Résultat : la machine institutionnelle tourne au ralenti.</p>

<h2>La dette souveraine, épée de Damoclès</h2>
<p>Le ratio dette/PIB moyen de la zone CEMAC dépasse désormais les 50 %, bien au-delà du critère de convergence fixé à 70 % par la BEAC. Mais ce chiffre masque des disparités considérables. Le Congo-Brazzaville affiche un ratio supérieur à 100 %, tandis que le Cameroun se maintient autour de 45 %.</p>
<p>La structure de la dette a également évolué. La part de la dette commerciale et des eurobonds a augmenté, renchérissant le coût du service de la dette. Les marges de manœuvre budgétaires se réduisent, contraignant les États à des arbitrages douloureux entre investissement public et remboursement.</p>

<h2>Le piège de la dépendance pétrolière</h2>
<p>Quatre des six pays de la CEMAC sont des producteurs de pétrole. Cette dépendance aux hydrocarbures, qui représentent encore plus de 60 % des recettes d'exportation de la zone, expose les économies aux chocs de prix. La transition énergétique mondiale ajoute une dimension structurelle à cette vulnérabilité.</p>
<p>Les tentatives de diversification restent timides. Le Cameroun a développé un tissu industriel plus diversifié, mais les autres économies peinent à sortir du modèle rentier. L'agriculture, qui emploie la majorité de la population, reste sous-investie et peu productive.</p>

<h2>La BEAC face à ses contradictions</h2>
<p>La Banque des États de l'Afrique Centrale (BEAC) joue un rôle central dans la stabilité macroéconomique de la zone. Mais elle fait face à un dilemme : maintenir la parité fixe du franc CFA avec l'euro tout en soutenant des économies en difficulté. Les réserves de change, bien qu'en amélioration, restent sous surveillance.</p>
<p>Le taux directeur, relevé pour contenir l'inflation, pénalise l'accès au crédit pour les entreprises et les ménages. Le financement de l'économie réelle reste le maillon faible du système financier de la CEMAC.</p>

<h2>Quels leviers de relance ?</h2>
<p>Plusieurs pistes se dessinent pour sortir de l'impasse. La réforme du financement communautaire, avec l'introduction de ressources propres (prélèvement communautaire, taxe sur les transactions financières), permettrait de pérenniser le fonctionnement des institutions.</p>
<p>L'accélération de l'intégration commerciale, avec la mise en œuvre effective du tarif préférentiel généralisé et la suppression des barrières non tarifaires, pourrait dynamiser le commerce intra-zone, aujourd'hui inférieur à 5 % du commerce total. Enfin, la mobilisation de la finance verte et des crédits carbone, compte tenu du capital forestier considérable de la zone, constitue une opportunité encore largement inexploitée.</p>
`,
    },
    {
      slug: "gabon-oligui-mur-argent",
      title: "Gabon — Oligui Nguema face au mur de l'argent : la renaissance à crédit",
      excerpt: "Le Gabon affiche une ambition économique tous azimuts. Mais derrière la volonté politique se cache une équation plus dure.",
      authorId,
      categoryName: "Enquête",
      countryName: "Gabon",
      access: "free" as const,
      image: IMG.gabon,
      content: `
<h2>L'ambition de la « renaissance »</h2>
<p>Depuis la transition d'août 2023, le général Brice Clotaire Oligui Nguema a lancé un vaste programme de transformation économique. Routes, hôpitaux, logements sociaux, zones économiques spéciales : les annonces se succèdent à un rythme soutenu. Le Plan national de développement de la transition (PNDT) ambitionne de diversifier l'économie et de réduire la dépendance au pétrole.</p>
<p>Cette volonté de rupture avec l'ère Bongo se traduit par des investissements massifs dans les infrastructures. Le budget d'investissement a été significativement augmenté, avec une priorité donnée aux projets à fort impact social : eau potable, électrification rurale, désenclavement routier.</p>

<h2>Le mur de l'argent</h2>
<p>Mais la question du financement se pose avec acuité. Le Gabon, malgré un PIB par habitant relativement élevé pour la sous-région, dispose de marges budgétaires limitées. La dette publique avoisine les 55 % du PIB, et le service de la dette absorbe une part croissante des recettes fiscales.</p>
<p>Les recettes pétrolières, bien qu'en légère reprise, ne suffisent plus à financer les ambitions du régime. La fiscalité non pétrolière, malgré des efforts de modernisation, reste insuffisante. Le Gabon se retrouve dans une situation paradoxale : un pays riche en ressources naturelles mais contraint budgétairement.</p>

<h2>La carte de la diversification</h2>
<p>Le gouvernement mise sur plusieurs secteurs pour diversifier l'économie. Le bois, deuxième ressource d'exportation, fait l'objet d'une politique de transformation locale plus ambitieuse. L'interdiction d'exporter des grumes, effective depuis 2010, a permis le développement d'une industrie de transformation, mais celle-ci reste en deçà de son potentiel.</p>
<p>Le tourisme, l'agriculture et l'économie numérique sont également identifiés comme des relais de croissance. Mais ces secteurs nécessitent des investissements lourds en infrastructures et en formation, dont les retours ne se matérialiseront qu'à moyen terme.</p>

<h2>Les partenaires internationaux en observation</h2>
<p>Le FMI et la Banque mondiale suivent de près l'évolution de la situation gabonaise. Un programme de facilité élargie de crédit pourrait être envisagé, mais il impliquerait des conditionnalités strictes en matière de gouvernance budgétaire et de transparence des finances publiques.</p>
<p>La Chine, partenaire historique du Gabon, reste un interlocuteur clé pour le financement des infrastructures. Mais les conditions de ces financements, souvent adossés aux ressources naturelles, font l'objet de débats croissants sur leur soutenabilité à long terme.</p>
`,
    },
    {
      slug: "ceeac-paradoxe-vert",
      title: "La CEEAC face au paradoxe vert — Capital naturel d'envergure mondiale",
      excerpt: "30 % des forêts tropicales mondiales, 107 GW de potentiel hydroélectrique, mais seulement 0,8 Md$ de finance verte captée par an.",
      authorId,
      categoryName: "Dossier Stratégique",
      countryName: "CEEAC",
      access: "free" as const,
      image: IMG.ceeacVert,
      content: `
<h2>Un capital naturel sans équivalent</h2>
<p>Le bassin du Congo, deuxième massif forestier tropical au monde après l'Amazonie, couvre plus de 200 millions d'hectares. Cette forêt absorbe environ 1,5 milliard de tonnes de CO2 par an, soit plus que les émissions annuelles du Japon. À ce titre, la CEEAC rend un service écosystémique d'envergure planétaire.</p>
<p>Au-delà de la forêt, la région dispose d'un potentiel hydroélectrique estimé à 107 GW, dont moins de 5 % est exploité. Le site d'Inga, en RDC, pourrait à lui seul produire 40 GW, soit l'équivalent de 40 réacteurs nucléaires. Ce potentiel fait de la CEEAC un acteur clé de la transition énergétique mondiale.</p>

<h2>Le paradoxe de la captation financière</h2>
<p>Malgré ce capital naturel exceptionnel, la CEEAC ne capte qu'une fraction marginale des flux de finance verte mondiaux. Sur les 632 milliards de dollars de finance climat mobilisés en 2023, l'Afrique centrale n'en a reçu que 0,8 milliard, soit 0,13 %. Ce ratio est sans commune mesure avec la contribution de la région à la régulation climatique mondiale.</p>
<p>Les marchés de crédits carbone, qui devraient théoriquement valoriser les services écosystémiques de la forêt du bassin du Congo, restent embryonnaires dans la région. Moins de 1 % des crédits carbone mondiaux proviennent de la CEEAC, faute de cadres réglementaires adaptés, de capacités techniques et de projets structurés.</p>

<h2>Les blocages structurels</h2>
<p>Plusieurs facteurs expliquent ce paradoxe. L'absence de cadre réglementaire harmonisé au niveau régional pour les marchés carbone et la finance verte constitue un frein majeur. Chaque pays développe sa propre approche, sans coordination, ce qui fragmente le marché et réduit son attractivité pour les investisseurs internationaux.</p>
<p>Le déficit de capacités techniques est également criant. Les méthodologies de mesure, reporting et vérification (MRV) des stocks de carbone forestier sont complexes et coûteuses. Peu d'institutions dans la région disposent de l'expertise nécessaire pour développer des projets conformes aux standards internationaux.</p>

<h2>Les leviers de retournement</h2>
<p>La création d'un marché régional du carbone, adossé à un registre commun et à des standards harmonisés, pourrait transformer la donne. Le mécanisme REDD+ (Réduction des émissions liées à la déforestation et à la dégradation des forêts) offre un cadre prometteur. Le Gabon a été le premier pays africain à recevoir un paiement basé sur les résultats pour la réduction de la déforestation, ouvrant la voie à d'autres pays de la région.</p>
<p>Enfin, le développement de l'hydroélectricité, avec des projets structurants comme Inga III, pourrait positionner la CEEAC comme fournisseur d'énergie propre pour l'ensemble du continent.</p>
`,
    },
    {
      slug: "trajectoires-comparees",
      title: "Tchad – Cameroun – Gabon : trajectoires comparées",
      excerpt: "Trois économies de la CEMAC, trois profils distincts, trois trajectoires qui illustrent la diversité de la région.",
      authorId,
      categoryName: "Analyse Pays",
      countryName: "Tchad",
      access: "premium" as const,
      image: IMG.business,
      content: `
<h2>Trois économies, trois profils</h2>
<p>Le Cameroun, le Tchad et le Gabon appartiennent tous trois à la zone CEMAC, mais leurs trajectoires économiques divergent de façon spectaculaire. Le Cameroun, avec plus de 40 % du PIB de la zone, joue un rôle de locomotive régionale. Le Gabon, richement doté en pétrole et en forêts, affiche le PIB par habitant le plus élevé. Le Tchad, enclavé et frappé par les conflits, peine à sortir de la fragilité.</p>

<h2>Le Cameroun : diversité et fragilités</h2>
<p>L'économie camerounaise est la plus diversifiée de la CEMAC. L'agriculture emploie plus de 60 % de la population active, tandis que les services représentent une part croissante du PIB. Mais le pays souffre d'une bureaucratie lourde, d'infrastructures insuffisantes et d'un secteur financier peu développé.</p>

<h2>Le Gabon : la transition post-pétrole</h2>
<p>Le Gabon affronte le défi de la diversification économique avec une urgence particulière : les réserves pétrolières s'amenuisent et les recettes fiscales liées aux hydrocarbures déclinent. La forêt, le manganèse et le tourisme sont identifiés comme les piliers d'une économie post-pétrolière.</p>

<h2>Le Tchad : entre fragilité et potentiel</h2>
<p>Enclavé, peuplé de plus de 17 millions d'habitants et soumis à des défis sécuritaires persistants, le Tchad présente néanmoins des atouts : un potentiel agricole considérable dans la zone soudanienne, des réserves pétrolières encore significatives et une position stratégique dans la région sahélo-saharienne.</p>
`,
    },
    {
      slug: "editorial-croisee-chemins",
      title: "La CEMAC à la croisée des chemins",
      excerpt: "La région dispose d'atouts considérables mais doit accélérer ses réformes structurelles pour attirer les investissements.",
      authorId,
      categoryName: "Éditorial",
      countryName: "CEMAC",
      access: "premium" as const,
      image: null,
      content: `
<p>La CEMAC se trouve à un moment charnière de son histoire. La crise institutionnelle que traverse la Commission, la pression budgétaire sur les États membres et la nécessité d'une diversification économique convergent pour imposer un choix : réformer ou stagner.</p>

<h2>Des atouts indéniables</h2>
<p>La zone CEMAC dispose d'atouts considérables : des ressources naturelles abondantes, une jeunesse nombreuse, une position géographique stratégique et un marché de 58 millions d'habitants. Ces atouts sont réels mais insuffisamment valorisés.</p>

<h2>L'impératif des réformes</h2>
<p>Pour attirer les investissements et diversifier les économies, plusieurs réformes s'imposent : amélioration du climat des affaires, renforcement de l'État de droit, modernisation des administrations fiscales et douanières, et développement des marchés financiers régionaux.</p>

<h2>L'opportunité de la transition verte</h2>
<p>La transition climatique mondiale offre à la CEMAC une opportunité historique. La zone dispose du capital naturel nécessaire pour se repositionner comme acteur de la finance verte mondiale. Saisir cette opportunité suppose une vision commune et une volonté politique partagée que la région peine encore à mobiliser.</p>
`,
    },
    {
      slug: "akendengue-voix-continent",
      title: "Akendengué : le retour d'un homme devenu repère",
      excerpt: "Pierre Claver Akendengué, 82 ans, est remonté sur scène à l'Institut français de Libreville. Deux soirs où une mémoire s'est remise à chanter.",
      authorId: briceMbaId,
      categoryName: "Culture & Société",
      countryName: "Gabon",
      access: "premium" as const,
      image: IMG.culturePortrait,
      content: `
<p>Il arrive que la mémoire ait une voix… On l'attendait avec une curiosité presque inquiète — comme on ouvre un vieux carnet retrouvé au fond d'une malle familiale.</p>

<p>Que reste-t-il d'un artiste après un demi-siècle ? Une œuvre, sans doute. Mais surtout une présence ? La lumière s'est adoucie. Et dans ce clair-obscur est apparu Pierre-Claver Akendengué. Il ne s'est pas avancé vers la scène. Il s'y est posé.</p>

<h3>Une voix née avant les désillusions</h3>

<p>Né en 1943, formé en France à la psychologie et aux sciences humaines, Akendengué appartient à cette génération d'artistes africains qui ont accompagné la naissance morale des indépendances — puis leurs désenchantements.</p>

<p>Dans les années 1970, alors que beaucoup de musiques africaines choisissent la danse ou la fête, lui choisit la parole. Une parole lente, poétique, nourrie de contes, de philosophie et de chronique sociale.</p>

<h3>Dans la salle : deux générations</h3>

<p>Avant même la première note, certains spectateurs souriaient déjà. Dans la salle, il y avait deux publics. Ceux qui avaient vécu avec ses chansons et ceux qui allaient les découvrir. Les premiers regardaient la scène mais voyaient autre chose : une époque entière.</p>

<p>Puis la voix est venue et s'est faite entendre. Elle n'avait plus la netteté des enregistrements anciens. Elle portait mieux : la matière des années. Ce n'était plus un timbre — c'était une mémoire sonore.</p>

<h3>L'ovation lente</h3>

<p>À la fin, les applaudissements ne furent pas une explosion. Ils furent une reconnaissance. On n'applaudissait pas seulement un concert. On applaudissait une continuité. Les anciens saluaient leur propre jeunesse. Les jeunes saluaient un héritage qu'ils découvraient.</p>

<p>Car Pierre-Claver Akendengué appartient à une catégorie rare : les artistes qui n'occupent pas seulement l'histoire culturelle d'un pays — ils accompagnent sa conscience.</p>
`,
    },
    {
      slug: "interview-gweth-cemac",
      title: "Dr Guy Gweth : « Aucune intégration ne progresse sans leadership et volonté de puissance »",
      excerpt: "Le Président du CAVIE dévoile les ressorts de la crise de la CEMAC et plaide pour un leadership assumé du Cameroun au service de l'intégration régionale.",
      authorId,
      categoryName: "La Grande Interview",
      countryName: "Cameroun",
      access: "premium" as const,
      image: IMG.gweth1,
      content: `
<p class="italic text-muted-foreground">Dr Guy GWETH est Président du Centre africain de veille et d'intelligence économique (CAVIE), consultant international en intelligence stratégique et due diligence depuis 15 ans.</p>

<img src="${IMG.gweth2}" alt="Dr Guy Gweth" class="w-full rounded-lg my-6 max-h-[500px] object-cover" />

<h2>Une crise de trésorerie récurrente</h2>
<p><strong>HABARI :</strong> Le 5 février dernier, la CEMAC a suspendu une partie de ses activités, faute de trésorerie. Quelle réflexion vous suggèrent ces nouvelles alarmantes ?</p>
<p><strong>Guy GWETH :</strong> Il s'agit d'une situation certes embarrassante, mais il faut garder à l'esprit qu'elle est récurrente. Les organisations en charge de l'intégration régionale en Afrique centrale sont très souvent sous tension de trésorerie pour une raison très simple : les États membres ne veulent pas implémenter les mécanismes de financement qu'ils ont eux-mêmes adoptés.</p>

<h2>Des arriérés de 263,4 milliards de FCFA</h2>
<p><strong>HABARI :</strong> Certains observateurs estiment que la CEMAC est prise en étau entre des États membres exsangues, des bailleurs devenus méfiants et une gouvernance institutionnelle vidée de sa substance politique.</p>
<p><strong>Guy GWETH :</strong> L'analyse est pertinente. Au 31 décembre 2025, les arriérés ont été estimés à 263,4 milliards de FCFA. Seuls deux pays, le Cameroun et le Gabon, s'acquittent de leurs obligations. Certains États n'ont absolument rien reversé alors qu'ils ont effectivement prélevé la taxe auprès des usagers.</p>

<h2>Le leadership absent du Cameroun</h2>
<p><strong>HABARI :</strong> Certains pointent l'absence d'un véritable leadership régional. Le Cameroun semble avoir renoncé à son leadership.</p>
<p><strong>Guy GWETH :</strong> On peut répondre par l'affirmative sans trop risquer de se tromper. Le Cameroun représente 42,1 % du PIB nominal de la CEMAC fin 2024 et supporte presque la moitié du financement de l'organisation. Pourtant, il n'exerce pas pleinement son rôle de leader, contrairement à la Côte d'Ivoire ou au Nigeria qui impulsent les dynamiques au sein de l'UEMOA et de la CEDEAO.</p>

<h2>Les solutions pour relever la CEMAC</h2>
<p><strong>HABARI :</strong> Quelles seraient les solutions à envisager pour relever la CEMAC ?</p>
<p><strong>Guy GWETH :</strong> La priorité absolue est que les États appliquent de manière stricte les actes concernant le financement autonome de la communauté. Les ressources prélevées par les administrations douanières doivent être entièrement et immédiatement reversées. Ensuite, il faut veiller à l'application des règles de bonne gouvernance financière. Enfin, il est crucial de mettre sérieusement en œuvre les réformes visant l'industrialisation et la valorisation du contenu local.</p>

<p class="text-sm text-muted-foreground italic mt-8">(*) Guy GWETH est fondateur du CAVIE et auteur de « Puissance 237 ». Plus d'infos sur guy-gweth.com</p>
`,
    },
    {
      slug: "gabon-oligui-nguema",
      title: "Le Gabon d'Oligui Nguema : entre promesses et réalités",
      excerpt: "Un an après la transition, le Gabon cherche à redéfinir son modèle économique.",
      authorId,
      categoryName: "Analyse Pays",
      countryName: "Gabon",
      access: "premium" as const,
      image: null,
      content: `
<h2>Un an après la transition</h2>
<p>Le 30 août 2023, le général Brice Clotaire Oligui Nguema prenait le pouvoir à Libreville. Un an plus tard, le bilan est contrasté. Les grands chantiers d'infrastructure ont été lancés, la communication gouvernementale est active, mais les défis économiques structurels demeurent.</p>

<h2>Les chantiers visibles</h2>
<p>La construction de logements sociaux, la réhabilitation des routes et le développement des zones économiques spéciales sont les vitrines de la transition. Ces investissements sont réels et visibles, mais leur financement pèse sur un budget déjà contraint.</p>

<h2>Les défis persistants</h2>
<p>La dépendance au pétrole, la corruption endémique et le chômage des jeunes restent des défis majeurs. La diversification économique, promise par le régime, prend du temps. Les investisseurs étrangers observent avec prudence l'évolution du cadre réglementaire et institutionnel.</p>
`,
    },
    {
      slug: "interview-mackosso-rester-debout",
      title: "Loïc Mackosso : « Rester debout, c'est décider de se renforcer »",
      excerpt: "Banquier d'affaires et fondateur d'Aries Investissements, Loïc Mackosso livre un témoignage puissant sur la résilience, l'entrepreneuriat en Afrique et la reconstruction après la guerre civile au Congo.",
      authorId,
      categoryName: "La Grande Interview",
      countryName: "Congo",
      access: "free" as const,
      image: IMG.mackosso1,
      content: `
<p class="italic text-muted-foreground">Banquier d'affaires, investisseur et conférencier, Loïc Mackosso accompagne depuis plus de 20 ans entreprises et institutions dans la structuration et le financement de projets d'envergure. Fondateur et associé d'Aries Investissements.</p>

<img src="${IMG.mackosso2}" alt="Loïc Mackosso en conférence" class="w-full rounded-lg my-6 max-h-[500px] object-cover" />

<h2>La résilience comme super-pouvoir</h2>
<p><strong>HABARI :</strong> Le sous-titre de votre livre se décline ainsi : « Quand la résilience devient un super-pouvoir ». Qu'est-ce que vous sous-entendez par cette affirmation ?</p>
<p><strong>Loïc MACKOSSO :</strong> On parle souvent de résilience comme d'une capacité à supporter les épreuves. Pour moi, ce n'est pas suffisant. La résilience devient un super-pouvoir lorsqu'elle nous transforme intérieurement. J'ai connu la guerre, l'exil, la trahison, les échecs professionnels et les ruptures personnelles. À chaque étape, j'avais le choix : subir ou me structurer. La résilience, ce n'est pas encaisser. C'est décider de se renforcer.</p>

<h2>« Quoi qu'il arrive, reste debout »</h2>
<p><strong>HABARI :</strong> Lorsque vous vous séparez de votre père au plus fort de la guerre civile, il vous dit : « Sois fort mon fils. Tout ira bien. N'oublie jamais : quoi qu'il arrive, tu dois rester debout ». Pourquoi tirer de cette phrase le titre du livre ?</p>
<p><strong>Loïc MACKOSSO :</strong> Lorsque je quitte le Congo en pleine guerre, mon père me dit : « Quoi qu'il arrive, reste debout. » Ce n'était pas une formule. C'était un héritage. Rester debout ne signifie pas ne jamais tomber. Cela signifie garder sa dignité, ses valeurs, son cap, même quand tout vacille autour de vous.</p>

<h2>Conseils aux jeunes entrepreneurs africains</h2>
<p><strong>HABARI :</strong> Si vous aviez des conseils à transmettre à des jeunes africains qui veulent entreprendre ?</p>
<p><strong>Loïc MACKOSSO :</strong> Je leur dirais d'investir d'abord en eux-mêmes. De se former sérieusement. D'apprendre l'anglais. De lire. De construire un réseau international. Et surtout de comprendre que l'entrepreneuriat n'est pas un raccourci vers l'argent, mais un engagement exigeant. Il faut y entrer avec discipline et vision. Et quoi qu'il arrive, rester debout.</p>

<blockquote>« La résilience, ce n'est pas encaisser. C'est décider de se renforcer. Lorsqu'elle devient une discipline mentale, elle change votre trajectoire. »<br/><em>— Loïc Mackosso</em></blockquote>
`,
    },
    {
      slug: "economie-verte-doctrine-competitivite",
      title: "L'économie verte, nouvelle doctrine de compétitivité pour l'Afrique Centrale",
      excerpt: "La transition climatique mondiale redistribue les cartes de la compétitivité économique. Pour la zone CEEAC, c'est une opportunité historique de repositionnement.",
      authorId,
      categoryName: "Habari Green",
      countryName: "CEEAC",
      access: "free" as const,
      image: IMG.ecoVerte,
      content: `
<h2>I. Le basculement stratégique : du narratif écologique au calcul économique</h2>
<p>L'économie verte n'est plus un supplément d'âme. Elle s'affirme désormais comme une doctrine industrielle à part entière, portée par des décisions souveraines des grandes puissances. L'Europe taxe les émissions carbones aux frontières (CBAM). Les États-Unis ont mobilisé plus de 369 milliards de dollars via l'Inflation Reduction Act. La Chine sécurise méthodiquement les minerais critiques qui alimenteront les batteries de demain.</p>
<p>Face à ce réalignement géopolitique de grande ampleur, l'Afrique Centrale se retrouve dans une position paradoxale : elle détient une part décisive des actifs dont dépend cette transition mondiale — 30 % des forêts tropicales de la planète, les réserves de cobalt les plus importantes du monde en RDC, le manganèse du Gabon — mais continue d'en exporter la valeur brute, sans en maîtriser la structuration financière ni la négociation.</p>

<blockquote>« La rareté n'est pas l'argent. La rareté est la structuration. Les pays de la CEEAC captent une part marginale des flux climatiques mondiaux non par manque de ressources, mais par déficit d'ingénierie financière locale. »<br/><em>— Analyse Habari, 2026</em></blockquote>

<h2>II. Où est l'argent ? Trois filières de valeur que la région ne maîtrise pas encore</h2>

<h3>Les marchés carbone : un actif mal valorisé</h3>
<p>Le marché volontaire du carbone a dépassé les 2 milliards de dollars de valeur annuelle. Les crédits forestiers de haute qualité, une fois certifiés, se négocient entre 10 et 20 dollars la tonne. La RDC, le Gabon et le Congo-Brazzaville pourraient théoriquement générer des centaines de millions de dollars par an via les mécanismes REDD+.</p>

<img src="${IMG.ecoVerte2}" alt="Forêts tropicales du bassin du Congo" class="w-full rounded-lg my-6 max-h-[400px] object-cover" />

<h3>Les financements climatiques multilatéraux : des flux qui passent à côté</h3>
<p>Les flux climatiques mondiaux dépassent 600 milliards de dollars par an selon la Climate Policy Initiative. Pourtant, les pays de la CEEAC n'en captent qu'une fraction marginale, faute de projets bancables, d'ingénierie financière locale et de pipelines d'investissement structurés.</p>

<h2>Conclusion</h2>
<p><strong>L'économie verte n'est pas un secteur. C'est une doctrine de compétitivité.</strong></p>
<p>La région détient les actifs. Les financements existent. Les marchés sont ouverts. La seule variable décisive reste la capacité à structurer, à négocier et à industrialiser.</p>
`,
    },
    {
      slug: "emplois-verts-ceeac",
      title: "Emplois verts en CEEAC : le potentiel existe, la structuration manque",
      excerpt: "Aquaculture, horticulture, hydroélectricité, énergie solaire : des initiatives portent leurs fruits. Mais transformer des projets isolés en moteur d'emploi régional exige bien davantage.",
      authorId,
      categoryName: "Business & Innovation",
      countryName: "CEEAC",
      access: "free" as const,
      image: IMG.emploisVerts,
      content: `
<p>Dix millions d'emplois verts. C'est l'horizon que la zone CEEAC pourrait atteindre d'ici 2030 si ses onze États membres parviennent à transformer leur capital naturel en machine productive. Les signaux existent, épars et encourageants. Ce qui fait défaut, ce n'est pas la ressource ni même la volonté. C'est la capacité à passer de l'initiative au système.</p>

<h2>I. Un virage productif en train de s'opérer</h2>
<p>Au Cameroun, <strong>Agro World Group</strong> incarne une ambition résolument industrielle dans le secteur aquacole. Son projet d'élevage intensif de tilapia prévoit cinq cents emplois directs à terme. À São Tomé-et-Príncipe, la <strong>coopérative des horticulteurs de Santa Clara</strong>, accompagnée par la FAO, génère des emplois décents pour les jeunes et les femmes dans les zones rurales.</p>

<blockquote>« L'emploi vert en Afrique Centrale ne naîtra pas d'un grand soir institutionnel. Il se construit filière après filière, dans les interstices que l'État n'occupe pas encore. »<br/><em>— Analyse Habari, 2026</em></blockquote>

<h2>II. L'énergie comme premier levier de masse</h2>
<p>La RDC concentre à elle seule un potentiel hydroélectrique parmi les plus importants de la planète, et les estimations de FSD Africa évoquent <strong>seize mille emplois créés</strong> dans ce seul secteur d'ici 2030.</p>

<img src="${IMG.emploisVerts2}" alt="Aquaculture en Afrique" class="w-full rounded-lg my-6 max-h-[400px] object-cover" />

<h2>Conclusion</h2>
<p><strong>Le potentiel est là. La méthode, encore à construire.</strong></p>
<p>Dix millions d'emplois verts en CEEAC d'ici 2030 : l'objectif n'est pas irréaliste. Il exige cependant un changement de logique. Cesser d'additionner des projets pour commencer à construire des filières.</p>
`,
    },
    {
      slug: "cobalt-minerais-verts-afrique",
      title: "Cobalt et minerais stratégiques : bénédiction ou piège économique pour l'Afrique ?",
      excerpt: "Avec 70 % de la production mondiale de cobalt, l'Afrique est au cœur de la révolution énergétique. Mais la Chine contrôle 73 % du raffinage.",
      authorId,
      categoryName: "Habari Green",
      countryName: "RDC",
      access: "free" as const,
      image: IMG.cobaltMine,
      content: `
<p class="italic text-muted-foreground">Les chiffres de l'Agence Internationale de l'Énergie sont sans appel : la demande en minerais critiques pour les technologies propres devrait tripler d'ici 2030 et quadrupler d'ici 2040.</p>

<blockquote>« L'Afrique détient 30 % des réserves mondiales prouvées de minerais critiques. D'ici 2030, la valeur de marché pour la production minière africaine devrait augmenter de 65 % pour atteindre environ 200 milliards USD. » — AIE, Global Critical Minerals Outlook 2024</blockquote>

<h2>L'Afrique centrale au cœur du système</h2>
<p>La République Démocratique du Congo domine la production mondiale de cobalt avec une position quasi monopolistique : en 2024, les trois principales mines congolaises ont produit à elles seules plus de 50 % du cobalt mondial. La RDC possède par ailleurs 71 % des réserves mondiales prouvées de cobalt.</p>

<img src="${IMG.cobaltOre}" alt="Minerai de cobalt brut" class="w-full rounded-xl my-8" />

<h2>Le paradoxe de la captation de valeur</h2>
<p>Malgré cette position stratégique, l'Afrique reste largement exclue des segments à forte valeur ajoutée de la chaîne de batteries. <strong>La Chine contrôle aujourd'hui 73 % du raffinage du cobalt, 58 % du lithium, 67 % du nickel et 80 % du graphite de qualité batterie.</strong></p>

<h2>Des stratégies de souveraineté émergent</h2>
<p>Face à ce constat, plusieurs États africains adoptent des politiques de souveraineté minière. En 2025, la RDC a temporairement interdit les exportations de cobalt brut. Le Zimbabwe a interdit l'exportation de lithium brut et investit 270 millions USD dans une usine de concentration.</p>

<p class="text-xs text-muted-foreground mt-8"><em>Sources : AIE, Global Critical Minerals Outlook 2024-2025 ; Banque mondiale.</em></p>
`,
    },
    {
      slug: "villes-africaines-defi-climatique",
      title: "Les villes africaines face au défi climatique : entre contraintes et opportunités",
      excerpt: "Avec 700 millions de nouveaux citadins attendus d'ici 2050, l'Afrique doit construire des villes durables sans répéter les erreurs des pays industrialisés.",
      authorId,
      categoryName: "Habari Green",
      countryName: "Afrique",
      access: "free" as const,
      image: IMG.villesAfrique,
      content: `
<p>Les villes génèrent 70 % des émissions mondiales de CO2, mais elles constituent aussi les laboratoires de la transition écologique. En Afrique, où l'urbanisation s'accélère à un rythme sans précédent, les enjeux sont colossaux : comment accueillir 2 milliards d'habitants urbains supplémentaires d'ici 2050 tout en réduisant l'empreinte carbone du continent ?</p>

<h2>L'explosion urbaine</h2>
<p>Selon la Banque africaine de développement, la population africaine devrait croître de 900 millions de personnes d'ici 2050, dont <strong>700 millions concentrés dans les villes</strong>.</p>

<blockquote>« La population africaine devrait croître de 900 millions de personnes d'ici 2050, avec 700 millions de cette croissance dans les villes. La planification de cette expansion urbaine doit commencer maintenant. » — Stefan Atchia, BAD</blockquote>

<h2>Le BRT électrique : une solution viable</h2>
<p>Face à ces défis, le Bus Rapid Transit (BRT) s'impose progressivement. En décembre 2023, Dakar a inauguré le <strong>premier BRT 100 % électrique d'Afrique subsaharienne</strong> : 18,3 kilomètres, 23 stations, 121 bus électriques.</p>

<img src="${IMG.brtDakar}" alt="Bus Rapid Transit électrique à Dakar" class="w-full rounded-xl my-8" />

<p>Les villes africaines se trouvent à un carrefour historique. Contrairement aux pays industrialisés qui doivent « décarboner » des infrastructures existantes à grands frais, <strong>l'Afrique peut concevoir ses villes de manière durable dès le départ</strong>.</p>
`,
    },
    {
      slug: "femmes-entrepreneuses-afrique",
      title: "La montée des femmes entrepreneuses change-t-elle l'économie africaine ?",
      excerpt: "L'Afrique détient le taux d'entrepreneuriat féminin le plus élevé au monde. Pourtant, moins de 5 % du financement startup va à des CEO femmes.",
      authorId,
      categoryName: "Culture & Société",
      countryName: "Afrique",
      access: "free" as const,
      image: IMG.femmesAwief,
      content: `
<p class="italic text-muted-foreground">26 % des femmes adultes en Afrique subsaharienne sont engagées dans des activités entrepreneuriales, soit cinq fois le taux européen. Elles contribuent entre 250 et 300 milliards de dollars au PIB continental.</p>

<h2>Un poids économique massif, une reconnaissance minimale</h2>
<p>Au Rwanda, les femmes représentent 61 % des entrepreneurs. Au Zimbabwe, 56 % des PME sont détenues par des femmes. Selon l'Organisation internationale du travail, les entreprises détenues par des femmes génèrent environ 18 millions d'emplois en Afrique.</p>

<p>Plus frappant encore : les femmes réinvestissent jusqu'à <strong>90 % de leurs revenus</strong> dans l'éducation, la santé et la nutrition de leurs familles, contre 40 % pour les hommes.</p>

<img src="${IMG.femmesRdc}" alt="Femmes entrepreneuses en RDC" class="w-full rounded-xl my-8" />

<h2>Le paradoxe du financement : 78 cents contre 31</h2>
<p>Malgré cette puissance entrepreneuriale, l'accès au capital reste un mur. En 2024, les CEO femmes ont levé <strong>48 millions de dollars</strong> contre 2,2 milliards pour les CEO hommes — un ratio de 1 pour 46.</p>
<p>L'ironie est cruelle : les données du Boston Consulting Group montrent que pour chaque dollar investi, les entreprises fondées par des femmes génèrent un retour de <strong>78 cents, contre 31 cents</strong> pour celles fondées par des hommes.</p>

<img src="${IMG.femmesTech}" alt="Femmes dans la tech en Afrique" class="w-full rounded-xl my-8" />

<h2>Les signaux d'un basculement</h2>
<p>L'initiative AFAWA de la Banque africaine de développement a mobilisé plus de 1,5 milliard de dollars d'investissements pour les PME dirigées par des femmes. McKinsey estime que la participation économique accrue des jeunes femmes africaines pourrait ajouter <strong>287 milliards de dollars</strong> au PIB africain.</p>
`,
    },
    {
      slug: "revolution-mobile-money-afrique",
      title: "La révolution du mobile money change-t-elle les comportements sociaux en Afrique ?",
      excerpt: "Avec 856 millions de comptes et 1 000 milliards de dollars de transactions annuelles, le mobile money redéfinit les solidarités familiales, l'autonomie des femmes et la frontière entre économie formelle et informelle.",
      authorId,
      categoryName: "Culture & Société",
      countryName: "Afrique",
      access: "free" as const,
      image: IMG.mobileMoney1,
      content: `
<h2>Une transformation silencieuse mais radicale</h2>
<p>Lorsque Safaricom lance M-Pesa au Kenya en 2007, peu d'économistes imaginent que ce service de transfert d'argent par téléphone mobile va transformer l'architecture financière d'un continent entier. Dix-sept ans plus tard, l'Afrique concentre plus de la moitié des comptes de mobile money actifs dans le monde, avec <strong>856 millions de comptes enregistrés</strong> et plus de <strong>1 000 milliards de dollars de transactions annuelles</strong> en 2023.</p>

<h2>Afrique de l'Est : le téléphone devenu banque universelle</h2>
<p>L'Afrique de l'Est est le laboratoire mondial du mobile money. Au Kenya, le taux d'adoption atteint <strong>79 % des adultes</strong>. Une étude publiée dans la revue <em>Science</em> a montré que l'expansion de M-Pesa a permis à <strong>194 000 ménages kenyans de sortir de la pauvreté</strong>.</p>

<img src="${IMG.mobileMoney2}" alt="Mobile money en Afrique — transactions numériques" class="w-full rounded-lg my-6" />

<h2>Afrique centrale : une transition encore incomplète</h2>
<p>Comparée aux deux régions précédentes, l'Afrique centrale reste en retrait dans l'adoption du mobile money. Plusieurs facteurs expliquent cette situation. Le cadre réglementaire de la zone CEMAC est historiquement plus strict concernant les services financiers numériques.</p>
<p>Pour autant, la GSMA note que l'Afrique centrale figure parmi les régions où la <strong>croissance du nombre de comptes actifs est la plus rapide</strong>. Avec environ <strong>70 milliards de dollars de transactions annuelles</strong>, la région pourrait connaître une accélération dans les prochaines années.</p>

<img src="${IMG.mobileMoney3}" alt="Kiosque mobile money en Afrique de l'Ouest" class="w-full rounded-lg my-6" />

<h2>Vers une infrastructure financière continentale</h2>
<p>Le mobile money n'a probablement pas encore atteint son plein potentiel. La prochaine étape pourrait être l'intégration de nouveaux services financiers directement dans les plateformes mobiles : crédit instantané, assurance, paiement transfrontalier.</p>

<p class="text-xs text-muted-foreground mt-8">Sources : GSMA State of the Industry Report 2024, World Bank Global Findex Database 2021.</p>
`,
    },
  ];

  let articlesInserted = 0;
  let articlesSkipped = 0;

  for (const article of articlesToInsert) {
    const existing = await db.select().from(articles).where(eq(articles.slug, article.slug)).limit(1);
    if (existing.length > 0) {
      log(`  ✓ Article exists: ${article.slug}`);
      articlesSkipped++;
      continue;
    }

    const categoryId = catMap[article.categoryName] ?? null;
    const countryId = countryMap[article.countryName] ?? null;

    await db.insert(articles).values({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      authorId: article.authorId,
      categoryId,
      countryId,
      featuredImage: article.image || null,
      status: "published",
      minSubscriptionTier: article.access === "free" ? "free" : "premium",
      publishedAt: new Date("2026-02-01"),
    });

    log(`  + Inserted article: ${article.slug}`);
    articlesInserted++;
  }

  log(`  ✓ Articles: ${articlesInserted} inserted, ${articlesSkipped} already existed`);

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 6: Opportunities (bids + AMI + jobs)
  // ──────────────────────────────────────────────────────────────────────────
  log("\n📋 Phase 6: Inserting opportunities...");

  const bids = [
    { title: "Construction d'un pont sur la Sanaga", organization: "Ministère des Travaux Publics", country: "Cameroun", deadline: "15 mars 2026", sector: "Infrastructure", budget: "12M", currency: "USD" },
    { title: "Fourniture d'équipements médicaux — CHU Libreville", organization: "Ministère de la Santé", country: "Gabon", deadline: "28 février 2026", sector: "Santé", budget: "3.5M", currency: "USD" },
    { title: "Électrification rurale — Phase 2", organization: "ENEO", country: "Cameroun", deadline: "10 avril 2026", sector: "Énergie", budget: "8M", currency: "USD" },
    { title: "Réhabilitation du port autonome de Pointe-Noire", organization: "Port Autonome de Pointe-Noire", country: "Congo", deadline: "30 mars 2026", sector: "Infrastructure", budget: "25M", currency: "USD" },
    { title: "Système d'information foncière numérique", organization: "Ministère des Domaines", country: "Gabon", deadline: "20 mars 2026", sector: "Technologie", budget: "2M", currency: "USD" },
    { title: "Approvisionnement en intrants agricoles", organization: "MINADER", country: "Cameroun", deadline: "5 avril 2026", sector: "Agriculture", budget: "5M", currency: "USD" },
    { title: "Construction d'un barrage hydroélectrique — Calandula", organization: "Ministère de l'Énergie", country: "Angola", deadline: "15 mai 2026", sector: "Énergie", budget: "120M", currency: "USD" },
    { title: "Réhabilitation de la RN1 — Kinshasa-Matadi", organization: "Office des Routes", country: "RDC", deadline: "30 avril 2026", sector: "Infrastructure", budget: "45M", currency: "USD" },
    { title: "Kigali Smart City — Infrastructure numérique", organization: "Rwanda ICT Chamber", country: "Rwanda", deadline: "20 mai 2026", sector: "Technologie", budget: "8M", currency: "USD" },
    { title: "Rénovation du réseau d'eau potable — Bujumbura", organization: "REGIDESO", country: "Burundi", deadline: "10 juin 2026", sector: "Infrastructure", budget: "6M", currency: "USD" },
    { title: "Modernisation du port de Névès", organization: "ENAPORT", country: "São Tomé-et-Príncipe", deadline: "25 mai 2026", sector: "Infrastructure", budget: "3M", currency: "USD" },
  ];

  const amis = [
    { title: "Appel à candidatures — Promotion des équipements de cuisson artisanaux (G4-A1)", organization: "Arzikin HASKE", country: "Niger", deadline: "10 avril 2026", sector: "Énergie", amiType: "Appel à candidatures", featured: true, description: "Renforcer la chaîne de valeur locale des équipements de cuisson propre et efficace (CPE) au Niger.", partners: "Projet HASKE", webinaire: "", externalLink: "https://arzikinhaske.com/appel-a-candidature-g4-a1/" },
    { title: "Appel à Projets — Fonds Mwinda : Financement Basé sur les Résultats pour Systèmes Solaires Domestiques", organization: "ANSER RDC (Fonds Mwinda)", country: "RDC", deadline: "27 mars 2026", sector: "Énergie", amiType: "Appel à projets", featured: true, description: "Le Fonds Mwinda lance un appel à projets destiné aux entreprises locales et internationales qui déploient des systèmes solaires domestiques (SHS) en RDC.", partners: "GEAPP, GreenMax Capital Group, Banque Mondiale", webinaire: "17 mars 2026 — 10h30-12h30 (UTC+1, Kinshasa)", externalLink: "https://www.linkedin.com/posts/anser-rdc_fondsmwinda-energiesolaire-shs-activity-7437894273477390337-Ymw4" },
    { title: "AMI — Partenariat public-privé pour la gestion des déchets urbains", organization: "Communauté Urbaine de Douala", country: "Cameroun", deadline: "30 avril 2026", sector: "Environnement", amiType: "PPP", featured: false, description: "", partners: "", webinaire: "", externalLink: "" },
    { title: "Recherche de partenaires — Programme d'électrification solaire rurale", organization: "Agence Nationale d'Électrification Rurale", country: "RDC", deadline: "15 mai 2026", sector: "Énergie", amiType: "Partenariat", featured: false, description: "", partners: "", webinaire: "", externalLink: "" },
    { title: "AMI — Développement d'une plateforme numérique de santé", organization: "OMS Bureau Afrique Centrale", country: "Régional", deadline: "20 juin 2026", sector: "Santé / Tech", amiType: "AMI", featured: false, description: "", partners: "", webinaire: "", externalLink: "" },
    { title: "Appel à projets — Incubation de startups agritech", organization: "BAD / Fonds vert", country: "Régional CEEAC", deadline: "10 mai 2026", sector: "Agriculture", amiType: "Appel à projets", featured: false, description: "", partners: "", webinaire: "", externalLink: "" },
    { title: "AMI — Consultant en gouvernance forestière REDD+", organization: "COMIFAC", country: "Régional", deadline: "25 avril 2026", sector: "Environnement", amiType: "AMI", featured: false, description: "", partners: "", webinaire: "", externalLink: "" },
  ];

  const jobs = [
    { title: "Économiste principal — Bureau régional Afrique Centrale", organization: "Banque Africaine de Développement", country: "Cameroun", deadline: "20 mars 2026", contractType: "CDI", experienceLevel: "Senior" },
    { title: "Chargé(e) de programme — Finance climatique", organization: "PNUD Gabon", country: "Gabon", deadline: "15 avril 2026", contractType: "CDD 2 ans", experienceLevel: "Confirmé" },
    { title: "Analyste données — Observatoire économique CEEAC", organization: "Commission CEEAC", country: "Gabon", deadline: "30 mars 2026", contractType: "CDI", experienceLevel: "Junior/Confirmé" },
    { title: "Stage — Rédaction économique et data journalism", organization: "Habari Magazine", country: "Cameroun / Remote", deadline: "Ouvert", contractType: "Stage 6 mois", experienceLevel: "Étudiant" },
    { title: "Directeur(trice) des investissements — Fonds souverain", organization: "Fonds Gabonais d'Investissements Stratégiques", country: "Gabon", deadline: "10 avril 2026", contractType: "CDI", experienceLevel: "Directeur" },
    { title: "Consultant(e) en transformation digitale", organization: "Banque Mondiale — Bureau Kinshasa", country: "RDC", deadline: "25 avril 2026", contractType: "Mission 12 mois", experienceLevel: "Senior" },
  ];

  const existing = await db.select().from(opportunities).limit(1);
  if (existing.length > 0) {
    log(`  ✓ Opportunities already seeded, skipping`);
  } else {
    for (const b of bids) {
      const slug = b.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 200);
      await db.insert(opportunities).values({ type: "bid", slug: `${slug}-bid`, title: b.title, organization: b.organization, country: b.country, deadline: b.deadline, sector: b.sector, budget: b.budget, currency: b.currency, status: "active", featured: false });
    }
    log(`  + Inserted ${bids.length} bids`);

    for (const a of amis) {
      const slug = a.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 200);
      await db.insert(opportunities).values({ type: "ami", slug: `${slug}-ami`, title: a.title, organization: a.organization, country: a.country, deadline: a.deadline, sector: a.sector, amiType: a.amiType, featured: a.featured, description: a.description || null, partners: a.partners || null, webinaire: a.webinaire || null, externalLink: a.externalLink || null, status: "active" });
    }
    log(`  + Inserted ${amis.length} AMI`);

    for (const j of jobs) {
      const slug = j.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 200);
      await db.insert(opportunities).values({ type: "job", slug: `${slug}-job`, title: j.title, organization: j.organization, country: j.country, deadline: j.deadline, contractType: j.contractType, experienceLevel: j.experienceLevel, status: "active", featured: false });
    }
    log(`  + Inserted ${jobs.length} jobs`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 7: Economic actors (directory)
  // ──────────────────────────────────────────────────────────────────────────
  log("\n🏢 Phase 7: Inserting economic actors...");

  const actorsData = [
    { name: "BDEAC", sector: "Finance", countryName: "CEMAC", description: "Banque de Développement des États de l'Afrique Centrale", employees: "200+", verified: true },
    { name: "Afriland First Bank", sector: "Finance", countryName: "Cameroun", description: "Groupe bancaire panafricain basé à Yaoundé", employees: "2000+", verified: true },
    { name: "Olam Gabon", sector: "Agriculture", countryName: "Gabon", description: "Transformation locale de produits agricoles et forestiers", employees: "5000+", verified: true },
    { name: "MTN Cameroon", sector: "Télécommunications", countryName: "Cameroun", description: "Opérateur de télécommunications leader au Cameroun", employees: "1500+", verified: true },
    { name: "Total Energies Congo", sector: "Énergie", countryName: "Congo", description: "Exploration et production pétrolière en zone CEEAC", employees: "800+", verified: true },
    { name: "CIMENCAM", sector: "Construction", countryName: "Cameroun", description: "Cimenteries du Cameroun — leader de la production de ciment", employees: "600+", verified: true },
    { name: "Sonangol", sector: "Énergie", countryName: "Angola", description: "Société nationale des pétroles d'Angola, acteur majeur du secteur pétrolier africain", employees: "25000+", verified: true },
    { name: "Gécamines", sector: "Industries extractives", countryName: "RDC", description: "Générale des Carrières et des Mines — exploitation minière en République démocratique du Congo", employees: "10000+", verified: true },
    { name: "Bank of Kigali", sector: "Finance", countryName: "Rwanda", description: "Première banque commerciale du Rwanda, moteur de l'inclusion financière", employees: "1500+", verified: true },
    { name: "Interbank Burundi", sector: "Finance", countryName: "Burundi", description: "Banque commerciale de référence au Burundi", employees: "400+", verified: true },
    { name: "ENCO", sector: "Agriculture", countryName: "São Tomé-et-Príncipe", description: "Entreprise Nationale de Cacao — transformation et export de cacao premium", employees: "300+", verified: true },
  ];

  let actorsInserted = 0;
  let actorsSkipped = 0;

  for (const actor of actorsData) {
    const slug = actor.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const existing = await db.select().from(economicActors).where(eq(economicActors.name, actor.name)).limit(1);
    if (existing.length > 0) {
      log(`  ✓ Actor exists: ${actor.name}`);
      actorsSkipped++;
      continue;
    }

    const countryId = countryMap[actor.countryName] ?? null;
    await db.insert(economicActors).values({
      name: actor.name,
      slug,
      description: actor.description,
      sector: actor.sector,
      countryId,
      employees: actor.employees,
      verified: actor.verified,
    });
    log(`  + Inserted actor: ${actor.name}`);
    actorsInserted++;
  }

  log(`  ✓ Actors: ${actorsInserted} inserted, ${actorsSkipped} already existed`);

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 8: Economic indicators (Green metrics)
  // ──────────────────────────────────────────────────────────────────────────
  log("\n📊 Phase 8: Inserting economic indicators...");

  const indicatorsData = [
    { label: "Prix crédit VCM", value: "$6,20", trend: "up" as const, delta: "+12%", category: "commodity" as const, periodLabel: "Marché volontaire", sortOrder: 1 },
    { label: "Projets REDD+ actifs", value: "47", trend: "up" as const, delta: "+8", category: "macro" as const, periodLabel: "Zone CEEAC", sortOrder: 2 },
    { label: "Crédits carbone émis 2025", value: "18,5M tCO₂e", trend: "up" as const, delta: "+23%", category: "commodity" as const, periodLabel: "2025", sortOrder: 3 },
    { label: "Finance verte captée CEEAC", value: "$0,8 Md", trend: "up" as const, delta: "+15%", category: "macro" as const, periodLabel: "Par an", sortOrder: 4 },
    { label: "PIB zone CEMAC", value: "~105 Mds $", trend: "stable" as const, delta: "+3,1%", category: "macro" as const, periodLabel: "2025", sortOrder: 5 },
    { label: "Potentiel hydroélectrique CEEAC", value: "107 GW", trend: "stable" as const, delta: "Exploité < 5%", category: "macro" as const, periodLabel: "Estimation 2025", sortOrder: 6 },
    { label: "Cobalt RDC — part mondiale", value: "70%", trend: "stable" as const, delta: "Raffiné Chine 73%", category: "commodity" as const, periodLabel: "2024", sortOrder: 7 },
    { label: "Forêts tropicales CEEAC", value: "240 Mha", trend: "down" as const, delta: "-0,3%/an", category: "macro" as const, periodLabel: "2025", sortOrder: 8 },
  ];

  const existingIndicators = await db.select().from(economicIndicators).limit(1);
  if (existingIndicators.length > 0) {
    log(`  ✓ Economic indicators already seeded, skipping`);
  } else {
    for (const indicator of indicatorsData) {
      await db.insert(economicIndicators).values(indicator);
    }
    log(`  + Inserted ${indicatorsData.length} economic indicators`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Done
  // ──────────────────────────────────────────────────────────────────────────
  log("\n✅ Seed complete!");
  log(`   Articles: ${articlesInserted} inserted`);
  log(`   Actors: ${actorsInserted} inserted`);
  log("   Images stored in public/uploads/");
  log("\n💡 Verify: http://localhost:5000/magazine — articles should appear from DB");

  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] Fatal error:", err);
  process.exit(1);
});
