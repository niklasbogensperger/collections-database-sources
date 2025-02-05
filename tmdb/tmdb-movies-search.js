app.api.tmdb.api_key = "YOUR API KEY";
app.api.tmdb.language = "en-US";

let queryText = app.query.value.trim();

if (queryText.startsWith("id:")) {
    // "search" by id
    let id = queryText.substring(3).trim();
    let results = app.api.tmdb.searchMovieById(id);
    app.result(results);
} else {
    // search by query (default)
    let results = app.api.tmdb.searchMovies(app.query);
    app.result(results);
}
