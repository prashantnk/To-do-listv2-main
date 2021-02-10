//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-prashant:"+process.env.PASSWORD+"@cluster0.kjv0j.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("item", itemSchema);
item1 = new Item({ name: "Welcome to your TO-DO-List", __v: "10" });
item2 = new Item({ name: "Hit '+' to add new task", __v: "10" });
item3 = new Item({ name: "<- Hit this to delete task", __v: "10" });
const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = new mongoose.model("list", listSchema);

const workItems = [];

app.get("/", function (req, res) {
  const day = date.getDate();
  Item.find({}, (err, val) => {
    if (val.length == 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) console.log(err);
        else console.log("default done");
      });
      res.redirect("/");
    } else
      res.render("list", { listTitle: day, newListItems: val });
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const task = new Item({ name: itemName });
  const listName = req.body.list;
  if (listName === date.getDate()) {
    task.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName }, (err, result) => {
      result.items.push(task);
      result.save();
      res.redirect(`/${listName}`);
    })
  }
});
app.post("/delete", (req, res) => {
  const id = req.body.todel;
  const listName = req.body.listName;
  if (listName == date.getDate()) {
    Item.findByIdAndRemove(id, (err) => {
      if (!err) console.log("success");
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name : listName} , {$pull : {items : {_id : id}}} , (err , f)=>{
      res.redirect(`/${listName}`);
    });
  }

})

app.get("/:customListName", (req, res) => {
  const listName = _.capitalize(req.params.customListName);
  List.findOne({ name: listName }, (err, result) => {
    if (!err) {
      if (!result) {
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect(`/${listName}`);
      }
      else res.render("list", { listTitle: listName, newListItems: result.items });
    }
  })

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
