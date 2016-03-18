'use strict';

const hunts = require('./transactions/hunts');
const db = require('./index');

var mockHunt = {
  hunt_id: 1,
  isOwner: true,
  showNextClue: true,
  wager: "Loser buys a beer",
  deadline: "2016-12-17 07:37:16-08",
  participants: [
    {
      participant_id: 2,
      username: "ColinRobot",
      progress: 2
    },
    {
      participant_id: 3,
      username: "PPPetrov",
      progress: 4
    }
  ],
  clues: [
    {
      clue_id: 1,
      clue_number: 1,
      description: 'Where General Assembly Began',
      lat: 25.0876534,
      lng: -80.234214
    },
    {
      clue_id: 2,
      clue_number: 2,
      description: 'Where General Assembly Began',
      lat: 25.1276534,
      lng: -80.344214
    }
  ]
};


function add(req, res, next){
  var user_id = req.user.user_id;
  var newHunt = req.body;
  newHunt.owner_id = user_id;
  hunts.insertHunt(newHunt)
  .then((data) => {
    res.data = data;
    next();
  })
  .catch((err) => {
    console.error(err);
    res.json({success: false, data: 'Server error'});
  });
}

function list(req, res, next){
  var user_id = parseInt(req.user.user_id);

  db.hunts.list(user_id)
  .then((data) => {

    data.forEach((el) => {
      el.isOwner = false;
      if(el.owner_id === user_id){
        el.isOwner = true;
      }

      delete el.owner_id;
    });

    res.data = data;
    next();
  })
  .catch((err) => {
    console.error(err);
    res.json({success: false, data: 'Server error'});
  });
}

function get(req, res, next){
  res.data = mockHunt;

  next();
}

function update(req, res, next){
  res.data = mockHunt;

  next();
}

function remove(req, res, next){

  next();
}

function completeClue(req, res, next){
  next();
}

module.exports = {
  list: list,
  add: add,
  get: get,
  update: update,
  remove: remove,
  completeClue: completeClue
};
