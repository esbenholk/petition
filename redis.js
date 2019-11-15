const redis = require("redis");
const { promisify } = require("util");
var client = redis.createClient({
    ////makign a variable that contains a new client, which is passed an object that defines its address
    host: "localhost",
    port: 6379
});

client.on("error", function(err) {
    console.log("redis isnt running", err);
});
exports.setex = promisify(client.setex.bind(client)); ///bind is attached to all functions, it returns a new function, that is the same that you passed bind on,except THIS inside is permanently tha passed value to bind()
exports.get = promisify(client.get.bind(client));
exports.del = promisify(client.del.bind(client));
// client.setex("redisKeyName", 60, "redisKeyValue", function(err, data) {
//     console.log(err, data);
// });
