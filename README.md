# Idmagram

Idmagram is an image sharing web app created using [Express](https://www.npmjs.com/package/express) and [MySQL](https://www.mysql.com).

To use Idmagram, create a database by importing the app's data and structures, present on the [`data-and-structure.sql`](/data-and-structure.sql) file. Then, update the [database configuration file](/config/database-config.js) to match your `host`, `username` and `password` credentials.

Finally, install all the [Node](https://nodejs.org/) dependencies and run the server using :

```
npm install
node app.js
```
