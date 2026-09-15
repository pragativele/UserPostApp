const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    //post model saved userid who do the post with there date content of post,likes(as array where each post has bunch of likes)
   user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'user'
   },
   date: {
    type: Date,
    default: Date.nom
   },
   content: String,
   likes: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'user'}
   ]
})

module.exports = mongoose.model('post', postSchema);