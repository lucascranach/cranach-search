const searchGloballyRandomizedByLang = (lang: string) => fetch(
  `http://localhost:3001/random?lang=${lang}`,
).then(resp => resp.json());


export default {
  searchGloballyFor(_: any, lang: string): Promise<GlobalSearchResult> {
    return searchGloballyRandomizedByLang(lang);
  }
};

export type GlobalSearchArtifact = {
  id: string;
  langCode: string;
  title: string;
  subtitle: string;
  date: string;
  additionalInfoList: string[];
  classification: string;
  imgSrc: string;
}

export type GlobalSearchResult = {
  graphics: GlobalSearchArtifact[];
  paintings: GlobalSearchArtifact[];
  archivals: GlobalSearchArtifact[];
}
