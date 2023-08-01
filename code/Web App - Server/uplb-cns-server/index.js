const app = require('./app')
const connect_db = require('./firestore').connect_db

try{
  connect_db()
  app.start();
}
catch(e){
  console.log("Something went wrong: ", e)
}
