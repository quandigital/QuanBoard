Dashboard
=========

A first little Node.js project: A system and service health dashboard. All widgets with checks are configurable in json-files and can be chosen and ordered on a per user basis. This dashboard has no user management and was built to use existing MySQL user databases.

Implemented checks:

- Ping status of hosts
- SSH service Status based on a executed command and a RegEx pattern which must match
- MySQL service status based on a query that has to return 1
- IMAP/IMAPS status checks on mailbox folders for less than X unread mails in Y days

Requirements
------------
- MySQL database with user logins
- MongoDB database to store sessions and user data (chosen widgets with order)
- Curl for mailbox checks

Installation
------------
```
    # sudo apt-get install npm node-legacy mongodb curl
    # sudo npm install -g bower
    # sudo npm install -g supervisor
    # cd <project dir>
    # npm install
    # bower install
```

Configuration
-------------

### config/config.json

- home: dashboard page path
- login: login page path
- logout: logout page path
- port: application port
- sessionSecret: secret for session hash used in express-session
- mongodb: MongoDB connection data to store sessions and active widgets with order for each user 
- mysql: MySQL connection information for authentication

### config/auth.js

Authentication check using the MySQL connection from config.json and the username and password from the login form.

- Success: pass the user ID to the callback
- Fail: pass false to the callback

### config/widgets.js

Basic widget configuration

- Currently just the text appearing as widget text in front of the widget description

### config/widget/machine-alive.json

Just insert descriptions with  host addresses to the file:

```
{
  "description 1": "host address 1",
  "description 2": "host address 2",
  (...)
  "description n": "host address n"
}
```

Example

- description: "Server X (MySQL slave)"
- host address: "192.168.1.111"

### config/widget/mysqldata-alive.json

Insert descriptions with MySQL connection data and a check query to the file.

The status is ok, if
- the first value of the first row evaluates to true

The status is not ok, if
- the response is empty
-  the first value of the first row evaluates to false

```
{
  "description 1": {
    "connection": {
      "host": "host address 1",
      "user": "user 1",
      "password": "password 1",
      "database": "database 1"
    },
    "query": "query for check 1"
  },
  (...)
}
```

Example

- description: "New entry in last 24h for service X"
- connection: "192.168.1.111"
- user: "user"
- password: "pass"
- database: "service_x"
- query: "SELECT 1 FROM check_table WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 DAY) LIMIT 1;"

### config/widget/service-alive.json

You can authenticate using a password or ssh key. Place the ssh key inside config/ssh-keys. You can create key files with ssh-keygen and ssh-copy-id:
```
  # ssh-keygen -t rsa -C "dashboard@node" -f ./config/ssh-keys/dashboard_rsa -N ""
  # ssh-copy-id -i ./config/ssh-keys/dashboard_rsa.pub root@xxx.xxx.xxx.xxx
```

```
{
  "description 1": {
    "connection": {
      "host": "host address 1",
      "username": "user 1",
      "password": "password"
    },
    "check": {
      "command": "command 1",
      "expectation": "regex 1"
    }
  },
  "description 2": {
    "connection": {
      "host": "host address 2",
      "username": "user 2",
      "ssh_key": "key file"
    },
    "check": {
      "command": "command 1",
      "expectation": "regex 1"
    }
  },
  (...)
}
```

Example 1 using password:

- description: "Nginx running on 192.168.1.112"
- host: "192.168.1.112"
- username: "user"
- password: "pass"
- command: "sudo service nginx status"
- expectation "nginx is running"

Example 2 using key:

- description: "Supervisord running on 192.168.1.113"
- host: "192.168.1.113"
- username: "user"
- ssh_key: "dashboard_rsa"
- command: "sudo service supervisord status"
- expectation "supervisord is running"

### config/widget/too-many-mails.json

Insert a description with connection url, user and password and a check with a folder, number of days and a limit. The widget status is ok, if the folder contains <limit> or less unread mails in the last <days> days.  

```
{
  "description 1": {
    "connection": {
      "url": "url 1",
      "username": "user 1",
      "password": "password 1"
    },
    "check": {
      "folder": "folder 1",
      "days": X,
      "limit": Y
    }
  },
  (...)
}
```

Example:
- description: "Mailbox has less than 10 mails in last 3 days"
- url: "imaps://server.tld:993"
- username: "user@server.tld"
- password: "pass"
- folder: "INBOX/Subfolder"
- days: 3
- limit: 10

### server.js, config/express.js and config/routes.js

- server.js: Initial server setup
- config/express.js: Express setup
- config/routes.js: Basic routes setup

Change these if you know what you're doing.

How to run
----------

```
    # supervisor --extensions 'node|js|json|html|css' -- server.js
```
