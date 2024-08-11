import create from 'zustand';
import axios from 'axios';
import { api_key } from '../apikey';


const KEY_API = api_key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3/search/movie';
const TMDB_MOST_RATED_BASE_URL = 'https://api.themoviedb.org/3/movie/now_playing'; 
const TMDB_POPULAR_ACTORS_URL = 'https://api.themoviedb.org/3/person/popular';
const TMDB_RECOMMENDED_BASE_URL = 'https://api.themoviedb.org/3/movie/popular'; 
const TMDB_MOVIE_DETAILS_URL = 'https://api.themoviedb.org/3/movie'; 

// Criando o store com Zustand
const useMovieStore = create((set) => ({
  movies: [],
  loading: false,
  error: null,

  //busca os filmes lancamentos
  fetchTopRatedMovies: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(TMDB_MOST_RATED_BASE_URL, {
        params: {
          api_key: KEY_API,
          language: 'pt-BR', 
          page: 1,
        },
      });
      set({ movies: response.data.results, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch top rated movies', loading: false });
    }
  },

//pesquisa os filmes
  fetchMovies:  async (query) => {
    if (!query) {
      set({ movies: [] }); 
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await axios.get(TMDB_BASE_URL, {
        params: {
          api_key: KEY_API,
          query,
        },
      });
      set({ movies: response.data.results, loading: false });
    } catch (error) {
      set({ error: 'Falha ao encontrar o filme.', loading: false });
    }
  },

//busca os atores populares
fetchPopularActors: async () => {
  set({ loadingActors: true, error: null });
  try {
    const response = await axios.get(TMDB_POPULAR_ACTORS_URL, {
      params: {
        api_key: KEY_API,
        language: 'pt-BR',
      },
    });
    const actorsWithAge = await Promise.all(response.data.results.map(async (actor) => {
      const details = await axios.get(`https://api.themoviedb.org/3/person/${actor.id}`, {
        params: {
          api_key: KEY_API,
          language: 'pt-BR',
        },
      });
      const birthDate = new Date(details.data.birthday);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      
      return { ...actor, age }; // Adiciona a idade
    }));

    set({ actors: actorsWithAge, loadingActors: false });
  } catch (error) {
    set({ error: 'Falha ao buscar atores populares.', loadingActors: false });
  }
},


fetchRecommendedMovies: async () => {
  set({ loadingRecommended: true });
  try {
    const response = await axios.get(TMDB_RECOMMENDED_BASE_URL, {
      params: {
        api_key: KEY_API,
        language: 'pt-BR',
        page: 1,
      },
    });
    set({ recommendedMovies: response.data.results, loadingRecommended: false });
  } catch (error) {
    set({ error: 'Falha ao buscar filmes recomendados', loadingRecommended: false });
  }
},

//buscar detalhes do filme pelo ID
fetchMovieDetails: async (movieId) => {
  set({ loading: true, error: null });
  try {
    const response = await axios.get(`${TMDB_MOVIE_DETAILS_URL}/${movieId}`, {
      params: {
        api_key: KEY_API,
        language: 'pt-BR',
        append_to_response: 'credits', //inclui detalhes do elenco
      },
    });
    set({ movieDetails: response.data, credits: response.data.credits, loading: false });
  } catch (error) {
    set({ error: 'Falha ao buscar os detalhes do filme.', loading: false });
  }
},

// Limpa os detalhes do filme
clearMovieDetails: () => {
  set({ movieDetails: null });
},



}));

export default useMovieStore;
