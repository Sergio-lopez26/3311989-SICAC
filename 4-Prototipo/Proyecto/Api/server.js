const jsonServer = require('json-server');
const auth = require('json-server-auth');
const fs = require('fs');
const bycrypt = require('bcryptjs');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
server.db=router.db;
const middlewares = jsonServer.defaults();

server.use(middlewares);

//crear admin si no existe

server.use(auth);
server.use(router);

server.listen(3000, () => {
        console.log("Api corriendo")
    })
