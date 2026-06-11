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
  // Process in chunks to prevent concurrent connection limits on OMDb
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

// --- MOVIE LISTS ---

const TRENDING_IDS = [
  'tt15239678', // Dune Part Two
  'tt11280740', // Oppenheimer
  'tt1517268',  // Barbie
  'tt10366206', // John Wick Chapter 4
  'tt1630029',  // Avatar The Way of Water
  'tt9362722',  // Spider-Man Across the Spider-Verse
  'tt9114286',  // Black Panther Wakanda Forever
  'tt10298810', // The Batman
  'tt6710474',  // Everything Everywhere All at Once
  'tt1745960',  // Top Gun Maverick
  'tt11813216', // The Whale
  'tt6791350',  // Guardians of the Galaxy Vol. 3
  'tt8760708',  // M3GAN
  'tt14230458', // Inside Out 2
  'tt12299608', // Deadpool & Wolverine
  'tt14513028', // Alien Romulus
  'tt16428256', // The Creator
  'tt11145118', // The Super Mario Bros. Movie
  'tt23849204', // Despicable Me 4
  'tt10589882', // Godzilla Minus One
  'tt14230496', // Poor Things
  'tt5537002',  // Killers of the Flower Moon
  'tt17009710', // Anatomy of a Fall
  'tt10872600', // Spider-Man No Way Home
  'tt2382320',  // No Time to Die
  'tt1160419',  // Dune
  'tt8847712',  // The French Dispatch
  'tt8946378',  // Knives Out
  'tt11564570', // Glass Onion
  'tt6751668',  // Parasite
  'tt7286456',  // Joker
  'tt8579674',  // 1917
  'tt7131622',  // Once Upon a Time in Hollywood
  'tt1302006',  // The Irishman
  'tt0816692',  // Interstellar
  'tt1375666',  // Inception
  'tt4154796',  // Avengers Endgame
  'tt4154756',  // Avengers Infinity War
  'tt1825683',  // Black Panther
  'tt3501632',  // Thor Ragnarok
  'tt5052448',  // Get Out
  'tt6857112',  // Us
  'tt10954984', // Nope
  'tt7732684',  // Hereditary
  'tt8772262',  // Midsommar
  'tt11138512', // The Northman
  'tt9764362',  // The Menu
  'tt10640346', // Babylon
  'tt14444726', // Tar
  'tt2543164',  // Arrival
];

const POPULAR_IDS = [
  'tt0120737',  // LOTR Fellowship
  'tt0167261',  // LOTR Two Towers
  'tt0167260',  // LOTR Return of the King
  'tt0241527',  // Harry Potter 1
  'tt0295297',  // Harry Potter 2
  'tt0304141',  // Harry Potter 3
  'tt0330373',  // Harry Potter 4
  'tt0373889',  // Harry Potter 5
  'tt0417741',  // Harry Potter 6
  'tt0926084',  // Harry Potter 7
  'tt1201607',  // Harry Potter 8
  'tt0076759',  // Star Wars IV
  'tt0080684',  // Star Wars V
  'tt0086190',  // Star Wars VI
  'tt0120915',  // Star Wars I
  'tt0121766',  // Star Wars II
  'tt0121765',  // Star Wars III
  'tt2488496',  // Star Wars VII
  'tt2527336',  // Star Wars VIII
  'tt2527338',  // Star Wars IX
  'tt0107290',  // Jurassic Park
  'tt0119567',  // The Lost World: Jurassic Park
  'tt0163025',  // Jurassic Park III
  'tt0369610',  // Jurassic World
  'tt4881806',  // Jurassic World Fallen Kingdom
  'tt8041270',  // Sonic 3
  'tt0325980',  // Pirates 1
  'tt0383574',  // Pirates 2
  'tt0449088',  // Pirates 3
  'tt0232500',  // The Fast and the Furious
  'tt1596343',  // Fast Five
  'tt2820852',  // Furious 7
  'tt0418279',  // Transformers
  'tt1055369',  // Transformers Revenge of the Fallen
  'tt1014759',  // Alice in Wonderland
  'tt0133093',  // The Matrix
  'tt0234215',  // The Matrix Reloaded
  'tt0242653',  // The Matrix Revolutions
  'tt0372784',  // Batman Begins
  'tt0468569',  // The Dark Knight
  'tt1345836',  // The Dark Knight Rises
  'tt0145487',  // Spider-Man
  'tt0316654',  // Spider-Man 2
  'tt0413300',  // Spider-Man 3
  'tt0371746',  // Iron Man
  'tt1228705',  // Iron Man 2
  'tt1300854',  // Iron Man 3
  'tt0458339',  // Captain America 1
  'tt1843866',  // Captain America 2
  'tt3498820',  // Captain America 3
];

const TOP_RATED_IDS = [
  'tt0111161',  // Shawshank
  'tt0068646',  // Godfather
  'tt0071562',  // Godfather 2
  'tt0050083',  // 12 Angry Men
  'tt0108052',  // Schindlers List
  'tt0110912',  // Pulp Fiction
  'tt0060196',  // The Good, the Bad and the Ugly
  'tt0109830',  // Forrest Gump
  'tt0137523',  // Fight Club
  'tt0099685',  // Goodfellas
  'tt0073486',  // One Flew Over the Cuckoos Nest
  'tt0114369',  // Se7en
  'tt0047478',  // Seven Samurai
  'tt0038650',  // Its a Wonderful Life
  'tt0102926',  // Silence of the Lambs
  'tt0317248',  // City of God
  'tt0120815',  // Saving Private Ryan
  'tt0118799',  // Life is Beautiful
  'tt0120689',  // The Green Mile
  'tt0103064',  // Terminator 2
  'tt0088763',  // Back to the Future
  'tt0245429',  // Spirited Away
  'tt0054215',  // Psycho
  'tt0253474',  // The Pianist
  'tt0110413',  // Leon the Professional
  'tt0110357',  // The Lion King 1994
  'tt0172495',  // Gladiator
  'tt0120586',  // American History X
  'tt0407887',  // The Departed
  'tt0482571',  // The Prestige
  'tt2582802',  // Whiplash
  'tt1675434',  // The Intouchables
  'tt0095327',  // Grave of the Fireflies
  'tt0056058',  // Harakiri
  'tt0034583',  // Casablanca
  'tt0047396',  // Rear Window
  'tt0095765',  // Cinema Paradiso
  'tt0078748',  // Alien
  'tt0078788',  // Apocalypse Now
  'tt0209144',  // Memento
  'tt0082971',  // Raiders of the Lost Ark
  'tt1853728',  // Django Unchained
  'tt0910970',  // WALL-E
  'tt0405094',  // The Lives of Others
  'tt0043014',  // Sunset Blvd
  'tt0050825',  // Paths of Glory
  'tt0081505',  // The Shining
  'tt0032553',  // The Great Dictator
  'tt0051201',  // Witness for the Prosecution
  'tt0090605',  // Aliens
];

const HOLLYWOOD_BLOCKBUSTER_IDS = [
  'tt0499549',  // Avatar
  'tt0120338',  // Titanic
  'tt0848228',  // The Avengers
  'tt4520988',  // Frozen II
  'tt2395427',  // Avengers: Age of Ultron
  'tt2294629',  // Frozen
  'tt2771200',  // Beauty and the Beast
  'tt3606756',  // Incredibles 2
  'tt4630562',  // The Fate of the Furious
  'tt2293640',  // Minions
  'tt1477834',  // Aquaman
  'tt6320628',  // Spider-Man Into the Spiderverse
  'tt4154664',  // Captain Marvel
  'tt1074638',  // Skyfall
  'tt2109248',  // Transformers Age of Extinction
  'tt1979376',  // Toy Story 4
  'tt0435761',  // Toy Story 3
  'tt2277860',  // Finding Dory
  'tt2948356',  // Zootopia
  'tt0903624',  // The Hobbit: An Unexpected Journey
  'tt1690953',  // Despicable Me 2
  'tt3040964',  // The Jungle Book
  'tt2283362',  // Jumanji: Welcome to the Jungle
  'tt3460252',  // Despicable Me 3
  'tt1080016',  // Ice Age Dawn of the Dinosaurs
  'tt0811631',  // Ice Age Continental Drift
  'tt2709768',  // The Secret Life of Pets
  'tt2975590',  // Batman v Superman
  'tt1951265',  // Hunger Games Catching Fire
  'tt3896198',  // Guardians of the Galaxy Vol. 2
  'tt2096673',  // Inside Out
  'tt1270797',  // Venom
  'tt1673434',  // Twilight Breaking Dawn Part 2
  'tt2250912',  // Spider-Man Homecoming
  'tt1392170',  // The Hunger Games
  'tt7975244',  // Jumanji: The Next Level
  'tt0298148',  // Shrek
  'tt0993846',  // Bohemian Rhapsody
  'tt0266543',  // Finding Nemo
  'tt5463162',  // Deadpool 2
  'tt1431045',  // Deadpool
  'tt2070597',  // The Hunger Games Mockingjay Part 1
  'tt6334354',  // The Suicide Squad
  'tt0126029',  // Shrek
  'tt1485118',  // Shrek 2
  'tt1023971',  // Shrek the Third
  'tt0892791',  // Shrek Forever After
  'tt0362225',  // Madagascar
  'tt0479143',  // Rocky Balboa
  'tt1201607',  // Harry Potter 8
];

const BOLLYWOOD_LATEST_IDS = [
  'tt3863552',  // Bajrangi Bhaijaan
  'tt4535650',  // Dilwale
  'tt5074352',  // Dangal
  'tt4832640',  // Sultan
  'tt3405236',  // Raees
  'tt5956100',  // Tiger Zinda Hai
  'tt6452574',  // Sanju
  'tt5935704',  // Padmaavat
  'tt2395469',  // Gully Boy
  'tt7430722',  // War
  'tt8108274',  // Tanhaji
  'tt9531772',  // Sooryavanshi
  'tt8178634',  // RRR
  'tt10083340', // Gangubai Kathiawadi
  'tt6277462',  // Brahmastra: Part One – Shiva
  'tt12844910', // Pathaan
  'tt15354916', // Jawan
  'tt13751694', // Animal
  'tt13817104', // Fighter
  'tt27510174', // Stree 2
  'tt27470893', // Chandu Champion
  'tt2631186',  // Baahubali
  'tt39139925', // Dhurandhar: The Revenge
  'tt33014583', // Dhurandhar
];

const TV_SHOWS_IDS = [
  'tt0903747', // Breaking Bad
  'tt0944947', // Game of Thrones
  'tt4574334', // Stranger Things
  'tt0386676', // The Office
  'tt1190634', // The Boys
  'tt3032476', // Better Call Saul
  'tt1475582', // Sherlock
  'tt5770786', // Dark
  'tt2442560', // Peaky Blinders
  'tt0108778', // Friends
  'tt4254242', // Narcos
  'tt0475784', // Westworld
  'tt0412142', // House
  'tt2467372', // Brooklyn Nine-Nine
  'tt0436992', // Doctor Who
];

const BOLLYWOOD_TV_SHOWS_IDS = [
  'tt6077448',  // Sacred Games
  'tt6473300',  // Mirzapur
  'tt12392504', // Scam 1992: The Harshad Mehta Story
  'tt9544034',  // The Family Man
  'tt14392248', // Aspirants
  'tt9095260',  // Criminal Justice
  'tt6466208',  // Breathe
  'tt9432978',  // Kota Factory
  'tt12004706', // Panchayat
  'tt9680440',  // Paatal Lok
  'tt11854694', // Special Ops
  'tt11912196', // Asur: Welcome to Your Dark Side
  'tt8809646',  // College Romance
  'tt8392006',  // Apharan
  'tt7927936',  // Flames
  'tt14650074', // Dhindora
  'tt15477488', // Farzi
  'tt12805346', // Aashram
  'tt6112414',  // Inside Edge
  'tt12392496', // Undekhi
  'tt12448030', // Aarya
  'tt10530900', // Gullak
  'tt4742876',  // TVF Pitchers
  'tt13868972', // Rocket Boys
  'tt9398466',  // Delhi Crime
  'tt15295490', // Campus Diaries
  'tt8317568',  // Broken But Beautiful
  'tt9119364',  // Jamtara: Sabka Number Aayega
  'tt22014226', // Taaza Khabar
  'tt9778022',  // Abhay
  'tt11407524', // Hostel Daze
  'tt9420618',  // Rangbaaz
  'tt9814458',  // Bandish Bandits
  'tt6494622',  // Made in Heaven
  'tt8254348',  // Immature
  'tt6522580',  // Little Things
  'tt1399664',  // The Night Manager (India)
  'tt13729648', // Candy
  'tt12987728', // Bicchoo Ka Khel
  'tt21935972', // Dahan: Raakan Ka Rahasya
  'tt7441984',  // JL50
  'tt15471900', // Rana Naidu
  'tt14160660', // Ray
  'tt13304410', // Sunflower
  'tt21279678', // NCR Days
  'tt14420552', // Maharani
  'tt15484958', // Mumbai Diaries 26/11
  'tt8254592',  // Chacha Vidhayak Hain Humare
  'tt8595766',  // Yeh Meri Family
  'tt14167344', // Aranyak
];

export const getTrending   = async () => ({ data: { results: await fetchMovieByIds(TRENDING_IDS)  } });
export const getPopular    = async () => ({ data: { results: await fetchMovieByIds(POPULAR_IDS)   } });
export const getTopRated   = async () => ({ data: { results: await fetchMovieByIds(TOP_RATED_IDS) } });
export const getNowPlaying = async () => ({ data: { results: await fetchMovieByIds(HOLLYWOOD_BLOCKBUSTER_IDS) } });
export const getBollywoodLatest = async () => ({ data: { results: await fetchMovieByIds(BOLLYWOOD_LATEST_IDS) } });
export const getTVShows = async () => ({ data: { results: await fetchMovieByIds(TV_SHOWS_IDS) } });
export const getBollywoodTVShows = async () => ({ data: { results: await fetchMovieByIds(BOLLYWOOD_TV_SHOWS_IDS) } });

// Local video files mapped by IMDb ID
// Files are served from /videos/* via the Vite dev-server middleware
export const LOCAL_VIDEOS = {
  'tt39139925': '/videos/Dhurandhar_The_Revenge_2026_1080p_HEVC_V2_HDTC_Hindi_ORG_HC_ESubs.mkv',
};
