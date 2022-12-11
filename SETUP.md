# Dear Diary Setup

## System requirements

* Development OS: Windows 11 Pro 22H2
* min. Node.js version: 18.12
* min. sqlite3 version: 5.1.1 (node package)
* min. Git Bash version: 2.38.1

___

## Node.js dependencies 

node package - sqlite3
___

## Setup

1. Download and install Git Bash -> https://git-scm.com/downloads
1. Download and install node.js and npm -> https://nodejs.org/en/
2. Clone the repository https://andreasgru@git.wifi.messner.top/Projekte/Projekt-AndreasGru.git and move to src/ folder in Git Bash 
3. Install node package sqlite3 in src folder: ```npm install sqlite3``` or ```npm install```
4. Start server.js: ```node server.js```
5. The server is running on port 80

___

## User manual

*Info:* A test user was added to skip the registration process if wanted
* Username: test@tester.com
* Password: hallo123$
___

1. Open webserver address in browser
2. Register (E-mail address, Password: Min. 6, max. 30 characters, at least one number and one special character !@#$%^&*_=+-)
3. Log in with your credencials
4. After login, you will be forwarded to the dashboard
5. The dashboard has three sections 
    * Recently added memories <= 7 days
    * n months/years ago
    * Favorites
6. **NEW MEMORY**: Click into the input field at the top, then enter your information and hit save button. Then the entry will be saved - The dashboard will be updated
    * For adding tags, just enter a text in the proper field and click enter to accept the change. For deleting tags just click on th "x" symbol.
7. **UPDATE MEMORY**: Hover over a memory in the dashboard and click the edit symbol - Now you can adapt your information and hit the save button. The entry will be updated
8. **DELETE MEMORY**: Hover over a memory in the dashboard and click the delete symbol
9. **SEARCH FOR MEMORIES**: 
    * Click on the filter symbol left of the input field. 
    * Enter a value to search for any field within a memory. 
    * Select a favorite or mood status.
    * Hit search button
10. **Detail View**: Hover on a memory in the dashboard and click the magnifying glass symbol. (Click it again to close the detail view)
    After you have hit the search button, you can see the amount of results below the filter symbol. Whith a click on that, the filter will be reseted.
10. **LOG OUT** Hit the Log Out button.
___
