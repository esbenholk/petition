const { setex, get, del } = require("./redis");

setex("redisKeyName", 60, "redisKeyValue");



setex("redisKeyName", 60, JSON.stringify({name: "esben", action: function(){ console.log("hello")})
});
