import MongoConnection from "./MongoConnection.js";
const {
  MONGO_CONNECTION,
  MONGO_PASSWORD,
  MONGO_CLUSTER,
  DB_NAME
} = process.env;
const connectionString = `${MONGO_CONNECTION}:${MONGO_PASSWORD}@${MONGO_CLUSTER}`;
const mongoConnection = new MongoConnection(connectionString, DB_NAME);
const collectionMovies = mongoConnection.getCollection("movies");
const collectionComment = mongoConnection.getCollection("comments");
async function getMovies2010ComedyRatingGreaterAvg() {
  return await collectionMovies.aggregate([
    { //stage $matchfor filtering only movies tha have imdb.rating different from empty string
      '$match': {
        'imdb.rating': {
          '$ne': ''
        }
      }
    }, {//stage $group for getting average rating for all movies and all embeded documents containing title, rating, year and genres
      '$group': {
        '_id': null, 
        'avgRating': {
          '$avg': '$imdb.rating'
        }, 
        'documents': {
          '$push': {
            'title': '$title', 
            'rating': '$imdb.rating', 
            'year': '$year', 
            'genres': '$genres'
          }
        }
      }
    }, { //stage for unwinding array of documents
      '$unwind': {
        'path': '$documents'
      }
    }, { //matching stage for filtering all movies released at 2010, having genre Comedy and imdb.rating greater than the average value
      '$match': {
        '$and': [
          {
            'documents.year': 2010, 
            'documents.genres': 'Comedy'
          }, {
            '$expr': {
              '$gt': [
                '$documents.rating', '$avgRating'
              ]
            }
          }
        ]
      }
    }, {
      '$project': { //required projection of only title and rating
        'title': '$documents.title', 
        'rating': '$documents.rating', 
        '_id': 0
      }
    }
  ]).sort({"rating":-1}).toArray()
}
async function getCommentsWithMovieTitleInsteadMovieId(){
  return collectionComment.aggregate([
 
  {
      '$lookup': {
          'from': 'movies',
          'localField': 'movie_id',
          'foreignField': '_id',
          'as': 'movies'
      },
    },
      {
        '$match': {
            'movies.0': {
                '$exists':true
            }
        }
    }, {
      '$limit': 5
  }, {
       '$addFields':{'movie_title':{$arrayElemAt: ["$movies.title",0]}}
    }, {
        '$project': {
            'movies': 0,
            'movie_id': 0
        }
    }
  
  
]).toArray();}
//console.log(await getMovies2010ComedyRatingGreaterAvg());
console.log(await getCommentsWithMovieTitleInsteadMovieId())
mongoConnection.close();