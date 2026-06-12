import fs from 'fs';
import path from 'path';

let API_KEY = process.env.VITE_OMDB_API_KEY;

if (!API_KEY && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/^VITE_OMDB_API_KEY=(.*)$/m);
  if (match) {
    API_KEY = match[1].trim().replace(/['"]/g, '');
  }
}

if (!API_KEY) {
  API_KEY = 'your_omdb_api_key_here';
}

const sections = {
  TRENDING_IDS: [
    "Dune: Part Two", "Oppenheimer", "Barbie", "John Wick: Chapter 4", "Avatar: The Way of Water", 
    "Spider-Man: Across the Spider-Verse", "Black Panther: Wakanda Forever", "The Batman", 
    "Everything Everywhere All at Once", "Top Gun: Maverick", "The Whale", "Guardians of the Galaxy Vol. 3", 
    "M3GAN", "Inside Out 2", "Deadpool & Wolverine", "Alien: Romulus", "The Creator", 
    "The Super Mario Bros. Movie", "Despicable Me 4", "Godzilla Minus One", "Poor Things", 
    "Killers of the Flower Moon", "Anatomy of a Fall", "Spider-Man: No Way Home", "No Time to Die", 
    "Dune", "The French Dispatch", "Knives Out", "Glass Onion", "Parasite", "Joker", "1917", 
    "Once Upon a Time in Hollywood", "The Irishman", "Ford v Ferrari", "Jojo Rabbit", "Tenet", 
    "The Invisible Man", "A Quiet Place", "A Quiet Place Part II", "Mad Max: Fury Road", 
    "Avengers: Endgame", "Avengers: Infinity War", "Black Panther", "Thor: Ragnarok", "Get Out", 
    "Us", "Nope", "Hereditary", "Midsommar", "The Northman", "The Menu"
  ],
  POPULAR_IDS: [
    "Harry Potter and the Sorcerer's Stone", "Harry Potter and the Chamber of Secrets", "Harry Potter and the Prisoner of Azkaban", 
    "Harry Potter and the Goblet of Fire", "Harry Potter and the Order of the Phoenix", "Harry Potter and the Half-Blood Prince", 
    "Harry Potter and the Deathly Hallows: Part 1", "Harry Potter and the Deathly Hallows: Part 2", 
    "The Lord of the Rings: The Fellowship of the Ring", "The Lord of the Rings: The Two Towers", "The Lord of the Rings: The Return of the King", 
    "Star Wars: Episode IV - A New Hope", "Star Wars: Episode V - The Empire Strikes Back", "Star Wars: Episode VI - Return of the Jedi", 
    "Star Wars: Episode I - The Phantom Menace", "Star Wars: Episode II - Attack of the Clones", "Star Wars: Episode III - Revenge of the Sith", 
    "Star Wars: Episode VII - The Force Awakens", "Star Wars: Episode VIII - The Last Jedi", "Star Wars: Episode IX - The Rise of Skywalker", 
    "Jurassic Park", "The Lost World: Jurassic Park", "Jurassic Park III", "Jurassic World", "Jurassic World: Fallen Kingdom", "Jurassic World Dominion", 
    "Pirates of the Caribbean: The Curse of the Black Pearl", "Pirates of the Caribbean: Dead Man's Chest", "Pirates of the Caribbean: At World's End", 
    "The Fast and the Furious", "Fast Five", "Furious 7", "Transformers", "Transformers: Revenge of the Fallen", "Transformers: Dark of the Moon", 
    "The Matrix", "The Matrix Reloaded", "The Matrix Revolutions", "Inception", "Interstellar", 
    "Batman Begins", "The Dark Knight", "The Dark Knight Rises", "Spider-Man", "Spider-Man 2", "Spider-Man 3", 
    "Iron Man", "Iron Man 2", "Iron Man 3", "Captain America: The First Avenger", "Captain America: The Winter Soldier", "Captain America: Civil War"
  ],
  TOP_RATED_IDS: [
    "The Shawshank Redemption", "The Godfather", "The Godfather Part II", "12 Angry Men", "Schindler's List", 
    "Pulp Fiction", "The Good, the Bad and the Ugly", "Forrest Gump", "Fight Club", "Goodfellas", 
    "One Flew Over the Cuckoo's Nest", "Se7en", "Seven Samurai", "It's a Wonderful Life", "The Silence of the Lambs", 
    "City of God", "Saving Private Ryan", "Life Is Beautiful", "The Green Mile", "Terminator 2: Judgment Day", 
    "Back to the Future", "Spirited Away", "Psycho", "The Pianist", "Léon: The Professional", 
    "The Lion King", "Gladiator", "American History X", "The Departed", "The Prestige", 
    "Whiplash", "The Intouchables", "Grave of the Fireflies", "Harakiri", "Casablanca", 
    "Rear Window", "Cinema Paradiso", "Alien", "Apocalypse Now", "Memento", 
    "Raiders of the Lost Ark", "Django Unchained", "WALL·E", "The Lives of Others", "Sunset Blvd.", 
    "Paths of Glory", "The Shining", "The Great Dictator", "Witness for the Prosecution", "Aliens"
  ],
  HOLLYWOOD_BLOCKBUSTER_IDS: [
    "Avatar", "Titanic", "The Avengers", "Frozen II", "Avengers: Age of Ultron", 
    "Super Mario Bros", "Frozen", "Beauty and the Beast", "Incredibles 2", "The Fate of the Furious", 
    "Minions", "Aquaman", "Spider-Man: Far from Home", "Captain Marvel", "Skyfall", 
    "Transformers: Age of Extinction", "Toy Story 4", "Toy Story 3", "Pirates of the Caribbean: Dead Man's Chest", 
    "Finding Dory", "Alice in Wonderland", "Zootopia", "The Hobbit: An Unexpected Journey", 
    "Despicable Me 2", "The Jungle Book", "Jumanji: Welcome to the Jungle", "Harry Potter and the Sorcerer's Stone", 
    "Despicable Me 3", "Ice Age: Dawn of the Dinosaurs", "Ice Age: Continental Drift", "The Secret Life of Pets", 
    "Batman v Superman: Dawn of Justice", "The Hunger Games: Catching Fire", "Guardians of the Galaxy Vol. 2", 
    "Inside Out", "Venom", "Thor: Ragnarok", "The Twilight Saga: Breaking Dawn - Part 2", 
    "Inception", "Spider-Man: Homecoming", "The Hunger Games", "Jumanji: The Next Level", 
    "Shrek 2", "Bohemian Rhapsody", "The Lord of the Rings: The Two Towers", "Harry Potter and the Order of the Phoenix", 
    "Finding Nemo", "Harry Potter and the Half-Blood Prince", "The Lord of the Rings: The Fellowship of the Ring", 
    "Deadpool 2", "Deadpool", "The Hunger Games: Mockingjay - Part 1"
  ],
  BOLLYWOOD_LATEST_IDS: [
    "Ek Tha Tiger", "PK", "Bajrangi Bhaijaan", "Sultan", "Dangal", 
    "Tiger Zinda Hai", "Padmaavat", "Sanju", "Andhadhun", "Simmba", 
    "Uri: The Surgical Strike", "Kabir Singh", "War", "Tanhaji: The Unsung Warrior", "Sooryavanshi", 
    "Gangubai Kathiawadi", "The Kashmir Files", "Pathaan", "Jawan", "Animal", 
    "Dunki", "Fighter", "Stree 2", "Brahmastra Part One: Shiva", "Bhool Bhulaiyaa 2", 
    "Bhediya", "Shershaah", "Gully Boy", "Raees", "Yeh Jawaani Hai Deewani", 
    "Dhoom 3", "Chennai Express", "Kick", "Happy New Year", "Prem Ratan Dhan Payo", 
    "Dilwale", "Baaghi 2", "Race 3", "Thugs of Hindostan", "Good Newwz", 
    "Housefull 4", "Bharat", "Super 30", "Chhichhore", "Dream Girl", 
    "Bala", "Drishyam 2", "OMG 2", "Rocky Aur Rani Kii Prem Kahaani", "Tu Jhoothi Main Makkaar", 
    "Gadar 2", "Tiger 3"
  ]
};

async function run() {
  const finalIds = {};
  for (const [section, titles] of Object.entries(sections)) {
    console.log(`Processing ${section}...`);
    finalIds[section] = [];
    const usedIds = new Set();
    
    for (const title of titles) {
      try {
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${API_KEY}`);
        const data = await res.json();
        if (data.Search && data.Search.length > 0) {
          const movie = data.Search.find(m => m.Type === 'movie' && m.Poster && m.Poster !== 'N/A' && m.imdbID);
          if (movie && !usedIds.has(movie.imdbID)) {
            usedIds.add(movie.imdbID);
            finalIds[section].push(`  '${movie.imdbID}',`);
          }
        }
      } catch (e) {
        console.error('Error fetching', title, e);
      }
      if (finalIds[section].length >= 50) break;
    }
    console.log(`Found ${finalIds[section].length} for ${section}`);
  }
  
  let out = '';
  for (const [k, v] of Object.entries(finalIds)) {
    out += `const ${k} = [\n${v.join('\n')}\n];\n\n`;
  }
  fs.writeFileSync('output_ids.txt', out);
  console.log('Done.');
}
run();
