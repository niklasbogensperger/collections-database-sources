app.api.tmdb.api_key = "YOUR API KEY";
app.api.tmdb.language = "en-US";

let tvShow = app.api.tmdb.getTV(app.params.id);

if (tvShow == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(tvShow.name, "name");
builder.setString(tvShow.originalName(), "original-name");
builder.setImage(tvShow.requestPoster(), "poster");
builder.setDate(tvShow.firstAirDate, "air-date");
// builder.setManagedDocuments(tvShow.seasons, "seasons");
builder.setDocuments(tvShow.genresAsDocuments(), "genres");
builder.setString(tvShow.overview, "synopsis");
builder.setDocuments(tvShow.actors(10), "actors");
builder.setString(tvShow.id, "tmdb-id");

app.result(builder);
