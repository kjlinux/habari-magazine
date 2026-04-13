import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Clock, User, Bookmark } from "lucide-react";
import SocialShare from "@/components/SocialShare";
import { Link, useParams } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* CDN image URLs */
const IMG = {
  cemac: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/cKOkqXwvCEGzMsUQ.jpg",
  gabon: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/ufPCeWOQxrZNjANy.jpg",
  ceeacVert: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/bouvLYpOwMPwrZVh.jpg",
  cultureConcert: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/OddcsXlrdntxupnS.jpg",
  culturePortrait: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/MsiRkJOHcDfupLNH.jpg",
  gweth1: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/kSvSfdRauRkMtfaJ.jpg",
  gweth2: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/oPJqfcvEEYEtTaYB.jpg",
  ecoVerte: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/nlkVQeeaJhCivjDJ.jpg",
  ecoVerte2: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/PCoXzDyWdHwRLfKw.jpg",
  emploisVerts: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/oTOnqHICldnZxqIH.jpg",
  emploisVerts2: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/QiTAGzgXqbChMWfS.jpg",
  mackosso1: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/ARoCDHZWpDwKcVeV.jpg",
  mackosso2: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/YhRXSzuZRDDtDhSS.jpg",
};

/* Articles de démonstration indexés par slug */
const sampleArticles: Record<string, {
  title: string; rubrique: string; author: string; date: string; readTime: string;
  chapo: string; content: string; image: string;
  infobox: { label: string; value: string }[];
}> = {
  "cemac-panne-seche": {
    title: "Panne sèche à la CEMAC — Crise financière et ajustements budgétaires",
    rubrique: "Dossier Central",
    author: "La Rédaction Habari",
    date: "Février 2026",
    readTime: "15 min",
    image: IMG.cemac,
    chapo: "La CEMAC traverse une crise existentielle. Suspension des activités de la Commission, arriérés de contributions, dette souveraine hors de contrôle. Habari décrypte les ressorts de cette panne sèche et les leviers de relance pour les six économies de la zone.",
    infobox: [
      { label: "Habitants CEMAC", value: "58M" },
      { label: "PIB cumulé", value: "~105 Mds $" },
      { label: "Croissance moy.", value: "3,1%" },
      { label: "Pays membres", value: "6" },
    ],
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
  "gabon-oligui-mur-argent": {
    title: "Gabon — Oligui Nguema face au mur de l'argent : la renaissance à crédit",
    rubrique: "Enquête",
    author: "La Rédaction Habari",
    date: "Février 2026",
    readTime: "12 min",
    image: IMG.gabon,
    chapo: "Le Gabon affiche une ambition économique tous azimuts. Mais derrière la volonté politique se cache une équation plus dure : transformer l'économie avant que la contrainte budgétaire ne l'impose. Entre grands projets et réalités comptables, enquête sur un pays qui parie gros.",
    infobox: [
      { label: "PIB Gabon", value: "~20 Mds $" },
      { label: "Dette/PIB", value: "~55%" },
      { label: "Pop.", value: "2,4M" },
      { label: "Pétrole/Export", value: "~70%" },
    ],
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
  "ceeac-paradoxe-vert": {
    title: "La CEEAC face au paradoxe vert — Capital naturel d'envergure mondiale, captation financière marginale",
    rubrique: "Dossier Stratégique",
    author: "La Rédaction Habari",
    date: "Février 2026",
    readTime: "14 min",
    image: IMG.ceeacVert,
    chapo: "30 % des forêts tropicales mondiales, 107 GW de potentiel hydroélectrique, mais seulement 0,8 Md$ de finance verte captée par an. La CEEAC dispose d'un capital naturel d'envergure mondiale mais ne parvient pas à le monétiser. Analyse des blocages et des leviers de retournement.",
    infobox: [
      { label: "Forêts tropicales", value: "30% mondial" },
      { label: "Potentiel hydro", value: "107 GW" },
      { label: "Finance verte/an", value: "0,8 Md$" },
      { label: "Crédits carbone", value: "<1% mondial" },
    ],
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
<p>La création d'un marché régional du carbone, adossé à un registre commun et à des standards harmonisés, pourrait transformer la donne. L'initiative de la Commission des forêts d'Afrique centrale (COMIFAC) va dans ce sens, mais elle manque encore de moyens et de volonté politique.</p>
<p>Le mécanisme REDD+ (Réduction des émissions liées à la déforestation et à la dégradation des forêts) offre un cadre prometteur. Le Gabon a été le premier pays africain à recevoir un paiement basé sur les résultats pour la réduction de la déforestation, ouvrant la voie à d'autres pays de la région.</p>
<p>Enfin, le développement de l'hydroélectricité, avec des projets structurants comme Inga III, pourrait positionner la CEEAC comme fournisseur d'énergie propre pour l'ensemble du continent. Mais ces projets nécessitent des investissements colossaux et une gouvernance irréprochable pour attirer les financements internationaux.</p>
    `,
  },
  "interview-gweth-cemac": {
    title: "Dr Guy Gweth : \u00ab Aucune intégration ne progresse sans leadership et volonté de puissance \u00bb",
    rubrique: "La Grande Interview",
    author: "La Rédaction Habari",
    date: "Février 2026",
    readTime: "12 min",
    image: IMG.gweth1,
    chapo: "Entre crise financière, dette souveraine et ajustements budgétaires, les six économies de la CEMAC cherchent un nouveau souffle. Dr Guy Gweth, Président du CAVIE et consultant international en intelligence stratégique, dévoile les ressorts de cette crise et les leviers d'une relance.",
    infobox: [
      { label: "Invité", value: "Dr Guy Gweth" },
      { label: "Fonction", value: "Président du CAVIE" },
      { label: "Expertise", value: "Intelligence économique" },
      { label: "Ouvrage", value: "Puissance 237" },
    ],
    content: `
<p class="italic text-muted-foreground">Dr Guy GWETH est Président du Centre africain de veille et d'intelligence économique (CAVIE), consultant international en intelligence stratégique et due diligence depuis 15 ans, et responsable du Programme « Doing Business in Africa » à Centrale Supélec et l'EMLyon depuis 2012.</p>

<img src="${IMG.gweth2}" alt="Dr Guy Gweth" class="w-full rounded-lg my-6 max-h-[500px] object-cover" />

<h2>Une crise de trésorerie récurrente</h2>
<p><strong>HABARI :</strong> Le 5 février dernier, la CEMAC a suspendu une partie de ses activités, faute de trésorerie. Quelle réflexion vous suggèrent ces nouvelles alarmantes ?</p>
<p><strong>Guy GWETH :</strong> Il s'agit d'une situation certes embarrassante, mais il faut garder à l'esprit qu'elle est récurrente. Les organisations en charge de l'intégration régionale en Afrique centrale sont très souvent sous tension de trésorerie pour une raison très simple : les États membres ne veulent pas implémenter les mécanismes de financement qu'ils ont eux-mêmes adoptés. Pour la CEMAC, la Taxe Communautaire d'Intégration (TCI) a pourtant été sanctuarisée par l'acte additionnel du 14 décembre 2000, puis renforcée en 2009 et 2016. Voir l'institution s'arrêter aujourd'hui témoigne d'un manque de volonté politique flagrant plutôt que d'une fatalité économique.</p>

<h2>La mort programmée de la CEMAC ?</h2>
<p><strong>HABARI :</strong> Peut-on affirmer, comme certains journaux l'ont fait, que c'est la mort programmée de la CEMAC et la fin de l'intégration régionale en Afrique centrale ?</p>
<p><strong>Guy GWETH :</strong> Non, je ne souscris pas à cette vision funeste. Cette crise est un signal d'alarme, une énième zone de turbulences. Cependant, elle est révélatrice de fragilités structurelles profondes qui obligent à repenser sérieusement le modèle institutionnel. L'avenir dépendra de la capacité de nos États à réformer les mécanismes communautaires, à restaurer une discipline budgétaire réelle et à renforcer une coopération qui, pour l'instant, semble plus théorique qu'opérationnelle sur le terrain des échanges réels.</p>

<h2>Des arriérés de 263,4 milliards de FCFA</h2>
<p><strong>HABARI :</strong> Certains observateurs estiment que la CEMAC est prise en étau entre des États membres exsangues, des bailleurs devenus méfiants et une gouvernance institutionnelle vidée de sa substance politique. Est-ce votre analyse ?</p>
<p><strong>Guy GWETH :</strong> L'analyse est pertinente. Le recouvrement de la Taxe Communautaire d'Intégration est largement insuffisant parce que plusieurs États retiennent délibérément ces recettes dans leurs budgets nationaux au lieu de les transférer à la Commission. Au 31 décembre 2025, les arriérés ont été estimés à 263,4 milliards de FCFA. Seuls deux pays, le Cameroun et le Gabon, s'acquittent de leurs obligations. Certains États n'ont absolument rien reversé alors qu'ils ont effectivement prélevé la taxe auprès des usagers.</p>

<h2>Le paradoxe des matières premières</h2>
<p><strong>HABARI :</strong> Comment expliquer que dans une zone économique riche en matières premières, les États soient tous structurellement en difficulté ?</p>
<p><strong>Guy GWETH :</strong> Ce paradoxe s'explique simplement par la fragilité du modèle économique hérité de la colonisation : la collecte des revenus à partir de l'exportation brute des matières premières. De nombreux plans ont été élaborés, à l'instar du Programme Économique Régional de la CEMAC, mais les réformes sont diversement mises en œuvre et les résultats restent mitigés. L'absence de réformes sérieuses pour l'industrialisation et la transformation structurelle des économies est la raison centrale de cette précarité. Sans cette mutation, la richesse du sous-sol ne sera jamais un bouclier contre l'érosion monétaire.</p>

<h2>Le leadership absent du Cameroun</h2>
<p><strong>HABARI :</strong> Certains pointent l'absence d'un véritable leadership régional. Le Cameroun semble avoir renoncé à son leadership. Cette vision vous semble-t-elle pertinente ?</p>
<p><strong>Guy GWETH :</strong> On peut répondre par l'affirmative sans trop risquer de se tromper. L'expérience des processus d'intégration régionale qui réalisent des progrès montre qu'il est indispensable d'avoir au moins un État locomotive. Le Cameroun représente 42,1 % du PIB nominal de la CEMAC fin 2024 et supporte presque la moitié du financement de l'organisation. Pourtant, il n'exerce pas pleinement son rôle de leader, contrairement à la Côte d'Ivoire ou au Nigeria qui impulsent les dynamiques au sein de l'UEMOA et de la CEDEAO.</p>

<h2>Puissance 237 : une stratégie de puissance régionale</h2>
<p><strong>HABARI :</strong> Vous avez écrit « Puissance 237 : pour une stratégie de puissance régionale 2025-2050 ». Le Cameroun détient-il toujours les clés du leadership de la sous-région ?</p>
<p><strong>Guy GWETH :</strong> C'est tout l'enjeu de l'initiative « Puissance 237 ». Il s'agit d'une stratégie holistique visant à hisser le Cameroun au sommet du continent dans ce quart de siècle en s'appuyant sur le triptyque hard power, soft power et smart power. Pour atteindre ce but, le Cameroun doit impérativement assumer son leadership démographique, économique et financier dans la zone CEMAC. Yaoundé détient les clés de ce rayonnement, mais il doit accepter d'en devenir la force motrice et l'architecte, car aucune intégration ne progresse sans une volonté de puissance assumée au service du collectif.</p>

<h2>Les solutions pour relever la CEMAC</h2>
<p><strong>HABARI :</strong> Quelles seraient les solutions à envisager pour relever la CEMAC ?</p>
<p><strong>Guy GWETH :</strong> La priorité absolue est que les États appliquent de manière stricte les actes concernant le financement autonome de la communauté. Les ressources prélevées par les administrations douanières doivent être entièrement et immédiatement reversées. Ensuite, il faut veiller à l'application des règles de bonne gouvernance financière au sein des organisations elles-mêmes. Enfin, il est crucial de mettre sérieusement en œuvre les réformes visant l'industrialisation et la valorisation du contenu local.</p>

<h2>Les scénarios à court, moyen et long terme</h2>
<p><strong>HABARI :</strong> Quels scénarios voyez-vous ?</p>
<p><strong>Guy GWETH :</strong> À court terme, nous pourrions tout à fait voir la CEEAC sombrer dans une crise de trésorerie similaire à celle de la CEMAC, car les causes sont identiques. À moyen terme, si rien n'est fait pour automatiser le recouvrement de la taxe, l'intégration restera purement formelle et déconnectée des réalités économiques. À long terme, le scénario de référence porté par « Puissance 237 » est celui d'un Cameroun leader qui, en transformant son économie et en stabilisant la zone, entraîne ses voisins vers une prospérité partagée. C'est le passage d'une intégration de survie à une intégration de puissance.</p>

<p class="text-sm text-muted-foreground italic mt-8">(*) Guy GWETH a été enseignant à l'École de guerre économique de Paris, à l'IHEDN, à l'ESG Paris et à la BGFI Business School de Libreville. Ancien de l'École de guerre économique de Paris, il est lauréat de l'Executive Doctorate in Public Affairs de l'Université Paris Dauphine-PSL. Auteur de « Puissance 237 » et « 100 chroniques de guerre économique ». Plus d'infos sur guy-gweth.com</p>
    `,
  },
  "economie-verte-doctrine-competitivite": {
    title: "L'\u00e9conomie verte, nouvelle doctrine de comp\u00e9titivit\u00e9 pour l'Afrique Centrale",
    rubrique: "Dossier Central \u2014 \u00c9conomie & Strat\u00e9gie",
    author: "La R\u00e9daction Habari",
    date: "F\u00e9vrier 2026",
    readTime: "18 min",
    image: IMG.ecoVerte,
    chapo: "La transition climatique mondiale redistribue les cartes de la comp\u00e9titivit\u00e9 \u00e9conomique. Pour la zone CEEAC \u2014 11 pays, plus de 200 millions d\u2019habitants, 240 millions d\u2019hectares de for\u00eats tropicales \u2014, cette recomposition n\u2019est pas une contrainte suppl\u00e9mentaire. C\u2019est, \u00e0 condition de la saisir avec lucidit\u00e9, une opportunit\u00e9 historique de repositionnement.",
    infobox: [
      { label: "For\u00eats tropicales", value: "30% mondial" },
      { label: "Flux climat mondiaux", value: ">600 Mrd$/an" },
      { label: "Cr\u00e9dit carbone premium", value: "10-20 $/t" },
      { label: "Part CEEAC finance verte", value: "<0,2%" },
    ],
    content: `
<h2>I. Le basculement strat\u00e9gique : du narratif \u00e9cologique au calcul \u00e9conomique</h2>
<p>L\u2019\u00e9conomie verte n\u2019est plus un suppl\u00e9ment d\u2019\u00e2me. Elle s\u2019affirme d\u00e9sormais comme une doctrine industrielle \u00e0 part enti\u00e8re, port\u00e9e par des d\u00e9cisions souveraines des grandes puissances. L\u2019Europe taxe les \u00e9missions carbones aux fronti\u00e8res (CBAM). Les \u00c9tats-Unis ont mobilis\u00e9 plus de 369 milliards de dollars via l\u2019Inflation Reduction Act pour subventionner leur transition industrielle. La Chine, elle, s\u00e9curise m\u00e9thodiquement les minerais critiques qui alimenteront les batteries de demain.</p>
<p>Face \u00e0 ce r\u00e9alignement g\u00e9opolitique de grande ampleur, l\u2019Afrique Centrale se retrouve dans une position paradoxale : elle d\u00e9tient une part d\u00e9cisive des actifs dont d\u00e9pend cette transition mondiale \u2014 30 % des for\u00eats tropicales de la plan\u00e8te, les r\u00e9serves de cobalt les plus importantes du monde en RDC, le mangan\u00e8se du Gabon, un potentiel hydro\u00e9lectrique qui reste sous-exploit\u00e9 \u2014 mais continue d\u2019en exporter la valeur brute, sans en ma\u00eetriser la structuration financi\u00e8re ni la n\u00e9gociation.</p>
<p>La transition mondiale se finance. La vraie question que doit se poser chaque d\u00e9cideur de la r\u00e9gion est une question de positionnement : <strong>la CEEAC sera-t-elle fournisseur de mati\u00e8re premi\u00e8re ou architecte de valeur ?</strong></p>

<blockquote>\u00ab La raret\u00e9 n\u2019est pas l\u2019argent. La raret\u00e9 est la structuration. Les pays de la CEEAC captent une part marginale des flux climatiques mondiaux non par manque de ressources, mais par d\u00e9ficit d\u2019ing\u00e9nierie financi\u00e8re locale. \u00bb<br/><em>\u2014 Analyse Habari, 2026</em></blockquote>

<h2>II. O\u00f9 est l\u2019argent ? Trois fili\u00e8res de valeur que la r\u00e9gion ne ma\u00eetrise pas encore</h2>

<h3>Les march\u00e9s carbone : un actif mal valoris\u00e9</h3>
<p>Le march\u00e9 volontaire du carbone a d\u00e9pass\u00e9 les 2 milliards de dollars de valeur annuelle. Les cr\u00e9dits forestiers de haute qualit\u00e9, une fois certifi\u00e9s, se n\u00e9gocient entre 10 et 20 dollars la tonne selon Ecosystem Marketplace. La RDC, le Gabon et le Congo-Brazzaville pourraient th\u00e9oriquement g\u00e9n\u00e9rer des centaines de millions de dollars par an via les m\u00e9canismes REDD+, les march\u00e9s volontaires et les accords bilat\u00e9raux climat.</p>
<p>Mais la valeur r\u00e9elle n\u2019est pas dans la vente brute du cr\u00e9dit. Elle r\u00e9side dans la structuration financi\u00e8re du projet, la certification, la tra\u00e7abilit\u00e9 digitale et la capacit\u00e9 \u00e0 n\u00e9gocier en direct avec des corporates internationaux qui cherchent des compensations cr\u00e9dibles pour leurs propres engagements ESG.</p>

<img src="${IMG.ecoVerte2}" alt="For\u00eats tropicales du bassin du Congo" class="w-full rounded-lg my-6 max-h-[400px] object-cover" />

<h3>Les financements climatiques multilat\u00e9raux : des flux qui passent \u00e0 c\u00f4t\u00e9</h3>
<p>Les flux climatiques mondiaux d\u00e9passent 600 milliards de dollars par an selon la Climate Policy Initiative. Le Fonds Vert pour le Climat (GCF), la Banque mondiale, la BAD et les fonds bilat\u00e9raux europ\u00e9ens constituent autant de canaux mobilisables. Pourtant, les pays de la CEEAC n\u2019en captent qu\u2019une fraction marginale, faute de projets bancables, d\u2019ing\u00e9nierie financi\u00e8re locale et de pipelines d\u2019investissement structur\u00e9s.</p>
<p>La contrainte n\u2019est pas financi\u00e8re. Les capitaux existent, en abondance. La contrainte est organisationnelle et institutionnelle : la capacit\u00e9 \u00e0 formuler des projets, \u00e0 les documenter selon les standards internationaux, \u00e0 les porter devant les comit\u00e9s d\u2019investissement. C\u2019est l\u00e0 qu\u2019il faut investir en priorit\u00e9.</p>

<h3>Les minerais critiques : de la rente \u00e0 la cha\u00eene de valeur</h3>
<p>La transition \u00e9nerg\u00e9tique mondiale repose sur quatre minerais dont l\u2019Afrique Centrale est l\u2019un des principaux d\u00e9positaires : cobalt, mangan\u00e8se, lithium et nickel. Aujourd\u2019hui, le sch\u00e9ma est immuable depuis des d\u00e9cennies : extraction locale, transformation hors continent, valeur capt\u00e9e en Asie. Les \u00e9conomies africaines encaissent le revenu de la rente, jamais la marge industrielle.</p>
<p>Transformer ce mod\u00e8le suppose d\u2019avancer sur plusieurs fronts simultan\u00e9ment : d\u00e9velopper des capacit\u00e9s de raffinage local, cr\u00e9er des zones \u00e9conomiques sp\u00e9ciales bas-carbone attractives pour les industriels, nouer des joint-ventures avec les op\u00e9rateurs internationaux qui cherchent \u00e0 s\u00e9curiser leur approvisionnement.</p>

<h2>III. Quel mod\u00e8le \u00e9conomique pour la CEEAC ? Trois trajectoires, trois niveaux d\u2019ambition</h2>

<div class=\"overflow-x-auto my-6\"><table class=\"w-full text-sm border border-gray-200\"><thead><tr class=\"bg-[oklch(0.30_0.08_155)] text-white\"><th class=\"px-4 py-3 text-left\">Mod\u00e8le</th><th class=\"px-4 py-3 text-left\">Approche</th><th class=\"px-4 py-3 text-left\">R\u00e9sultats attendus</th></tr></thead><tbody><tr class=\"border-b\"><td class=\"px-4 py-3 font-medium\">Fournisseur d\u2019actifs naturels</td><td class=\"px-4 py-3\">Vente de cr\u00e9dits carbone bruts, export de minerais non transform\u00e9s, financements concessionnels</td><td class=\"px-4 py-3\">Croissance d\u00e9pendante, faible captation de valeur, vuln\u00e9rabilit\u00e9 aux prix mondiaux</td></tr><tr class=\"border-b bg-muted/30\"><td class=\"px-4 py-3 font-medium\">Plateforme de transformation verte</td><td class=\"px-4 py-3\">Certification carbone r\u00e9gionale, transformation partielle des minerais, partenariats industriels</td><td class=\"px-4 py-3\">Mont\u00e9e en gamme, emplois qualifi\u00e9s, am\u00e9lioration de la balance commerciale</td></tr><tr><td class=\"px-4 py-3 font-medium\">Doctrine industrielle int\u00e9gr\u00e9e</td><td class=\"px-4 py-3\">Politique industrielle r\u00e9gionale align\u00e9e climat, taxonomie verte, obligations souveraines vertes</td><td class=\"px-4 py-3\">Avantage comparatif durable, repositionnement g\u00e9opolitique, attractivit\u00e9 ESG maximale</td></tr></tbody></table></div>

<p>La trajectoire du fournisseur d\u2019actifs naturels est la voie du moindre effort et du moindre retour. La plateforme de transformation verte repr\u00e9sente une mont\u00e9e en gamme cr\u00e9dible \u00e0 moyen terme. <strong>La doctrine industrielle int\u00e9gr\u00e9e est la seule voie qui offre un avantage comparatif durable</strong> \u2014 mais elle exige une coordination r\u00e9gionale que la CEEAC peine encore \u00e0 mettre en \u0153uvre.</p>

<h2>IV. Le retour sur investissement : quatre niveaux de valeur</h2>

<h3>Le niveau macro\u00e9conomique</h3>
<p>Une trajectoire ESG cr\u00e9dible et document\u00e9e am\u00e9liore la notation souveraine des \u00c9tats, r\u00e9duisant le co\u00fbt de leur dette externe. La diversification des recettes publiques au-del\u00e0 des exportations p\u00e9troli\u00e8res et mini\u00e8res brutes r\u00e9duit la vuln\u00e9rabilit\u00e9 aux chocs externes.</p>

<h3>Le niveau industriel</h3>
<p>La cr\u00e9ation de cha\u00eenes de valeur r\u00e9gionale autour des ressources naturelles g\u00e9n\u00e8re des emplois qualifi\u00e9s, stimule les transferts de technologie et densifie le tissu \u00e9conomique local. L\u2019industrialisation l\u00e9g\u00e8re adoss\u00e9e aux ressources est le premier \u00e9chelon d\u2019une souverainet\u00e9 \u00e9conomique r\u00e9elle.</p>

<h3>Le niveau financier</h3>
<p>Les march\u00e9s de capitaux accordent des conditions pr\u00e9f\u00e9rentielles aux \u00e9metteurs qui s\u2019engagent sur des trajectoires de durabilit\u00e9 v\u00e9rifiables. Les green bonds souverains, la blended finance et les instruments de dette verte permettent d\u2019acc\u00e9der \u00e0 des ressources longues \u00e0 co\u00fbt r\u00e9duit.</p>

<h3>Le niveau r\u00e9putationnel et g\u00e9opolitique</h3>
<p>Un positionnement r\u00e9gional structur\u00e9 sur le capital naturel renforce le poids des n\u00e9gociations dans les enceintes internationales \u2014 COP, G20, accords commerciaux. La CEEAC cesse d\u2019\u00eatre un b\u00e9n\u00e9ficiaire passif de l\u2019aide climatique pour devenir un acteur qui n\u00e9gocie en position de force.</p>

<h2>V. Les risques \u00e0 ne pas sous-estimer</h2>
<p>L\u2019\u00e9conomie verte n\u2019est pas exempte de pi\u00e8ges. Le <strong>greenwashing institutionnel</strong> \u2014 afficher des engagements sans les tenir \u2014 \u00e9rode rapidement la cr\u00e9dibilit\u00e9 et ferme l\u2019acc\u00e8s aux march\u00e9s de capitaux les plus exigeants. La sp\u00e9culation carbone non r\u00e9gul\u00e9e peut g\u00e9n\u00e9rer des distorsions et des scandales qui fragilisent l\u2019ensemble de l\u2019\u00e9difice.</p>
<p>Le risque le plus s\u00e9rieux est peut-\u00eatre le plus insidieux : vendre aujourd\u2019hui des actifs strat\u00e9giques \u00e0 bas prix, sous pression de la dette \u00e0 court terme, sans construire l\u2019\u00e9cosyst\u00e8me local qui permettra d\u2019en capter la valeur durablement. Une concession foresti\u00e8re brad\u00e9e \u00e0 un fonds carbone international dans des conditions opaques produit l\u2019exact inverse du r\u00e9sultat souhait\u00e9.</p>
<p><strong>L\u2019\u00e9conomie verte exige de la discipline institutionnelle, de la transparence et une vision \u00e0 long terme.</strong></p>

<h2>VI. L\u2019enjeu d\u00e9cisif : la gouvernance r\u00e9gionale</h2>
<p>La question de la gouvernance \u00e9conomique r\u00e9gionale est le n\u0153ud central de l\u2019\u00e9quation. La CEEAC peut-elle harmoniser ses cadres r\u00e9glementaires pour \u00e9viter le dumping entre \u00c9tats membres ? Peut-elle cr\u00e9er une taxonomie r\u00e9gionale des activit\u00e9s vertes \u2014 un r\u00e9f\u00e9rentiel commun qui parle aux investisseurs internationaux ? Peut-elle structurer une bourse carbone CEEAC qui permette une valorisation collective des actifs forestiers plut\u00f4t qu\u2019une n\u00e9gociation atomis\u00e9e ?</p>
<p>Sans coordination r\u00e9gionale, chaque \u00c9tat se retrouve \u00e0 n\u00e9gocier isol\u00e9ment face \u00e0 des multinationales et des fonds souverains parfaitement structur\u00e9s. Le rapport de force est d\u00e9favorable par d\u00e9faut. L\u2019int\u00e9gration r\u00e9gionale est le premier levier de r\u00e9\u00e9quilibrage.</p>
<p>La mutualisation de l\u2019ing\u00e9nierie financi\u00e8re \u2014 cr\u00e9er un centre r\u00e9gional d\u2019expertise en structuration de projets verts \u2014 serait un investissement \u00e0 fort retour. L\u2019Afrique Centrale doit se doter de l\u2019\u00e9quivalent.</p>

<h2>Conclusion</h2>
<p><strong>L\u2019\u00e9conomie verte n\u2019est pas un secteur. C\u2019est une doctrine de comp\u00e9titivit\u00e9.</strong></p>
<p>La r\u00e9gion d\u00e9tient les actifs. Les financements existent. Les march\u00e9s sont ouverts. La seule variable d\u00e9cisive reste la capacit\u00e9 \u00e0 structurer, \u00e0 n\u00e9gocier et \u00e0 industrialiser. Ce n\u2019est pas une question environnementale. C\u2019est une question de souverainet\u00e9 \u00e9conomique. Habari ne traite pas le climat comme une cause. Il le traite comme une \u00e9quation \u2014 dont les d\u00e9cideurs de l\u2019Afrique Centrale doivent ma\u00eetriser chaque terme.</p>

<p class="text-sm text-muted-foreground italic mt-8">Tribune d\u2019analyse strat\u00e9gique \u00b7 HABARI, Le Magazine \u00c9conomique de l\u2019Afrique Centrale<br/>Sources : Ecosystem Marketplace \u2022 Climate Policy Initiative \u2022 Banque mondiale \u2022 CEEAC</p>
    `,
  },
  "emplois-verts-ceeac": {
    title: "Emplois verts en CEEAC : le potentiel existe, la structuration manque",
    rubrique: "Business & Innovation",
    author: "La R\u00e9daction Habari",
    date: "F\u00e9vrier 2026",
    readTime: "12 min",
    image: IMG.emploisVerts,
    chapo: "Aquaculture, horticulture, hydro\u00e9lectricit\u00e9, \u00e9nergie solaire : des initiatives portent leurs fruits. Mais transformer des projets isol\u00e9s en moteur d\u2019emploi r\u00e9gional exige bien davantage qu\u2019un catalogue de bonnes pratiques.",
    infobox: [
      { label: "Emplois verts potentiels", value: "10M" },
      { label: "Emplois hydro\u00e9lectriques RDC", value: "16 000" },
      { label: "Entreprises \u00e9nerg\u00e9tiques", value: "600" },
      { label: "Emplois CEMAC 2025", value: "15 000" },
    ],
    content: `
<p>Dix millions d\u2019emplois verts. C\u2019est l\u2019horizon que la zone CEEAC pourrait atteindre d\u2019ici 2030 si ses onze \u00c9tats membres parviennent \u00e0 transformer leur capital naturel en machine productive. Les signaux existent, \u00e9pars et encourageants. Ce qui fait d\u00e9faut, ce n\u2019est pas la ressource ni m\u00eame la volont\u00e9. C\u2019est la capacit\u00e9 \u00e0 passer de l\u2019initiative au syst\u00e8me.</p>

<h2>I. Un virage productif en train de s\u2019op\u00e9rer</h2>
<h3>Des chantiers concrets, des r\u00e9sultats mesurables</h3>
<p>Il faut se garder du scepticisme de fa\u00e7ade. Dans plusieurs pays de la r\u00e9gion, l\u2019emploi vert n\u2019est pas un concept de rapport de conf\u00e9rence : c\u2019est d\u00e9j\u00e0 une r\u00e9alit\u00e9 qui se construit, projet par projet, fili\u00e8re par fili\u00e8re. Les exemples qui \u00e9mergent de la zone CEEAC m\u00e9ritent d\u2019\u00eatre lus non comme des anecdotes, mais comme des preuves de concept \u2014 des d\u00e9monstrations que le mod\u00e8le fonctionne lorsque les conditions minimales sont r\u00e9unies.</p>
<p>Au Cameroun, <strong>Agro World Group</strong> incarne une ambition r\u00e9solument industrielle dans le secteur aquacole. Son projet d\u2019\u00e9levage intensif de tilapia pr\u00e9voit cinq cents emplois directs \u00e0 terme, tout en visant l\u2019autosuffisance en prot\u00e9ines animales \u00e0 l\u2019\u00e9chelle locale. Ce n\u2019est pas un projet pilote \u00e0 petite \u00e9chelle : c\u2019est un mod\u00e8le \u00e9conomique pens\u00e9 pour se r\u00e9pliquer. Dans le m\u00eame pays, <strong>AgriZoom</strong> attaque un probl\u00e8me structurel longtemps ignor\u00e9 des strat\u00e9gies de d\u00e9veloppement agricole \u2014 les pertes post-r\u00e9colte \u2014 en cr\u00e9ant dans son sillage des emplois ruraux stables pour des populations habituellement exclues des circuits formels.</p>
<p>\u00c0 Sao Tom\u00e9-et-Pr\u00edncipe, plus discret mais tout aussi r\u00e9v\u00e9lateur, la <strong>coop\u00e9rative des horticulteurs de Santa Clara</strong>, accompagn\u00e9e par la FAO, g\u00e9n\u00e8re des emplois d\u00e9cents pour les jeunes et les femmes dans les zones rurales, freinant un exode qui vide les campagnes de leur substance productive.</p>

<blockquote>\u00ab L\u2019emploi vert en Afrique Centrale ne na\u00eetra pas d\u2019un grand soir institutionnel. Il se construit fili\u00e8re apr\u00e8s fili\u00e8re, dans les interstices que l\u2019\u00c9tat n\u2019occupe pas encore. \u00bb<br/><em>\u2014 Analyse Habari, 2026</em></blockquote>

<h2>II. L\u2019\u00e9nergie comme premier levier de masse</h2>
<h3>Hydro\u00e9lectricit\u00e9 et solaire : l\u00e0 o\u00f9 les chiffres deviennent s\u00e9rieux</h3>
<p>Si l\u2019agroalimentaire et l\u2019aquaculture g\u00e9n\u00e8rent des emplois de proximit\u00e9, \u00e0 fort ancrage territorial, c\u2019est dans le secteur \u00e9nerg\u00e9tique que les projections deviennent v\u00e9ritablement structurantes. La RDC concentre \u00e0 elle seule un potentiel hydro\u00e9lectrique parmi les plus importants de la plan\u00e8te, et les estimations de FSD Africa \u00e9voquent <strong>seize mille emplois cr\u00e9\u00e9s</strong> dans ce seul secteur d\u2019ici 2030.</p>
<p>Le programme <strong>CEMAC 2025</strong> est plus ambitieux encore dans ses projections : <strong>quinze mille emplois directs</strong> via six cents entreprises \u00e9nerg\u00e9tiques vertes \u00e0 travers la zone. Ces chiffres s\u2019appuient sur un tissu entrepreneurial en croissance, des co\u00fbts de production des \u00e9nergies renouvelables en baisse continue et une demande int\u00e9rieure en \u00e9lectricit\u00e9 qui reste structurellement insatisfaite.</p>

<img src="${IMG.emploisVerts2}" alt="Aquaculture en Afrique" class="w-full rounded-lg my-6 max-h-[400px] object-cover" />

<p>Au Cameroun, le <strong>Programme de Promotion des Emplois Verts (PPEVC)</strong>, lanc\u00e9 en 2017 par le Minist\u00e8re de l\u2019Emploi et de la Formation Professionnelle, a choisi une approche transversale : subventionner l\u2019emploi vert dans le recyclage, les \u00e9nergies renouvelables et l\u2019agriculture verte simultan\u00e9ment.</p>

<h2>III. Les initiatives r\u00e9gionales : la bonne m\u00e9thode, l\u2019ex\u00e9cution en question</h2>
<h3>PREJAC, CEMAC 2025 : des cadres prometteurs qui doivent faire leurs preuves</h3>
<p>L\u2019architecture institutionnelle n\u2019est pas absente. La CEEAC, la BAD et la FAO ont compris depuis plusieurs ann\u00e9es que l\u2019\u00e9chelle nationale \u00e9tait insuffisante pour produire un choc d\u2019emplois verts significatif. Le programme <strong>PREJAC</strong> \u2014 pour Promotion de l\u2019Employabilit\u00e9 des Jeunes dans les cha\u00eenes de valeur agricoles \u2014 s\u2019attaque pr\u00e9cis\u00e9ment au maillon le plus fragile de la cha\u00eene : l\u2019employabilit\u00e9 des jeunes ruraux, via l\u2019entrepreneuriat et l\u2019innovation agro-industrielle.</p>
<p>La question n\u2019est pas de disqualifier ces programmes. Elle est de les tenir \u00e0 l\u2019exigence des r\u00e9sultats qu\u2019ils annoncent. Quinze mille emplois \u00e9nerg\u00e9tiques via six cents entreprises : cet objectif CEMAC 2025 sera-t-il atteint ? Sur quelle base de suivi ? Avec quelle d\u00e9finition partag\u00e9e de ce qu\u2019est un \u00ab emploi vert \u00bb entre onze \u00c9tats aux r\u00e9glementations du travail h\u00e9t\u00e9rog\u00e8nes ?</p>

<div class="overflow-x-auto my-8"><table class="w-full text-sm border-collapse"><thead><tr class="bg-[oklch(0.45_0.15_145)]/10"><th class="p-3 text-left font-semibold">Projet / Initiative</th><th class="p-3 text-left font-semibold">Emplois estim\u00e9s</th><th class="p-3 text-left font-semibold">Secteur</th><th class="p-3 text-left font-semibold">Statut</th></tr></thead><tbody><tr class="border-b border-border"><td class="p-3">Agro World Group (Cameroun)</td><td class="p-3 font-bold">500 directs</td><td class="p-3">Aquaculture / Tilapia</td><td class="p-3">Op\u00e9rationnel</td></tr><tr class="border-b border-border"><td class="p-3">Coop\u00e9rative Santa Clara (STP)</td><td class="p-3 font-bold">Non chiffr\u00e9</td><td class="p-3">Horticulture durable</td><td class="p-3">En cours (FAO)</td></tr><tr class="border-b border-border"><td class="p-3">Hydro\u00e9lectricit\u00e9 RDC</td><td class="p-3 font-bold">16 000</td><td class="p-3">\u00c9nergie renouvelable</td><td class="p-3">Horizon 2030</td></tr><tr class="border-b border-border"><td class="p-3">PPEVC \u2014 Cameroun</td><td class="p-3 font-bold">Multiples</td><td class="p-3">Multi-secteurs verts</td><td class="p-3">Actif depuis 2017</td></tr><tr class="border-b border-border"><td class="p-3">PREJAC (BAD / FAO)</td><td class="p-3 font-bold">R\u00e9gional</td><td class="p-3">Agro-industrie / Jeunes</td><td class="p-3">R\u00e9gional CEEAC</td></tr><tr><td class="p-3">CEMAC 2025 \u2014 600 entreprises</td><td class="p-3 font-bold">15 000 directs</td><td class="p-3">\u00c9nergie verte</td><td class="p-3">Objectif 2025</td></tr></tbody></table></div>

<h2>IV. Ce qui manque encore</h2>
<h3>Passer de la logique de projet \u00e0 la logique de fili\u00e8re</h3>
<p><strong>Le d\u00e9ficit d\u2019ing\u00e9nierie : le vrai goulot d\u2019\u00e9tranglement.</strong> Les projets existent. Les financements, partiellement. Ce qui fait syst\u00e9matiquement d\u00e9faut, c\u2019est la capacit\u00e9 \u00e0 transformer une bonne id\u00e9e en projet bancable, puis en fili\u00e8re structur\u00e9e. La formation \u00e0 l\u2019entrepreneuriat vert ne suffit pas si les porteurs de projets ne trouvent pas ensuite de march\u00e9s, d\u2019acheteurs engag\u00e9s, de cha\u00eenes logistiques fonctionnelles.</p>
<p><strong>La certification : un enjeu sous-estim\u00e9.</strong> Pour que les emplois verts de la CEEAC atteignent les march\u00e9s premium, il faut une infrastructure de certification r\u00e9gionale. Sans elle, les producteurs locaux resteront prix-preneurs face aux interm\u00e9diaires internationaux qui captent la prime de durabilit\u00e9. Construire cette infrastructure \u2014 normes, accr\u00e9ditations, tra\u00e7abilit\u00e9 digitale \u2014 est un investissement \u00e0 fort retour, encore sous-financ\u00e9 dans la r\u00e9gion.</p>
<p><strong>L\u2019inclusion comme condition de durabilit\u00e9.</strong> Les exemples les plus solides de la zone \u2014 Santa Clara, AgriZoom \u2014 ont en commun de cibler explicitement les femmes, les jeunes et les ruraux. Ce n\u2019est pas une posture sociale. C\u2019est une strat\u00e9gie \u00e9conomique : ces segments concentrent la main-d\u2019\u0153uvre disponible et la demande insatisfaite.</p>

<h2>Conclusion</h2>
<p><strong>Le potentiel est l\u00e0. La m\u00e9thode, encore \u00e0 construire.</strong></p>
<p>Dix millions d\u2019emplois verts en CEEAC d\u2019ici 2030 : l\u2019objectif n\u2019est pas irr\u00e9aliste. Il exige cependant un changement de logique. Cesser d\u2019additionner des projets pour commencer \u00e0 construire des fili\u00e8res. Cesser de former des entrepreneurs pour commencer \u00e0 cr\u00e9er des march\u00e9s o\u00f9 ils peuvent vendre. Cesser de compter les emplois cr\u00e9\u00e9s pour commencer \u00e0 mesurer les emplois qui durent. L\u2019Afrique Centrale dispose des ressources naturelles, du capital humain et, de plus en plus, des financements. Ce qui reste \u00e0 b\u00e2tir, c\u2019est l\u2019architecture institutionnelle qui transforme ces atouts en comp\u00e9titivit\u00e9 r\u00e9elle et durable.</p>

<p class="text-sm text-muted-foreground italic mt-8">Rubrique Business & Innovation \u00b7 HABARI, Le Magazine \u00c9conomique de l\u2019Afrique Centrale<br/>Sources : FAO \u2022 BAD \u2022 FSD Africa \u2022 MINEFOP Cameroun \u2022 CEEAC \u2022 Ecosystem Marketplace</p>
    `,
  },
  "interview-mackosso-rester-debout": {
    title: "Loïc Mackosso : \u00ab Rester debout, c'est décider de se renforcer \u00bb",
    rubrique: "La Grande Interview",
    author: "La Rédaction Habari",
    date: "Février 2026",
    readTime: "10 min",
    image: IMG.mackosso1,
    chapo: "Banquier d'affaires, investisseur et conférencier, Loïc Mackosso accompagne depuis plus de 20 ans entreprises et institutions dans la structuration et le financement de projets d'envergure. Fondateur d'Aries Investissements, il publie \u00ab Rester debout, quand la résilience devient un super-pouvoir \u00bb. Un livre-confession sur la guerre, l'exil, la reconstruction et le leadership.",
    infobox: [
      { label: "Invité", value: "Loïc Mackosso" },
      { label: "Fonction", value: "Fondateur Aries Invest." },
      { label: "Secteurs", value: "Énergie, Finance" },
      { label: "Ouvrage", value: "Rester debout" },
    ],
    content: `
<p class="italic text-muted-foreground">Banquier d'affaires, investisseur et conférencier, Loïc Mackosso accompagne depuis plus de 20 ans entreprises et institutions dans la structuration et le financement de projets d'envergure. Fondateur et associé d'Aries Investissements, il intervient dans des secteurs clés tels que l'énergie, les infrastructures et les ressources naturelles. Au-delà de la finance, il partage son expertise à travers masterclasses, conférences et publications pour aider les entrepreneurs et leaders à maximiser leur impact. Passionné de leadership, sport et développement personnel, il encourage une approche équilibrée entre performance, bien-être et vision stratégique. Mais c'est comme auteur du livre \u00ab Rester debout \u00bb qu'Habari a choisi de l'interviewer.</p>

<img src="${IMG.mackosso2}" alt="Loïc Mackosso en conférence" class="w-full rounded-lg my-6 max-h-[500px] object-cover" />

<h2>La résilience comme super-pouvoir</h2>
<p><strong>HABARI :</strong> Loïc Mackosso, le sous-titre de votre livre se décline ainsi : \u00ab Quand la résilience devient un super-pouvoir \u00bb. Qu'est-ce que vous sous-entendez par cette affirmation ?</p>
<p><strong>Loïc MACKOSSO :</strong> On parle souvent de résilience comme d'une capacité à supporter les épreuves. Pour moi, ce n'est pas suffisant. La résilience devient un super-pouvoir lorsqu'elle nous transforme intérieurement. Lorsqu'elle nous donne une profondeur que les succès faciles ne donnent pas. J'ai connu la guerre, \u00ab l'exil \u00bb, la trahison, les échecs professionnels et les ruptures personnelles. À chaque étape, j'avais le choix : subir ou me structurer. La résilience, ce n'est pas encaisser. C'est décider de se renforcer. Lorsqu'elle devient une discipline mentale, elle change votre trajectoire.</p>

<h2>La genèse du livre</h2>
<p><strong>HABARI :</strong> Comment vous est venue l'idée de ce livre et qu'est-ce qui vous a poussé à l'écrire ?</p>
<p><strong>Loïc MACKOSSO :</strong> À un moment, j'ai compris que mon parcours ne m'appartenait plus seulement. Beaucoup de jeunes me voient aujourd'hui comme un chef d'entreprise. Ils ne voient pas les nuits de doute, les échecs, les moments où tout semblait s'effondrer. J'ai écrit ce livre pour montrer l'envers du décor. Pour dire que la réussite n'est jamais linéaire. Et surtout pour transmettre une chose : on peut venir d'un environnement instable et construire quelque chose de solide si l'on travaille sur son caractère autant que sur ses compétences. En outre, le départ brutal de mon ami d'enfance à un cancer du pancréas m'a également donné envie de coucher mes souvenirs. Pour moi c'était comme une thérapie.</p>

<h2>\u00ab Quoi qu'il arrive, reste debout \u00bb</h2>
<p><strong>HABARI :</strong> Les premières pages du livre racontent comment, au plus fort de la guerre civile qui a déchiré votre pays le Congo, vous avez dû quitter le pays, au terme d'un déchirement qui vous a séparé de vos parents. Lorsque vous vous séparez de votre père il vous dit : \u00ab Sois fort mon fils. Tout ira bien. N'oublie jamais : quoi qu'il arrive, tu dois rester debout \u00bb. Vous tirez de cette phrase le titre du livre \u00ab Rester debout \u00bb. Pourquoi ?</p>
<p><strong>Loïc MACKOSSO :</strong> Lorsque je quitte le Congo en pleine guerre, mon père me dit : \u00ab Quoi qu'il arrive, reste debout. \u00bb Ce n'était pas une formule. C'était un héritage. Rester debout ne signifie pas ne jamais tomber. Cela signifie garder sa dignité, ses valeurs, son cap, même quand tout vacille autour de vous. Cette phrase m'a accompagné dans chaque décision importante de ma vie. Elle est devenue ma colonne vertébrale. Cette phrase était d'autant plus forte que ni lui ni moi ne savions si nous nous reverrions. D'ailleurs il a échappé à la mort. Mes parents se sont sacrifiés pour moi, il fallait donc que je sois fort pour eux.</p>

<h2>La finance comme levier de transformation</h2>
<p><strong>HABARI :</strong> Vous êtes chef d'entreprise. Vous vous êtes au départ positionné dans un secteur, celui de la finance, dans lequel on compte très peu d'acteurs dans votre pays. Qu'est-ce qui vous y a poussé et quels obstacles avez-vous dû affronter ?</p>
<p><strong>Loïc MACKOSSO :</strong> J'ai compris très tôt que la finance est un levier de transformation. À la BDEAC, j'ai compris les difficultés qu'avaient les entreprises surtout les PME à répondre aux exigences des banques, à faire en sorte que les intérêts soient alignés. J'ai donc pensé ARIES Investissements pour servir de relais entre ces deux mondes qui avaient parfois du mal à se comprendre. De plus, structurer et financer des projets, ce n'est pas seulement faire des chiffres, c'est participer au développement d'un pays. Les obstacles ont été nombreux : la méfiance, le manque de culture financière, l'instabilité institutionnelle. Mais j'ai appris que la crédibilité ne se proclame pas. Elle se construit avec rigueur, patience et constance.</p>

<h2>Vaincre l'adversité</h2>
<p><strong>HABARI :</strong> Comment vaincre l'adversité et les obstacles dans un environnement comme celui de votre pays ? Est-ce en restant debout ? On pourrait vous rétorquer : mais on peut trébucher et se relever. On peut échouer et repartir. On pourra apprendre de cet échec.</p>
<p><strong>Loïc MACKOSSO :</strong> Bien sûr qu'on peut tomber. L'important n'est pas d'éviter la chute, mais d'en tirer une leçon stratégique. Rester debout, ce n'est pas refuser l'échec. C'est refuser qu'il vous définisse. Dans des environnements complexes, il faut développer une stabilité intérieure plus forte que l'instabilité extérieure. Les chutes sont inéluctables. Elles doivent toutefois servir de tremplin. Elles sont parfois l'occasion de se réinventer.</p>

<h2>Aries Énergies : investir dans l'avenir structurel du continent</h2>
<p><strong>HABARI :</strong> Aujourd'hui vous avez ouvert une branche Énergies dans votre société, Aries Investissements. Qu'est-ce qui vous a poussé à ouvrir ce nouveau chantier et quelles sont les perspectives objectives qu'offre ce secteur ?</p>
<p><strong>Loïc MACKOSSO :</strong> Parce que l'énergie est la base de toute transformation économique. Sans énergie, il n'y a ni industrie, ni croissance durable, ni souveraineté réelle. Investir dans ce secteur, c'est investir dans l'avenir structurel du continent. Je ne voulais pas seulement participer à des transactions, mais contribuer à des projets qui changent durablement les choses. De plus, suite à certains échecs que nous avons connus, nous avons voulu contrôler la chaîne de création de valeur de telle sorte qu'in fine ARIES Énergies puisse se servir du réseau de partenaires financiers d'ARIES Investissements et qu'elle devienne cliente de cette dernière. Là aussi c'était une manière de réinventer notre business. Les perspectives sont intéressantes. Nous travaillons sur de belles transactions.</p>

<h2>Hommes d'affaires et pouvoir</h2>
<p><strong>HABARI :</strong> Une des questions que vous abordez dans votre livre est la relation entre les hommes d'affaires et le pouvoir. Quelle est votre approche sur cette problématique ?</p>
<p><strong>Loïc MACKOSSO :</strong> Dans nos pays, l'État est un acteur central. Il faut donc une relation claire, institutionnelle et éthique. Le secteur public et privé doivent pouvoir se parler car étant dans une relation d'interdépendance. L'intégrité doit demeurer une ligne rouge. La réputation est un actif plus précieux qu'un contrat. On peut perdre un marché, mais on ne doit jamais perdre sa crédibilité.</p>

<h2>Les recettes du succès en Afrique</h2>
<p><strong>HABARI :</strong> Dans votre parcours dans le milieu du business en Afrique, quelles seraient pour vous les recettes du succès dans un environnement très souvent hostile et un climat des affaires négatif ?</p>
<p><strong>Loïc MACKOSSO :</strong> Le succès en Afrique exige de la patience stratégique, une excellence technique irréprochable, une compréhension des codes sociaux, de la psychologie de son environnement et un réseau solide. Il faut penser sur le long terme et être en mesure d'apporter des solutions pérennes. Les cycles sont longs. Ceux qui gagnent sont ceux qui tiennent dans la durée.</p>

<h2>Anglophones vs Francophones</h2>
<p><strong>HABARI :</strong> Vous rencontrez souvent des hommes d'affaires anglophones avec qui vous avez des partenariats. Qu'est-ce qui, selon vous, les différencie des francophones ?</p>
<p><strong>Loïc MACKOSSO :</strong> Je constate souvent chez les anglophones une culture plus assumée du risque et du pragmatisme. Les francophones, eux, ont une rigueur analytique et juridique très forte. L'avenir appartient à ceux qui sauront combiner audace et méthode.</p>

<h2>Conseils aux jeunes entrepreneurs africains</h2>
<p><strong>HABARI :</strong> Si vous aviez des conseils à transmettre à des jeunes africains qui veulent entreprendre, quels sont les conseils que vous leur donneriez ?</p>
<p><strong>Loïc MACKOSSO :</strong> Je leur dirais d'investir d'abord en eux-mêmes. De se former sérieusement. D'apprendre l'anglais. De lire. De construire un réseau international. Et surtout de comprendre que l'entrepreneuriat n'est pas un raccourci vers l'argent, mais un engagement exigeant. Il faut y entrer avec discipline et vision. Et quoi qu'il arrive, rester debout.</p>

<blockquote>\u00ab La résilience, ce n'est pas encaisser. C'est décider de se renforcer. Lorsqu'elle devient une discipline mentale, elle change votre trajectoire. \u00bb<br/><em>— Loïc Mackosso</em></blockquote>

<p class="text-sm text-muted-foreground italic mt-8">Loïc Mackosso est fondateur et associé d'Aries Investissements et Aries Énergies. Ancien de la BDEAC, il intervient dans les secteurs de l'énergie, des infrastructures et des ressources naturelles. Son livre \u00ab Rester debout, quand la résilience devient un super-pouvoir \u00bb est disponible sur Amazon.</p>
    `,
  },
  "akendengue-voix-continent": {
    title: "Akendengué : le retour d'un homme devenu repère",
    rubrique: "Culture & Société",
    author: "Brice MBA",
    date: "Février 2026",
    readTime: "7 min",
    image: IMG.culturePortrait,
    chapo: "Pierre Claver Akendengué, monument de la musique africaine et « pape » de la musique gabonaise, a donné deux concerts successifs, vendredi 30 et samedi 31 janvier, à l'Institut français de Libreville. Depuis fort longtemps l'artiste âgé de 82 ans n'était plus monté sur une scène. Deux soirs où une mémoire s'est remise à chanter.",
    infobox: [
      { label: "Âge", value: "82 ans" },
      { label: "Lieu", value: "Institut français, Libreville" },
      { label: "Dates", value: "30-31 janvier 2026" },
      { label: "Carrière", value: "50+ ans" },
    ],
    content: `
<p>Il arrive que la mémoire ait une voix… On l'attendait avec une curiosité presque inquiète — comme on ouvre un vieux carnet retrouvé au fond d'une malle familiale.</p>

<p>Que reste-t-il d'un artiste après un demi-siècle ? Une œuvre, sans doute. Mais surtout une présence ? La lumière s'est adoucie. Et dans ce clair-obscur est apparu Pierre-Claver Akendengué. Il ne s'est pas avancé vers la scène. Il s'y est posé.</p>

<h3>Une voix née avant les désillusions</h3>

<p>Né en 1943, formé en France à la psychologie et aux sciences humaines, Akendengué appartient à cette génération d'artistes africains qui ont accompagné la naissance morale des indépendances — puis leurs désenchantements.</p>

<p>Dans les années 1970, alors que beaucoup de musiques africaines choisissent la danse ou la fête, lui choisit la parole. Une parole lente, poétique, nourrie de contes, de philosophie et de chronique sociale.</p>

<p>Ses chansons ne racontent pas seulement des histoires : elles interrogent le destin. Il n'a jamais chanté l'actualité. Il a chanté le temps.</p>

<h3>Dans la salle : deux générations</h3>

<p>Avant même la première note, certains spectateurs souriaient déjà. Le sourire des gens qui reconnaissent un parfum avant de reconnaître une musique.</p>

<p>Dans la salle, il y avait deux publics. Ceux qui avaient vécu avec ses chansons et ceux qui allaient les découvrir. Les premiers regardaient la scène mais voyaient autre chose : une époque entière. Les seconds observaient un homme dont ils ignoraient encore pourquoi il allait les toucher.</p>

<p>Puis la voix est venue et s'est faite entendre. Elle n'avait plus la netteté des enregistrements anciens. Elle portait mieux : la matière des années. Ce n'était plus un timbre — c'était une mémoire sonore.</p>

<p>Akendengué ne chante pas pour remplir l'espace. Il chante pour l'habiter. Et peu à peu un phénomène rare s'est produit : les téléphones se sont baissés. On regardait. On écoutait vraiment.</p>

<h3>Des chansons devenues des lieux</h3>

<p>Ses mélodies ne revenaient pas comme des succès. Elles revenaient comme des souvenirs. Un quartier disparu. Un départ pour la ville. Une conversation politique à voix basse dans une cour familiale. Un espoir collectif encore intact.</p>

<p>On comprenait alors pourquoi son œuvre a traversé les décennies : elle ne dépendait pas d'une mode mais d'une expérience humaine. Il ne décrivait pas seulement l'Afrique. Il décrivait ce que les Africains ressentent face au monde.</p>

<p>On était en face d'un artiste sans époque. Dans un temps dominé par la performance, il ne performe pas. Dans un univers obsédé par la nouveauté, il ne se modernise pas. Et pourtant rien ne semble ancien. Parce que certaines œuvres vieillissent. D'autres mûrissent.</p>

<p>À 82 ans, il ne cherche plus à convaincre — il constate. Et cette sobriété touche davantage que n'importe quelle démonstration.</p>

<h3>L'ovation lente</h3>

<p>À la fin, les applaudissements ne furent pas une explosion. Ils furent une reconnaissance. On n'applaudissait pas seulement un concert. On applaudissait une continuité.</p>

<p>Les anciens saluaient leur propre jeunesse. Les jeunes saluaient un héritage qu'ils découvraient. Et tous comprenaient confusément que ce qu'ils venaient de vivre n'était pas un retour d'artiste. C'était le retour d'un repère.</p>

<h3>Après la scène</h3>

<p>En sortant, personne ne parlait fort. La nuit semblait plus vaste, presque paisible. Certains concerts excitent. D'autres rassemblent. Celui-ci apaisait.</p>

<p>Car Pierre-Claver Akendengué appartient à une catégorie rare : les artistes qui n'occupent pas seulement l'histoire culturelle d'un pays — ils accompagnent sa conscience.</p>

<p>Et ce soir-là, il n'a pas chanté le passé. Il nous a rappelé que certaines voix attendent simplement que nous grandissions assez pour les entendre.</p>
    `,
  },
};

/* Fallback par défaut */
const defaultArticle = sampleArticles["cemac-panne-seche"];

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = trpc.articles.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const displayArticle = article || null;
  const sample = (slug && sampleArticles[slug]) || defaultArticle;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <article>
          {/* Article Header with hero image */}
          <header className="relative bg-[oklch(0.20_0.02_250)]">
            {/* Hero image */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={displayArticle?.featuredImage || sample.image}
                alt={displayArticle?.title || sample.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.02_250)] via-[oklch(0.15_0.02_250)]/60 to-transparent" />
            </div>
            <div className="max-w-4xl mx-auto px-4 relative -mt-32 pb-12">
              <Link href="/magazine">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 mb-6 font-sans gap-2">
                  <ArrowLeft className="w-4 h-4" /> Retour au magazine
                </Button>
              </Link>
              <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-4">
                {displayArticle ? "Article" : sample.rubrique}
              </div>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                {displayArticle?.title || sample.title}
              </h1>
              <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-6"></div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 font-sans">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {sample.author}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {sample.readTime} de lecture
                </span>
                <span>•</span>
                <span>{displayArticle?.publishedAt ? new Date(displayArticle.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : sample.date}</span>
              </div>
            </div>
          </header>

          {/* Article Body */}
          <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
            {/* Chapô */}
            <div className="habari-chapo mb-10 pb-8 border-b border-border">
              {displayArticle?.excerpt || sample.chapo}
            </div>

            {/* Sharing bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
              <SocialShare
                title={displayArticle?.title || sample.title}
                excerpt={displayArticle?.excerpt || sample.chapo}
                variant="bar"
              />
              <Button variant="outline" size="sm" className="font-sans gap-2 text-muted-foreground">
                <Bookmark className="w-4 h-4" /> Sauvegarder
              </Button>
            </div>

            {/* Info box */}
            <div className="habari-infobox mb-10">
              <div className="habari-infobox-header">Chiffres clés</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
                {sample.infobox.map((item) => (
                  <div key={item.label}>
                    <div className="text-2xl font-bold text-primary">{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Article content */}
            <div
              className="habari-prose"
              dangerouslySetInnerHTML={{
                __html: displayArticle?.content || sample.content,
              }}
            />

            {/* En résumé box */}
            <div className="mt-12 p-6 border border-border rounded-lg bg-muted/30">
              <h3 className="font-serif font-bold text-primary text-lg mb-3">En résumé</h3>
              <p className="text-sm text-muted-foreground font-sans italic leading-relaxed">
                {slug === "gabon-oligui-mur-argent"
                  ? "Le Gabon de la transition affiche des ambitions économiques considérables mais se heurte à la réalité des contraintes budgétaires. La diversification de l'économie et la mobilisation de financements innovants seront déterminantes pour transformer les promesses en résultats tangibles."
                  : slug === "ceeac-paradoxe-vert"
                  ? "La CEEAC dispose d'un capital naturel d'envergure mondiale mais ne parvient pas à le monétiser. La création d'un marché régional du carbone, le développement de l'hydroélectricité et la structuration de projets REDD+ constituent les leviers clés pour inverser ce paradoxe."
                  : slug === "interview-gweth-cemac"
                  ? "Dr Guy Gweth plaide pour un leadership assumé du Cameroun au sein de la CEMAC, une application stricte des mécanismes de financement communautaire et une industrialisation accélérée pour sortir du modèle rentier hérité de la colonisation."
                  : slug === "economie-verte-doctrine-competitivite"
                  ? "L'économie verte s'impose comme une doctrine de compétitivité pour l'Afrique Centrale. La CEEAC détient les actifs stratégiques — forêts, minerais critiques, potentiel hydroélectrique — mais doit passer du statut de fournisseur de matière première à celui d'architecte de valeur pour capter les flux de finance verte mondiaux."
                  : slug === "emplois-verts-ceeac"
                  ? "La zone CEEAC pourrait atteindre dix millions d'emplois verts d'ici 2030, mais cela exige de passer de la logique de projet à la logique de filière. Aquaculture, hydroélectricité, solaire : les initiatives existent. Ce qui manque, c'est l'ingénierie, la certification régionale et l'inclusion systématique des jeunes, des femmes et des ruraux."
                  : slug === "interview-mackosso-rester-debout"
                  ? "Loïc Mackosso livre un témoignage puissant sur la résilience, l'entrepreneuriat en Afrique et la construction d'un parcours de banquier d'affaires dans un environnement complexe. De la guerre civile au Congo à la fondation d'Aries Investissements et Aries Énergies, il incarne une philosophie : rester debout, c'est décider de se renforcer."
                  : "La CEMAC traverse une crise institutionnelle et financière sans précédent. La réforme du financement communautaire, l'accélération de l'intégration commerciale et la mobilisation de la finance verte constituent les principaux leviers de sortie de crise."
                }
              </p>
            </div>

            {/* Bottom sharing bar */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm font-sans font-medium text-muted-foreground mb-3">Cet article vous a intéressé ? Partagez-le :</p>
              <SocialShare
                title={displayArticle?.title || sample.title}
                excerpt={displayArticle?.excerpt || sample.chapo}
                variant="bar"
              />
            </div>

            {/* Related articles CTA */}
            <div className="mt-16 pt-8 border-t border-border">
              <h3 className="font-serif font-bold text-primary text-xl mb-6">À lire également</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slug !== "interview-gweth-cemac" && (
                  <Link href="/article/interview-gweth-cemac">
                    <div className="p-5 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex gap-4">
                        <img src={IMG.gweth1} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                        <div>
                          <div className="habari-rubrique text-xs mb-1">La Grande Interview</div>
                          <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">Dr Guy Gweth : « Aucune intégration ne progresse sans leadership »</h4>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {slug !== "gabon-oligui-mur-argent" && (
                  <Link href="/article/gabon-oligui-mur-argent">
                    <div className="p-5 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex gap-4">
                        <img src={IMG.gabon} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                        <div>
                          <div className="habari-rubrique text-xs mb-1">Enquête</div>
                          <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">Gabon — Oligui Nguema face au mur de l'argent</h4>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {slug !== "ceeac-paradoxe-vert" && (
                  <Link href="/article/ceeac-paradoxe-vert">
                    <div className="p-5 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex gap-4">
                        <img src={IMG.ceeacVert} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                        <div>
                          <div className="habari-rubrique text-xs mb-1">Dossier Stratégique</div>
                          <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">La CEEAC face au paradoxe vert</h4>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {slug !== "cemac-panne-seche" && (
                  <Link href="/article/cemac-panne-seche">
                    <div className="p-5 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex gap-4">
                        <img src={IMG.cemac} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                        <div>
                          <div className="habari-rubrique text-xs mb-1">Dossier Central</div>
                          <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">Panne sèche à la CEMAC</h4>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {slug !== "economie-verte-doctrine-competitivite" && (
                  <Link href="/article/economie-verte-doctrine-competitivite">
                    <div className="p-5 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex gap-4">
                        <img src={IMG.ecoVerte} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                        <div>
                          <div className="habari-rubrique text-xs mb-1">Habari Green</div>
                          <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">L'économie verte, doctrine de compétitivité pour l'Afrique Centrale</h4>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {slug !== "emplois-verts-ceeac" && (
                  <Link href="/article/emplois-verts-ceeac">
                    <div className="p-5 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex gap-4">
                        <img src={IMG.emploisVerts} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                        <div>
                          <div className="habari-rubrique text-xs mb-1">Business & Innovation</div>
                          <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">Emplois verts en CEEAC : le potentiel existe, la structuration manque</h4>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {slug !== "interview-mackosso-rester-debout" && (
                  <Link href="/article/interview-mackosso-rester-debout">
                    <div className="p-5 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex gap-4">
                        <img src={IMG.mackosso1} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                        <div>
                          <div className="habari-rubrique text-xs mb-1">La Grande Interview</div>
                          <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">Loïc Mackosso : « Rester debout, c'est décider de se renforcer »</h4>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </article>
      )}

      <Footer />
    </div>
  );
}
