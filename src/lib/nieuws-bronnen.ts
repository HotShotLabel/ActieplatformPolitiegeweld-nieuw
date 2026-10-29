/* Bekende nieuwsbronnen (domein naar weergavenaam). Alleen berichten van
   deze bronnen komen op de site; onbekende domeinen vallen af. */

export const BRON_PER_DOMEIN: Record<string, string> = {
  "nos.nl": "NOS",
  "nu.nl": "NU.nl",
  "ad.nl": "AD",
  "telegraaf.nl": "De Telegraaf",
  "volkskrant.nl": "de Volkskrant",
  "trouw.nl": "Trouw",
  "nrc.nl": "NRC",
  "parool.nl": "Het Parool",
  "tpo.nl": "TPO",
  "rtl.nl": "RTL Nieuws",
  "rtlnieuws.nl": "RTL Nieuws",
  "om.nl": "Openbaar Ministerie",
  "rijksrecherche.nl": "Rijksrecherche",
  "controlealtdelete.nl": "Controle Alt Delete",
  "gelderlander.nl": "De Gelderlander",
  "destentor.nl": "De Stentor",
  "tubantia.nl": "Tubantia",
  "bd.nl": "Brabants Dagblad",
  "ed.nl": "Eindhovens Dagblad",
  "pzc.nl": "PZC",
  "dvhn.nl": "Dagblad van het Noorden",
  "lc.nl": "Leeuwarder Courant",
  "limburger.nl": "De Limburger",
  "rtvnoord.nl": "RTV Noord",
  "rtvdrenthe.nl": "RTV Drenthe",
  "omropfryslan.nl": "Omrop Fryslân",
  "rtvoost.nl": "RTV Oost",
  "gld.nl": "Omroep Gelderland",
  "omroepgelderland.nl": "Omroep Gelderland",
  "rtvutrecht.nl": "RTV Utrecht",
  "omroepwest.nl": "Omroep West",
  "rijnmond.nl": "Rijnmond",
  "omroepbrabant.nl": "Omroep Brabant",
  "omroepzeeland.nl": "Omroep Zeeland",
  "l1.nl": "L1",
  "at5.nl": "AT5",
  "nhnieuws.nl": "NH Nieuws",
  "omroepflevoland.nl": "Omroep Flevoland",
  "blikopnieuws.nl": "Blik op Nieuws",
  "metronieuws.nl": "Metro",
  "joop.nl": "JOOP",
  "pointer.kro-ncrv.nl": "Pointer",
  "eenvandaag.avrotros.nl": "EenVandaag",
  "nl.newz.com": "Newz",
  "dagelijksestandaard.nl": "Dagelijkse Standaard",
  "oost.nl": "Oost",
  "openrotterdam.nl": "OPEN Rotterdam",
  "nieuws.nl": "Nieuws.nl",
  "112vdg.nl": "112 Vandaag",
  "crime-nieuws.nl": "Crime Nieuws",
  "hartvannederland.nl": "Hart van Nederland",
  "nltimes.nl": "NL Times",
  "rd.nl": "Reformatorisch Dagblad",
  "frontpage.fok.nl": "FOK",
  "duic.nl": "DUIC",
  "bndestem.nl": "BN DeStem",
  "sleutelstad.nl": "Sleutelstad",
  "deorkaan.nl": "De Orkaan",
  "112nederland.nl": "112 Nederland",
  "112fryslan.nl": "112 Fryslân",
  "fryn.nl": "Fryn",
  "112nieuws.net": "112 Nieuws",
  "112drachten.nl": "112 Drachten",
};

/* Geeft de bronnaam, of null als het domein niet bekend is. */
export function bronVoorUrl(url: string): string | null {
  let domein = "";
  try {
    domein = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  for (const [bekend, naam] of Object.entries(BRON_PER_DOMEIN)) {
    if (domein === bekend || domein.endsWith("." + bekend)) return naam;
  }
  return null;
}
