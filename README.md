# MovieHub 🎬

MovieHub is a modern, responsive web application for exploring movies and TV shows, tracking favorites/watchlists, and chatting with administration for support. Built with React, Vite, Firebase, and integration with the OMDb/TMDb APIs.

## Features

- **Interactive Movie & TV Browse**: Search and view details for popular, trending, and top-rated movies and TV shows.
- **User Authentication**: Sign in and sign up securely using Firebase Authentication.
- **Favorites & Watchlist**: Track movies you love or want to watch using custom Context-based state synced/managed locally.
- **Admin Chat / Support**: Instant user-to-admin and admin-to-user support chat powered by Firebase.
- **Responsive Premium UI**: Sleek dark mode design with micro-animations, skeleton loaders, custom modals, and high-quality graphics.
- **Custom Movie Submissions**: Add and manage custom movies via Firestore database.

## Technologies Used

- **Frontend**: React (Hooks, Context API), HTML5, Vanilla CSS
- **Build Tool**: Vite
- **Database & Services**: Firebase (Authentication, Firestore, Storage)
- **APIs**: OMDb API, TMDb API

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ItsKunalDev/MovieHub.git
   cd MovieHub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (based on `.env.example`) and fill in your API keys and Firebase credentials:
   ```env
   # OMDb API Configuration
   VITE_OMDB_API_KEY=your_omdb_api_key

   # TMDb API Configuration
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
   VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

## License

This project is licensed under the MIT License.
