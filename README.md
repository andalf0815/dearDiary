# Dear Diary

## Description

**Dear Diary** is a light digital diary which is client - server based 

It's necessary to create a user

## Dependencies 

node package - sqlite3

## Installing

1. Put the src folder to your root folder on the webserver.
2. Install npm
3. Install node package sqlite3 in src folder (Terminal): ```npm install sqlite3```
4. Start server.js (Terminal): ```node server.js```

## User manual

1. Open webserver address in browser
2. Register & then log in
3. After login, you will be forwarded to the dashboard
4. The dashboard hash three sections (1. Recently added memories <= 7 days, 2. Today x months/years ago, 3. favorites)
5. To enter a new memory, click into the input field at the top - a dialog opens
6. Enter your information which you want to save (Title and date is mandatory)
7. NEW MEMORY: Click save and the entry will be saved - The dashboard will be updated
8. UPDATE MEMORY: Hover over a memory in the dashboard and click the edit symbol - The dialog will be opened with the current data. With save the memory will be updated
9. DELETE MEMORY: Hover over a memory in the dashboard and click the delete symbol
