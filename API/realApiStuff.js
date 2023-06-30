const mongoosastic =require("mongoosastic");
const mongoose = require("mongoose")
var BlogSchema = new mongoose.Schema({
    email: { type: String, es_indexed: true },
    blog_text: { type: String },
    author_name: { type: String },
    sequence_num: Number,
    category: { type: String  },
    created_at: { type: Date, default: Date.now },
    modified_at: { type: Date, default: Date.now },
    is_verified: { type: Boolean }
  });
  BlogSchema .plugin(mongoosastic);
  var Blog = mongoose.model('Blog', BlogSchema , 'blogs');
  var stream = Blog.synchronize();
stream.on('error', function (err) {
  console.log("Error while synchronizing" + err);
});
blog.save(function(err){
    if (err) throw err;
    /* Document indexation on going */
    blog.on('es-indexed', function(err, res){
      if (err) throw err;
      /* Document is indexed */
      });
  });
  blog.remove(function(err) {
    if (err) throw err;
    /* Document unindexing in the background */
    blog.on('es-removed', function(err, res) {
      if (err) throw err;
      /* Document is unindexed */
    });
  });  

  var collections = ["Authors"];
var fields = ["email"]
var filter = {
  "is_verified": true
};
var sort = "_score";
Blog.search({
    bool: {
      must: [{
        multi_match: {
          query: searchString,
          type: "phrase",
          fields: fields,
        },
      }],
      should: [{
        multi_match: {
          query: searchString,
          fields: fields,
          operator: "and",
          boost: 10,
          minimum_should_match: "100%"
        },
      }],
      filter: [{
        term: filter
      }]
     }
   }, {
     index: collections,
     from: from,
     size: 10,
     track_scores: true,
     sort: sort
    },
    function (err, results) {
      if (err) {
         console.log("Error in searchController: ", err);
       } else {
         res.json({result: results.hits.hits})
       }
     });