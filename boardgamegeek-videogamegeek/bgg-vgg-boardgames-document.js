let boardGame = app.api.bgg.getThing(app.params.id, "board-game");

if (boardGame == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(boardGame.name, "title");
builder.setImage(boardGame.cover, "cover");
builder.setInteger(boardGame.year, "year");
builder.setString(boardGame.players, "players");
builder.setString(boardGame.playtime, "playtime");
builder.setDocuments(boardGame.categories, "categories");
builder.setDocuments(boardGame.mechanics, "mechanics");
builder.setString(boardGame.description, "description");
builder.setDocuments(boardGame.designers, "designers");
builder.setString(boardGame.publisher, "publisher");
builder.setString(boardGame.id, "bgg-id");

app.result(builder);
