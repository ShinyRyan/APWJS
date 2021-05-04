MAKE SURE TO:
cd into project
run 'npm install' 
 
run git clone https://github.com/ShinyRyan/APWJS and then
      mongorestore --nsInclude=HangmanDB for db access

Port:
localhost:7000

      use 'mongodump --db HangmanDB' if you made any changes to db you want to save

mongo commands copypasta cause I'm lazy
      use HangmanDB
      users=db.getCollection("user") 
      hints=db.getCollection("hints")
      words=db.getCollection("words")
      
All code (classes/functions/etc) are documented with the creater of said code under each portion of the code via comments.
Sources other than group members are properly given credit with a comment to that source under the portion of code/file.
