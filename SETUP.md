# Dear Diary Setup

## Dependencies 

node package - sqlite3
___

## System requirements

* Development OS: Windows 11 Pro 22H2
* min. Node.js version: 18.12
* min. sqlite3 version: 5.1.1

___

## Setup

1. Download the src folder and put it in your root folder
2. Install node.js and npm on your system -> https://nodejs.org/en/
3. Install node package sqlite3 in src folder (Terminal): ```npm install sqlite3```
4. Start server.js (Terminal): ```node server.js```
5. The server is running on port 80

___

## User manual

*Info:* A test user was added to skip the registration process if wanted
    * Username: test@tester.com
    * Password: hallo123$

1. Open webserver address in browser
2. Register(E-mail address, Password: Min. 6, max. 30 characters, at least one number and one special character !@#$%^&*_=+-)
3. Log in with your credencials
4. After login, you will be forwarded to the dashboard
5. The dashboard has three sections 
    * Recently added memories <= 7 days
    * n months/years ago
    * favorites
6. **NEW MEMORY**: Click into the input field at the top, then enter your information and hit save button. Then the entry will be saved - The dashboard will be updated
7. **UPDATE MEMORY**: Hover over a memory in the dashboard and click the edit symbol - Now you can adapt your information and hit the save button. The entry will be updated
8. **DELETE MEMORY**: Hover over a memory in the dashboard and click the delete symbol
9. **SEARCH FOR MEMORIES**: 
    * Click on the filter symbol left of the input field. 
    * Enter a value to search for any field within a memory. 
    * Select a favorite or mood status.
    * Hit search button
    
    After you have hit the search button, you can see the amount of results below the filter symbol. Whith a click on that, the filter will be reseted.
10. **LOG OUT** Hit the Log Out button.
___
