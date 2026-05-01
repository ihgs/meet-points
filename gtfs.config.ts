export type GtfsSource = {
  name: string;
  operator: string;
  url: string;
};

export function getGtfsSources(): GtfsSource[] {
  const key = process.env.ODPT_API_KEY ?? '';
  return [
    { name: 'TokyoMetro', operator: '東京メトロ', url: `https://api.odpt.org/api/4/gtfs/data/TokyoMetro?acl:consumerKey=${key}` },
    { name: 'Toei',       operator: '都営',       url: `https://api.odpt.org/api/4/gtfs/data/Toei?acl:consumerKey=${key}` },
    { name: 'Tokyu',      operator: '東急',       url: `https://api.odpt.org/api/4/gtfs/data/Tokyu?acl:consumerKey=${key}` },
    { name: 'Odakyu',     operator: '小田急',     url: `https://api.odpt.org/api/4/gtfs/data/Odakyu?acl:consumerKey=${key}` },
    { name: 'Keio',       operator: '京王',       url: `https://api.odpt.org/api/4/gtfs/data/Keio?acl:consumerKey=${key}` },
    { name: 'Seibu',      operator: '西武',       url: `https://api.odpt.org/api/4/gtfs/data/Seibu?acl:consumerKey=${key}` },
    { name: 'Tobu',       operator: '東武',       url: `https://api.odpt.org/api/4/gtfs/data/Tobu?acl:consumerKey=${key}` },
  ];
}
