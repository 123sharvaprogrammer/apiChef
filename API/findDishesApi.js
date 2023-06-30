const {
	MongoClient, ObjectId
} = require("mongodb");
const {
	Client
} = require('@elastic/elasticsearch');

const Transform = require("stream").Transform;

const defaultElasticSettings = {
	"index": {
		"number_of_replicas": 0
	}
};

const userMappings = {
	"name": {
		"type": "text",
		"fields": {
			"keyword": {
				"type": "keyword",
				"ignore_above": 256
			}
		}
	},
	"email": {
		"type": "text",
		"fields": {
			"keyword": {
				"type": "keyword",
				"ignore_above": 256
			}
		}
	},
};

const serverShutDownMins = 2 * 60 * 1000;

let esClient = {};

/**
 * Creates a connection to mongodb
 * */
async function _connectToMongo() {
	const dbName = "Users";
	const mongoUri = process.env.MONGO_URI || "mongodb+srv://CompanyDB:dm9s4CMnCxUGtge@cluster0.daj289t.mongodb.net/CompanyDB?retryWrites=true&w=majority";
	const mongoClient = new MongoClient(mongoUri);
	await mongoClient.connect();
	const db = mongoClient.db(dbName);
	return db;
}

/**
 * Creates a connection to elastic-search
 * */
async function _connectToES(index) {

	const isNonProd = process.env.NODE_ENV !== "prod";
	const esUri = process.env.ES_URI || "http://localhost:9200";
	esClient = new Client({
		node: esUri
	});

	const indexFound = await esClient.indices.exists({
		index
	});

	if (!indexFound) {
		await _createIndex();
		await _putSettings();
		await _putMapping();
	}
}

/**
 * deletes an index in elastic-search
 * */
async function _deleteIndex(index) {
	await esClient.indices.delete({
		index
	});
}

/**
 * Creates a new index in elastic-search
 * */
async function _createIndex(index) {
	await esClient.indices.create({
		index, body: {
			settings: {
				index: {
					number_of_replicas: 0
				}
			}
		}
	});
}

/**
 * Applies index settings to an existing index
 * */
async function _putSettings(index, settings = defaultElasticSettings) {
	await esClient.indices.close({
		index
	});
	await esClient.indices.putSettings({
		index, body: {
			settings
		}
	});
}

/**
 * Index mapping to user schema
 * */
async function _putMapping(index, properties = userMappings) {
	await esClient.indices.open({
		index
	});
	await esClient.indices.putMapping({
		index, body: {
			properties
		}
	});
}

/**
 * Here you can transform your data
 * in any way you want to
 */
const transformedStreamData = new Transform({
	readableObjectMode: true,
	writableObjectMode: true
});
transformedStreamData._transform = function (item, enc, cb) {
	if (item) {
		item.last_sync_at = new Date();
		transformedStreamData.push(item);
		cb();
	} else {
		process.exit(1);
	}
};

/**
 * Fetches data from mongodb **/
async function _fetchFromMongodb(db, mongoId, index) {
	const collection = db.collection('Users');
	const query = mongoId ? {
		'_id': {
			$gt: mongoId
		}
	} : {};
	const options = {};
	const stream = await collection.find(query, options).stream();
	stream.on("end", function (err) {
		console.info(`closing stream now , any error ? ${err} AND shutting down script in ${serverShutDownMins / (60000)} mins `);
		setTimeout(() => {
			process.exit();
		}, serverShutDownMins);
	});

	await esClient.helpers.bulk({
		retries: 3,
		wait: 3000,
		datasource: stream.pipe(transformedStreamData),
		onDocument(doc) {
			const _id = doc._id;
			delete doc._id;
			return {
				index: {
					_index: index,
					_id
				}
			}
		},
		onDrop(doc) {
			console.error("FAILED DOC ", doc._id);
		}
	});
}

/**
 * Recurring Sync needs last doc inserted id
 * using this id will fetch only docs inserted after this id
 * **/
async function _getLastDocFromES(index) {
	let lastDocId = null;
	const result = await esClient.search({
		index, "size": 20, "sort": {
			"created_at": "desc"
		}, "query": {
			"match_all": {}
		}
	});

	const records = result.hits.hits || [];

	if (Array.isArray(records) && records.length) {
		records.forEach(a => {
			lastDocId || (lastDocId = ObjectId(a._id)), ObjectId(a._id) > lastDocId && (lastDocId = a._id);
		});
	}

	return lastDocId;
}

/**
 * Main Logic Code Block
 * **/
async function sync() {
	try {
		const searchIndex = "channel :";
		const db = await _connectToMongo();
		await _connectToES();
		const lastDocId = await _getLastDocFromES(searchIndex);
		await _fetchFromMongodb(db, lastDocId);
	} catch (ex) {
		console.trace("EXCEPTION : ", ex, JSON.stringify(ex));
		process.exit(1);
	}
}

sync();