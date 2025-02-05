# Sources for Collections Database

Scripts to add/modify available API sources in the Collections Database app.


## APIs

- **BoardGameGeek (BGG) / VideoGameGeek (VGG)**: new source completely from scratch
  - **Search**: search for board games and video games (exact and non-exact query modes available)
  - **Board Game Details**: retrieve information about games, including:
    - Cover image
    - Release year
    - Recommended number of players
    - Average playtime
    - Categories (genres)
    - Game mechanics
    - Description
    - Game designers
    - Main publisher
  - **Video Game Details**: retrieve information about games, including:
    - Cover image
    - Release date
    - Development studios
    - Platforms
    - Player modes
    - Supported number of players
    - Genres
    - Description
- **Google Books**: added methods to existing implementation
  - **Item Details**: get extra information, including:
    - Subtitle
    - Primary language
    - Properly formatted descriptions without HTML tags
    - Categories (genres) as documents in a subcollection instead of in a list
- **TMDB**: added methods to existing implementation
  - **Search**: search items by TMDB ID if they can't be found using text queries (happens in rare edge cases)
  - **Item Details**: get extra information, including:
    - Title in original language
    - Genres as documents in a subcollection instead of in a list


## Setup

Copy the contents of the scripts into the respective editors in the app and modify the collection's fields accordingly. In the case of the TMDB scripts, an API key is needed as well. In general, you can refer to the documentation provided by the Collections Database app developer.
