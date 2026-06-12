
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || 'thewdb';

const fetchOMDB = async (tconst) => {
  const res = await fetch(`https://www.omdbapi.com/?i=${tconst}&apikey=${OMDB_API_KEY}&plot=full`);
  if (!res.ok) throw new Error('OMDB error');
  const d = await res.json();
  if (d.Response === 'False') throw new Error(d.Error);
  return {
    id: tconst,
    title: d.Title || '',
    overview: d.Plot !== 'N/A' ? d.Plot : '',
    poster_path: d.Poster !== 'N/A' ? d.Poster : null,
    backdrop_path: d.Poster !== 'N/A' ? d.Poster : null,
    release_date: d.Year || '',
    vote_average: parseFloat(d.imdbRating) || 0,
    runtime: parseInt(d.Runtime) || 0,
    genres: d.Genre !== 'N/A' ? d.Genre.split(', ').map((g, i) => ({ id: i, name: g })) : [],
    credits: {
      cast: d.Actors !== 'N/A' ? d.Actors.split(', ').map((name, i) => ({ id: i, name, profile_path: null })) : []
    },
    videos: { results: [] }
  };
};

const fetchMovieByIds = async (ids) => {
  
  const results = [];
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    const chunkResults = await Promise.allSettled(chunk.map(fetchOMDB));
    results.push(...chunkResults);
  }
  return results
    .filter((r) => r.status === 'fulfilled' && r.value && r.value.poster_path)
    .map((r) => r.value);
};

export const searchMovies = async (query) => {
  try {
    const res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${OMDB_API_KEY}`);
    if (!res.ok) return { data: { results: [] } };
    const d = await res.json();
    if (d.Response === 'False') return { data: { results: [] } };
    
    const list = (d.Search || [])
      .filter(item => item.Type === 'movie')
      .slice(0, 10)
      .map(item => ({
        id: item.imdbID,
        title: item.Title,
        overview: '',
        poster_path: item.Poster !== 'N/A' ? item.Poster : null,
        backdrop_path: item.Poster !== 'N/A' ? item.Poster : null,
        release_date: item.Year,
        vote_average: 0,
      }));
    return { data: { results: list } };
  } catch {
    return { data: { results: [] } };
  }
};

export const getMovieDetails = async (tconst) => {
  try {
    const data = await fetchOMDB(tconst);
    return { data };
  } catch {
    throw new Error('Movie not found');
  }
};

export const getImageUrl = (path) => path;
export const getBackdropUrl = (path) => path;



const TRENDING_IDS = [
  'tt15239678', 
  'tt11280740', 
  'tt1517268',  
  'tt10366206', 
  'tt1630029',  
  'tt9362722',  
  'tt9114286',  
  'tt10298810', 
  'tt6710474',  
  'tt1745960',  
  'tt11813216', 
  'tt6791350',  
  'tt8760708',  
  'tt14230458', 
  'tt12299608', 
  'tt14513028', 
  'tt16428256', 
  'tt11145118', 
  'tt23849204', 
  'tt10589882', 
  'tt14230496', 
  'tt5537002',  
  'tt17009710', 
  'tt10872600', 
  'tt2382320',  
  'tt1160419',  
  'tt8847712',  
  'tt8946378',  
  'tt11564570', 
  'tt6751668',  
  'tt7286456',  
  'tt8579674',  
  'tt7131622',  
  'tt1302006',  
  'tt0816692',  
  'tt1375666',  
  'tt4154796',  
  'tt4154756',  
  'tt1825683',  
  'tt3501632',  
  'tt5052448',  
  'tt6857112',  
  'tt10954984', 
  'tt7732684',  
  'tt8772262',  
  'tt11138512', 
  'tt9764362',  
  'tt10640346', 
  'tt14444726', 
  'tt2543164',  
];

const POPULAR_IDS = [
  'tt0120737',  
  'tt0167261',  
  'tt0167260',  
  'tt0241527',  
  'tt0295297',  
  'tt0304141',  
  'tt0330373',  
  'tt0373889',  
  'tt0417741',  
  'tt0926084',  
  'tt1201607',  
  'tt0076759',  
  'tt0080684',  
  'tt0086190',  
  'tt0120915',  
  'tt0121766',  
  'tt0121765',  
  'tt2488496',  
  'tt2527336',  
  'tt2527338',  
  'tt0107290',  
  'tt0119567',  
  'tt0163025',  
  'tt0369610',  
  'tt4881806',  
  'tt8041270',  
  'tt0325980',  
  'tt0383574',  
  'tt0449088',  
  'tt0232500',  
  'tt1596343',  
  'tt2820852',  
  'tt0418279',  
  'tt1055369',  
  'tt1014759',  
  'tt0133093',  
  'tt0234215',  
  'tt0242653',  
  'tt0372784',  
  'tt0468569',  
  'tt1345836',  
  'tt0145487',  
  'tt0316654',  
  'tt0413300',  
  'tt0371746',  
  'tt1228705',  
  'tt1300854',  
  'tt0458339',  
  'tt1843866',  
  'tt3498820',  
];

const TOP_RATED_IDS = [
  'tt0111161',  
  'tt0068646',  
  'tt0071562',  
  'tt0050083',  
  'tt0108052',  
  'tt0110912',  
  'tt0060196',  
  'tt0109830',  
  'tt0137523',  
  'tt0099685',  
  'tt0073486',  
  'tt0114369',  
  'tt0047478',  
  'tt0038650',  
  'tt0102926',  
  'tt0317248',  
  'tt0120815',  
  'tt0118799',  
  'tt0120689',  
  'tt0103064',  
  'tt0088763',  
  'tt0245429',  
  'tt0054215',  
  'tt0253474',  
  'tt0110413',  
  'tt0110357',  
  'tt0172495',  
  'tt0120586',  
  'tt0407887',  
  'tt0482571',  
  'tt2582802',  
  'tt1675434',  
  'tt0095327',  
  'tt0056058',  
  'tt0034583',  
  'tt0047396',  
  'tt0095765',  
  'tt0078748',  
  'tt0078788',  
  'tt0209144',  
  'tt0082971',  
  'tt1853728',  
  'tt0910970',  
  'tt0405094',  
  'tt0043014',  
  'tt0050825',  
  'tt0081505',  
  'tt0032553',  
  'tt0051201',  
  'tt0090605',  
];

const HOLLYWOOD_BLOCKBUSTER_IDS = [
  'tt0499549',  
  'tt0120338',  
  'tt0848228',  
  'tt4520988',  
  'tt2395427',  
  'tt2294629',  
  'tt2771200',  
  'tt3606756',  
  'tt4630562',  
  'tt2293640',  
  'tt1477834',  
  'tt6320628',  
  'tt4154664',  
  'tt1074638',  
  'tt2109248',  
  'tt1979376',  
  'tt0435761',  
  'tt2277860',  
  'tt2948356',  
  'tt0903624',  
  'tt1690953',  
  'tt3040964',  
  'tt2283362',  
  'tt3460252',  
  'tt1080016',  
  'tt0811631',  
  'tt2709768',  
  'tt2975590',  
  'tt1951265',  
  'tt3896198',  
  'tt2096673',  
  'tt1270797',  
  'tt1673434',  
  'tt2250912',  
  'tt1392170',  
  'tt7975244',  
  'tt0298148',  
  'tt0993846',  
  'tt0266543',  
  'tt5463162',  
  'tt1431045',  
  'tt2070597',  
  'tt6334354',  
  'tt0126029',  
  'tt1485118',  
  'tt1023971',  
  'tt0892791',  
  'tt0362225',  
  'tt0479143',  
  'tt1201607',  
];

const BOLLYWOOD_LATEST_IDS = [
  'tt3863552',  
  'tt4535650',  
  'tt5074352',  
  'tt4832640',  
  'tt3405236',  
  'tt5956100',  
  'tt6452574',  
  'tt5935704',  
  'tt2395469',  
  'tt7430722',  
  'tt8108274',  
  'tt9531772',  
  'tt8178634',  
  'tt10083340', 
  'tt6277462',  
  'tt12844910', 
  'tt15354916', 
  'tt13751694', 
  'tt13817104', 
  'tt27510174', 
  'tt27470893', 
  'tt2631186',  
  'tt39139925', 
  'tt33014583', 
];

const TV_SHOWS_IDS = [
  'tt0903747', 
  'tt0944947', 
  'tt4574334', 
  'tt0386676', 
  'tt1190634', 
  'tt3032476', 
  'tt1475582', 
  'tt5770786', 
  'tt2442560', 
  'tt0108778', 
  'tt4254242', 
  'tt0475784', 
  'tt0412142', 
  'tt2467372', 
  'tt0436992', 
];

const BOLLYWOOD_TV_SHOWS_IDS = [
  'tt6077448',  
  'tt6473300',  
  'tt12392504', 
  'tt9544034',  
  'tt14392248', 
  'tt9095260',  
  'tt6466208',  
  'tt9432978',  
  'tt12004706', 
  'tt9680440',  
  'tt11854694', 
  'tt11912196', 
  'tt8809646',  
  'tt8392006',  
  'tt7927936',  
  'tt14650074', 
  'tt15477488', 
  'tt12805346', 
  'tt6112414',  
  'tt12392496', 
  'tt12448030', 
  'tt10530900', 
  'tt4742876',  
  'tt13868972', 
  'tt9398466',  
  'tt15295490', 
  'tt8317568',  
  'tt9119364',  
  'tt22014226', 
  'tt9778022',  
  'tt11407524', 
  'tt9420618',  
  'tt9814458',  
  'tt6494622',  
  'tt8254348',  
  'tt6522580',  
  'tt1399664',  
  'tt13729648', 
  'tt12987728', 
  'tt21935972', 
  'tt7441984',  
  'tt15471900', 
  'tt14160660', 
  'tt13304410', 
  'tt21279678', 
  'tt14420552', 
  'tt15484958', 
  'tt8254592',  
  'tt8595766',  
  'tt14167344', 
];

export const getTrending   = async () => ({ data: { results: await fetchMovieByIds(TRENDING_IDS)  } });
export const getPopular    = async () => ({ data: { results: await fetchMovieByIds(POPULAR_IDS)   } });
export const getTopRated   = async () => ({ data: { results: await fetchMovieByIds(TOP_RATED_IDS) } });
export const getNowPlaying = async () => ({ data: { results: await fetchMovieByIds(HOLLYWOOD_BLOCKBUSTER_IDS) } });
export const getBollywoodLatest = async () => ({ data: { results: await fetchMovieByIds(BOLLYWOOD_LATEST_IDS) } });
export const getTVShows = async () => ({ data: { results: await fetchMovieByIds(TV_SHOWS_IDS) } });
export const getBollywoodTVShows = async () => ({ data: { results: await fetchMovieByIds(BOLLYWOOD_TV_SHOWS_IDS) } });



export const LOCAL_VIDEOS = {
  'tt39139925': '/videos/Dhurandhar_The_Revenge_2026_1080p_HEVC_V2_HDTC_Hindi_ORG_HC_ESubs.mkv',
};
