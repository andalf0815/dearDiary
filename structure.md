# File structure ***Dear Diary***

Folder/*File*                                             | Purpose
-----------                                               | --------
**docs**                                                  | Folder which stores the document related to the project
&nbsp;&nbsp; *Dear Diary - Final Presentation.pptx*       | Final presentation of the project
&nbsp;&nbsp; *Dear Diary - Idea Presentation.pptx*        | Presentation of the project
&nbsp;&nbsp; *Dear Diary - Milestone I Presentation.docx* | First Milestone presentation
&nbsp;&nbsp; *Dear Diary - Milestone II Presentation.docx*| Second Milestone presentation
&nbsp;&nbsp; *Dear Diary - Projecthandbook.docx*          | Projecthandbook of the project
&nbsp;&nbsp; *Dear Diary - Wireframe.png*                 | Wireframe of the software
**src**                                                   | Folder which stores the source code of the project           
&nbsp;&nbsp; **api**                                      | Folder for storing api for the database           
&nbsp;&nbsp;&nbsp;&nbsp; *setNewMemory.js*                | Stores functions to insert new memories and all associated data           
&nbsp;&nbsp; **config**                                   | Folder for storing configuration files           
&nbsp;&nbsp;&nbsp;&nbsp; *accesslist.json*                | Stores information about the access permissions for the client           
&nbsp;&nbsp;&nbsp;&nbsp; *config.json*                    | Stores information about global settings of the webserver           
&nbsp;&nbsp; **data**                                     | Folder for storing base data files
&nbsp;&nbsp;&nbsp;&nbsp; *db.sqlite* (if already created) | Sqlite database for storing the memories          
&nbsp;&nbsp;&nbsp;&nbsp; *mimetypes.json*                 | Stores the different mimetypes in json format           
&nbsp;&nbsp;&nbsp;&nbsp; *users.json*                     | Stores the access data for each registered user           
&nbsp;&nbsp; **images**                                   | Folder for storing icons and images            
&nbsp;&nbsp; **lib**                                      | Folder for storing support functions
&nbsp;&nbsp; **node_modules**                             | Folder for storing modules for Node.js
&nbsp;&nbsp;&nbsp;&nbsp; *helpers.js*                     | Stores supporting funcitons for the webserver           
&nbsp;&nbsp; **pages**                                    | Folder for storing html pages and their embedded JavaScript files           
&nbsp;&nbsp;&nbsp;&nbsp; *dashboard.html*                 | First page where the user lands after log in, and where are the memories are shown
&nbsp;&nbsp;&nbsp;&nbsp; *dashboard.js*                   | JavaScript file for the page *dashboard.html*           
&nbsp;&nbsp; **styles**                                   | Folder for storing css files
&nbsp;&nbsp;&nbsp;&nbsp; *design.css*                     | Css file for the software
&nbsp;&nbsp;&nbsp;&nbsp; *design.scss*                    | Scss file for the software
&nbsp;&nbsp; **templates**                                | Folder for storing HTML main tags components           
&nbsp;&nbsp;&nbsp;&nbsp; *body.html*                      | Template for the html body tag
&nbsp;&nbsp;&nbsp;&nbsp; *foot.html*                      | Template for the html foot tag
&nbsp;&nbsp;&nbsp;&nbsp; *head.html*                      | Template for the html head tag
&nbsp;&nbsp;*.gitignore*                                  | Stores folders/files which should not be included in the git repository           
&nbsp;&nbsp;*favicon.ico*                                 | Icon for the browser tab           
&nbsp;&nbsp;*package-lock.json*                           | Stores an exact, versioned dependency tree of the node packages
&nbsp;&nbsp;*package.json*                                | Stores dependencies of the node packages
&nbsp;&nbsp;*index.html*                                  | Login page
&nbsp;&nbsp;*server.js*                                   | File which creates the webserver
*CHANGELOG.md*                                            | Stores the changelog of the software
*README.md*                                               | Readme file
*SETUP.md*                                                | Stores the installation instruction and user manual
*STRUCTURE.md*                                            | Stores the folder structore of the project
