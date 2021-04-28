MAKE SURE TO:
run 'npm install'
run 'npm install pug'
run 'npm install mongodb'
run 'npm install express'
run 'npm install crypto'
run 'npm install express-session'
run 'npm install mathjs'
run 'npm install mongoose'
run 'npm install bootstrap'
run 'npm install jquery'
run 'npm install popper'


run git clone https://github.com/foomun/apw-hangman and then
      mongorestore --nsInclude=HangmanDB for db access

      use 'mongodump --db HangmanDB' if you made any changes to db you want to save

mongo commands copypasta cause I'm lazy
      use HangmanDB
      users=db.getCollection("user") 
      hints=db.getCollection("hints")
      words=db.getCollection("words")