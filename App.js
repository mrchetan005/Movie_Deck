// ! ================ API / URL VARIABLES ================

const API_KEY = `api_key=23829a23ce35d4698331b31d4c662bd9`;
const BASE_URL = `https://api.themoviedb.org/3`;
// const API_URL = BASE_URL + `/movie/top_rated?` + API_KEY;
const API_URL = BASE_URL + `/movie/popular?` + API_KEY;
const IMG_URL = `https://image.tmdb.org/t/p/original/`;
const searchURL = BASE_URL + `/search/movie?` + API_KEY;

// ! ================ ELEMENT VARIABLES ================

const moviesList = document.getElementById('movies__list');
const sortByDateBtn = document.getElementById('sort__by__date');
const sortByRatingBtn = document.getElementById('sort__by__rating');
const form = document.getElementById('form');
const search = document.getElementById('search');
const favoritesBtn = document.getElementById('favorites__btn');
const allBtn = document.getElementById('all__btn');
const paginationContainer = document.getElementById('pagination__container');
const previousPageBtn = document.getElementById('previous__page__btn');
const currentPageBtn = document.getElementById('current__page__btn');
const nextPageBtn = document.getElementById('next__page__btn');

// ! ================ OTHER VARIABLES ================

let movieData;
let flagForDate = true;
let flagForRating = false;
let favoritesIcon;
let currentPage = localStorage.getItem('page-number') || 1, lastPage, demoLastPage = 3;
let favoritesArray = JSON.parse(localStorage.getItem('favorite-movies')) ?? [];
let SEARCH_URL = '';

/**
 * ! ================ FUNCTIONS ================
*/

// ! =============== FETCHING DATA FROM SERVER ===============

async function getMovies(apiURL, pageNumber = 1) {
    try {
        apiURL += `&page=${pageNumber}`;
        const response = await fetch(apiURL);
        let data = await response.json();
        // lastPage = data.total_pages;
        if (data.total_pages < demoLastPage) {
            lastPage = data.total_pages;
        } else {
            lastPage = demoLastPage;
        }
        data = remapData(data);
        movieData = data;
        checkFavorites();
        checkPagesRange();
        renderMovies(movieData);
        return data;
    } catch (error) {
        console.log(error);
    }
}

// ! =============== REMAPPING DATA ===============

function remapData(data) {
    return data?.results?.map((movie) => {
        return {
            title: movie.title,
            posterPath: movie.poster_path,
            voteCount: movie.vote_count,
            voteAverage: movie.vote_average,
            releaseDate: movie.release_date,
            id: movie.id,
            overview: movie.overview,
            favorites: false,
        }
    });
}

// ! =============== RENDERING MOVIES ===============

function renderMovies(data) {
    moviesList.textContent = '';
    data.forEach((movie) => {
        const { title, posterPath, voteCount, voteAverage, id, overview, favorites } = movie;

        // Create <li> element
        const listItem = document.createElement("li");
        listItem.classList.add("movie__card");

        // Create <img> element
        const image = document.createElement("img");
        image.id = "movie__img";
        image.src = IMG_URL + posterPath;
        image.alt = title;
        listItem.appendChild(image);

        // Create <div class="card__details"> element
        const cardDetails = document.createElement("div");
        cardDetails.classList.add("card__details");
        listItem.appendChild(cardDetails);

        // Create <h3 id="movie__title" class="card__title"> element
        const movieTitle = document.createElement("h3");
        movieTitle.id = "movie__title";
        movieTitle.classList.add("card__title");
        movieTitle.textContent = title;
        cardDetails.appendChild(movieTitle);

        // Create rating <div> element
        const ratingDiv = document.createElement("div");
        ratingDiv.classList.add("rating");
        cardDetails.appendChild(ratingDiv);


        const overviewDiv = document.createElement("div");
        overviewDiv.classList.add("overview");
        overviewDiv.textContent = `Overview: ${overview}`;
        cardDetails.appendChild(overviewDiv);

        // Create first rating <div>
        const ratingDiv1 = document.createElement("div");
        ratingDiv.appendChild(ratingDiv1);

        // Create <p id="vote__count"> element
        const voteCountElement = document.createElement("p");
        voteCountElement.id = "vote__count";
        voteCountElement.textContent = `Votes: ${voteCount}`;
        ratingDiv1.appendChild(voteCountElement);

        // Create <p id="vote__average"> element
        const voteAverageElement = document.createElement("p");
        voteAverageElement.id = "vote__average";
        voteAverageElement.textContent = `Rating: ${voteAverage.toFixed(1)}`;
        ratingDiv1.appendChild(voteAverageElement);

        // Create favorites <div> element
        const favoritesDiv = document.createElement("div");
        favoritesDiv.classList.add("favorites");
        ratingDiv.appendChild(favoritesDiv);

        // Create <i> element
        const icon = document.createElement("i");
        icon.className = `fa-${favorites ? "solid" : "regular"} fa-heart favorites__icon`;
        icon.setAttribute("data-id", id);
        favoritesDiv.appendChild(icon);

        // Append the <li> element to the movie container
        moviesList.appendChild(listItem);

        // ! Another way to create movie card

        // moviesList.innerHTML += `
        //     <li class="movie__card">
        //         <img
        //             id="movie__img"
        //             src=${IMG_URL + posterPath}
        //             alt="${title}"
        //         />
        //         <div class="card__details">
        //             <h3 id="movie__title" class="card__title">${title}</h3>
        //             <div class="rating">
        //                 <div>
        //                     <p id="vote__count">Votes: ${voteCount}</p>
        //                     <p id="vote__average">Rating: ${voteAverage}</p>
        //                 </div>
        //                 <div class="favorites">
        //                     <i class="${favorites ? "fa-solid" : "fa-regular"} fa-heart favorites__icon" data-id="${id}"></i>
        //                 </div>
        //             </div>
        //         </div>
        //     </li>
        // `;
    });

    favoritesIcon = document.querySelectorAll('.favorites__icon');
    favoritesIcon.forEach(favorite => {
        favorite.addEventListener('click', toggleFavorites)
    });
}

// ! =============== FAVORITES ===============

function checkFavorites() {
    movieData.forEach((movie) => {
        favoritesArray.forEach(favMovie => {
            if (movie.id === favMovie.id) {
                movie.favorites = true;
            }
        });
    });
}

function setFavoritesToLocal() {
    localStorage.setItem('favorite-movies', JSON.stringify(favoritesArray));
    if (favoritesBtn.classList.contains('active-tab')) {
        renderMovies(favoritesArray);
    }
}

function toggleFavorites(e) {
    if (e.target.classList.contains('fa-regular') && !favoritesArray.some(movie => movie.id === +e.target.dataset.id)) {
        e.target.classList.remove('fa-regular');
        e.target.classList.add('fa-solid');
        const currentMovie = movieData.find(movie => +e.target.dataset.id === movie.id);
        currentMovie['favorites'] = true;
        favoritesArray.push(currentMovie);
        setFavoritesToLocal(favoritesArray);
    } else {
        e.target.classList.remove('fa-solid');
        e.target.classList.add('fa-regular');
        favoritesArray = favoritesArray.filter((movie) => movie.id !== +e.target.dataset.id);
        setFavoritesToLocal();
    }
}

// ! =============== SORTING ===============

function sortByDate(e) {
    const movieArr = favoritesBtn.classList.contains('active-tab') ? favoritesArray : movieData;
    e.target.textContent = flagForDate ? 'Sort by date (latest to oldest)' : 'Sort by date (oldest to latest)';
    movieArr.sort((a, b) => {
        if (flagForDate) return new Date(b.releaseDate) - new Date(a.releaseDate);
        return new Date(a.releaseDate) - new Date(b.releaseDate);
    });
    renderMovies(movieArr);
    flagForDate = !flagForDate;
}

function sortByRating(e) {
    const movieArr = favoritesBtn.classList.contains('active-tab') ? favoritesArray : movieData;
    e.target.textContent = flagForRating ? 'Sort by rating (least to most)' : 'Sort by rating (most to least)';
    movieArr.sort((a, b) => {
        if (flagForRating) return b.voteAverage - a.voteAverage;
        return a.voteAverage - b.voteAverage;
    });
    renderMovies(movieArr);
    flagForRating = !flagForRating;
}

// ! =============== SEARCHING ===============

function searchMovie(e) {
    e.preventDefault();
    allBtn.classList.add('active-tab');
    favoritesBtn.classList.remove('active-tab');
    const searchInput = search.value;
    if (searchInput.trim()) {
        SEARCH_URL = `${searchURL}&query=${searchInput}`;
        getMovies(SEARCH_URL, 1);
    } else {
        getMovies(API_URL, currentPage);
        SEARCH_URL = '';
    }
    currentPage = 1;
    setPageNumberToLocal();
}

function checkDebounceDemo() {
    console.log('fetching data...');
}

function debounce(callbackFn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callbackFn(...args);
        }, delay);
    }
}

// ! =============== PAGINATION ===============

function checkPagesRange() {
    if (currentPage == 1) {
        previousPageBtn.disabled = true;
    } else {
        previousPageBtn.disabled = false;
    }
    if (currentPage == lastPage) {
        nextPageBtn.disabled = true;
    } else {
        nextPageBtn.disabled = false;
    }
    currentPageBtn.textContent = `Current page: ${currentPage}`;
}

function paginationHandler(e) {
    if (SEARCH_URL !== '') {
        if (e.target.id === 'previous__page__btn') {
            currentPage--;
            checkPagesRange();
            getMovies(SEARCH_URL, currentPage);
        } else if (e.target.id === 'next__page__btn') {
            currentPage++;
            checkPagesRange();
            getMovies(SEARCH_URL, currentPage);
        }
        return;
    }
    if (e.target.id === 'previous__page__btn') {
        currentPage--;
        checkPagesRange();
        getMovies(API_URL, currentPage);
        setPageNumberToLocal();
        location.reload();
    } else if (e.target.id === 'next__page__btn') {
        currentPage++;
        checkPagesRange();
        getMovies(API_URL, currentPage);
        setPageNumberToLocal();
        location.reload();
    }
}

function setPageNumberToLocal() {
    localStorage.setItem('page-number', currentPage);
}

/**
 * ! ================ EVENT LISTENERS ================
 */

window.addEventListener('DOMContentLoaded', () => {
    getMovies(API_URL, currentPage);
});
sortByRatingBtn.addEventListener('click', sortByRating);
sortByDateBtn.addEventListener('click', sortByDate);
form.addEventListener('submit', searchMovie);
// ? demo debounce method
// search.addEventListener('input', debounce(checkDebounceDemo, 1000));
// search.addEventListener('input', debounce(searchMovie, 1000));
favoritesBtn.addEventListener('click', (e) => {
    e.target.classList.add('active-tab');
    allBtn.classList.remove('active-tab');
    renderMovies(favoritesArray);
});
allBtn.addEventListener('click', (e) => {
    e.target.classList.add('active-tab');
    favoritesBtn.classList.remove('active-tab');
    renderMovies(movieData);
});
paginationContainer.addEventListener('click', paginationHandler);
