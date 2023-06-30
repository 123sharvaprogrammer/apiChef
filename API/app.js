const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const client = new Client({
    node: 'http://<host>:9200',
    auth: {
        username: 'elastic',
        password: '5wRDwZ2OFVF-T9T-RXZb',
    },
    tls: {
        requestCert: true,
        ca: fs.readFileSync('./ca.crt'),
        rejectUnauthorized: true,
    }
});

async function run() {
    await client.indices.exists({
        index: 'events_index'
    })

    return true;
}

run().catch(console.log);
