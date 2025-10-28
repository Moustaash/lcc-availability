
import { Property } from './types';

// Define IMAGES before they are used to build the PROPERTIES array.
export const IMAGES: { [key: string]: string } = {
  "cinq":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000023_01.jpg?20250514130640",
  "cahokia":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000019_03.jpg?20220808145658",
  "mathilda":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000015_01.jpg?20240826160458",
  "savoie-53":"https://chalets-de-valdisere.locvacances.com/lv/images/imme/0000000202_01.jpg?20240415145330",
  "bestview":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000013_02.jpg?20240424224857",
  "chamois":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000010_07.jpg?20240424215059",
  "papillon":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000004_01.jpg?20240827130541",
  "marie":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000014_01.jpg?20240826160424",
  "face":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000003_01.jpg?20240826160256",
  "lievre-blanc":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000016_01.jpg?20240827100545",
  "fleche":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000009_01.jpg?20240424220737",
  "alice":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000017_03.jpg?20240827130541",
  "anemones":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000021_08.jpg?20241005000533",
  "sifflotte":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000001_03.jpg?20240424223339",
  "etoile":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000008_01.jpg?20240424220148",
  "ourson":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000002_01.jpg?20240424221903",
  "piou":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000002_01.jpg?20240424221903",
  "flocon":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000006_01.jpg?20240424221247",
  "blanchot":"https://chalets-de-valdisere.locvacances.com/lv/images/lot/0000000005_01.jpg?20240424215859"
};

const RAW_PROPERTIES: Omit<Property, 'imageUrl'>[] = [
  {nameFR:"Alice",nameEN:"Alice",nameES:"Alice",slug:"alice"},
  {nameFR:"Anémones",nameEN:"Anémones",nameES:"Anémones",slug:"anemones"},
  {nameFR:"Bestview",nameEN:"Bestview",nameES:"Bestview",slug:"bestview"},
  {nameFR:"Blanchot",nameEN:"Blanchot",nameES:"Blanchot",slug:"blanchot"},
  {nameFR:"Cahokia",nameEN:"Cahokia",nameES:"Cahokia",slug:"cahokia"},
  {nameFR:"Chamois",nameEN:"Chamois",nameES:"Chamois",slug:"chamois"},
  {nameFR:"Cinq",nameEN:"Cinq",nameES:"Cinq",slug:"cinq"},
  {nameFR:"Étoile",nameEN:"Étoile",nameES:"Étoile",slug:"etoile"},
  {nameFR:"Face",nameEN:"Face",nameES:"Face",slug:"face"},
  {nameFR:"Flèche",nameEN:"Flèche",nameES:"Flèche",slug:"fleche"},
  {nameFR:"Flocon",nameEN:"Flocon",nameES:"Flocon",slug:"flocon"},
  {nameFR:"Lièvre Blanc",nameEN:"Lièvre Blanc",nameES:"Lièvre Blanc",slug:"lievre-blanc"},
  {nameFR:"Marie",nameEN:"Marie",nameES:"Marie",slug:"marie"},
  {nameFR:"Mathilda",nameEN:"Mathilda",nameES:"Mathilda",slug:"mathilda"},
  {nameFR:"Ourson",nameEN:"Ourson",nameES:"Ourson",slug:"ourson"},
  {nameFR:"Papillon",nameEN:"Papillon",nameES:"Papillon",slug:"papillon"},
  {nameFR:"Fusée",nameEN:"Fusée",nameES:"Fusée",slug:"piou"},
  {nameFR:"Savoie",nameEN:"Savoie",nameES:"Savoie",slug:"savoie-53"},
  {nameFR:"Sifflotte",nameEN:"Sifflotte",nameES:"Sifflotte",slug:"sifflotte"}
];

export const PROPERTIES: Property[] = RAW_PROPERTIES.map(p => ({ 
  ...p, 
  imageUrl: IMAGES[p.slug] 
}));

export const NOCODB_CLIENT_URL_TEMPLATE = "https://nocodb.example.com/dashboard/#/nc/project_name/table/Clients/ID_PLACEHOLDER";
