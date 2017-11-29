const functions = require('firebase-functions')
const admin = require('firebase-admin')
const request = require('request')
const neo4jConfig = require('./../config/neo4j.json')
const { ParameterError, MethodError } = require('./errors')

// init firebase
admin.initializeApp(functions.config().firebase)
const db = admin.firestore(); // Initialize on Cloud Functions 

/**
 * 최단경로 조회하는 메서드
 */
exports.directions = functions.https.onRequest(async (req, res) => {
  const { method } = req
  try {
    switch (method) {
    case 'POST':
      const result = await getDirections(req, res)
      res.status(200).json(result)
      break
    default:
      throw new MethodError()
    }
  } catch (err) {
    res.status(err.code || 500).send(err.message)
  }
})

/**
 * POST 요청을 받아서, 
 * source와 destination의 최단 경로를 반환한다. 
 */
async function getDirections(req, res) {
  const { source, destination } = req.body;
  if (source === undefined || destination === undefined)
    throw new ParameterError('Source, destination is required')
  const sourceID = await getNeo4jID(source)
  const destinationID = await getNeo4jID(destination)
  const relationships = await getShortestPath(sourceID, destinationID)
  const results = []
  for (let url of relationships) {
    results.push(await getRelationshipId(url))
  }
  return results
}

/**
 * neo4j에 dijkstra 최단경로를 조회하는 메서드 
 * relationship id 의 url 배열을 반환한다. 
 */
function getShortestPath(sourceID, destinationID) {
  // TODO: 입력값의 filter에 따라 relationship의 타입 개수를 지정해야함
  const relationshipTypeName = 'BICYCLE_TO'

  const { username, password } = neo4jConfig
  const postBody = {
    to : `${neo4jConfig.host}/db/data/node/${destinationID}`,
    cost_property : 'time',
    relationships : {
      type : relationshipTypeName || 0,
      direction : 'out'
    },
    algorithm : 'dijkstra'
  }
  const options = {
    method: 'POST',
    body: postBody,
    json: true,
    url: `${neo4jConfig.host}/db/data/node/${sourceID}/path`,
  }

  return new Promise((resolve, reject) => {
    const error = {}
    request.post(options, (error, res, body) => {
      if (error) return reject(error)
      return resolve(body.relationships)
    }).auth(username, password, false);
  })
}

/**
 * url을 통해
 * neo4j 서버에 relationship의 정보를 조회하고 
 * 결과값을 반환한다. 
 */
function getRelationshipKey(url) {
  const { username, password } = neo4jConfig
  return new Promise((resolve, reject) => {
    request.get(url + 'properties/{key}', (error, res, body) => {
      if (error) return reject(error)
      return resolve(body)
    }).auth(username, password, false)
  })
}

/**
 * neo4j id 값으로
 * 해당 node 또는 relationship의 세부 정보를 반환한다. 
 */
function getRelationshipByID (id) {
  const { username, password } = neo4jConfig
  const postBody = {
    query : 'MATCH (x) WHERE ID(x) = $id RETURN x',
    params : { id }
  }
  const options = {
    method: 'POST',
    body: postBody,
    json: true,
    url: `${neo4jConfig.host}/db/data/cypher`,
  }

  return new Promise((resolve, reject) => {
    const error = {}
    request.post(options, (error, res, body) => {
      if (error) return reject(error)
      return resolve(body.data[0][0])
    }).auth(username, password, false)
  })
}

/**
 * waypoint key값을 입력받고,
 * 해당 node 또는 relationship의 neo4j id를 반환한다. 
 */
function getNeo4jID (keyOfWaypoint) {
  const { username, password } = neo4jConfig
  const postBody = {
    query : 'MATCH (x) WHERE x.key = $key RETURN ID(x)',
    params : {
      key: keyOfWaypoint
    }
  }
  const options = {
    method: 'POST',
    body: postBody,
    json: true,
    url: `${neo4jConfig.host}/db/data/cypher`,
  }

  return new Promise((resolve, reject) => {
    const error = {}
    request.post(options, (error, res, body) => {
      if (error) return reject(error)
      return resolve(body.data[0][0])
    }).auth(username, password, false);
  })
}
