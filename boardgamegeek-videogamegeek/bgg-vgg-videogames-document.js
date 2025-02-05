let videoGame = app.api.bgg.getThing(app.params.id, "video-game");

if (videoGame == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(videoGame.name, "title");
builder.setImage(videoGame.cover, "cover");
builder.setDate(videoGame.releaseDate, "release-date");
builder.setDocuments(videoGame.developers, "developers");
builder.setDocuments(videoGame.platforms, "platforms");
builder.setListItems(videoGame.modes, "modes");
builder.setString(videoGame.players, "players");
builder.setDocuments(videoGame.genres, "genres");
builder.setString(videoGame.description, "description");
builder.setString(videoGame.id, "vgg-id");

app.result(builder);
