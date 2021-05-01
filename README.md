MAKE SURE TO:
cd into project
run 'npm install'

run git clone https://github.com/ShinyRyan/APWJS and then
      mongorestore --nsInclude=HangmanDB for db access

      use 'mongodump --db HangmanDB' if you made any changes to db you want to save

mongo commands copypasta cause I'm lazy
      use HangmanDB
      users=db.getCollection("user") 
      hints=db.getCollection("hints")
      words=db.getCollection("words")