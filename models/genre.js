const Joi = require("joi");
const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
});

const Genre = mongoose.model("Genre", genreSchema); //基于 genreSchema 创建了一个模型 Genre，
// 用于与数据库中的 genres 集合进行交互（增删查改）。

function validateGenre(genre) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
  });

  return schema.validate(genre); //新写法，和Mosh过时的不同
}

//旧写法
/* function validateGenre(genre) {
  const schema = {
    name: Joi.string().min(5).required(),
  };

  return Joi.validate(genre, schema); // ❌ 这行报错
} */

exports.genreSchema = genreSchema;
exports.Genre = Genre;
exports.validate = validateGenre;
