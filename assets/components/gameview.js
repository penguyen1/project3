'use strict'
import React from 'react'
import { browserHistory, Router, Route, Link } from 'react-router'
import auth from '../auth'
const $   = require('jquery');
const Progress = require('react-progressbar');
const moment = require('moment');
const moment_countdown = require('moment-countdown');
const Createhunt = require('./createhunt.js');
const Map = React.createClass({
  componentDidMount : function() {
  },
  render : function() {
    let divstyle = {
      height: "500px",
      width: "580px",
      margin: '0 auto',
      position: 'relative',
      border: '2px solid black'
    }
    let sectionstyle = {
      position: 'relative',
      left: '0em',
      top: '-403px'
    }
    return (
      <section style={sectionstyle}>
        <div id="map2" style={divstyle}>
        </div>
      </section>
    )
  }
});
const Gameview = React.createClass({
  contextTypes: {
    user: React.PropTypes.object,
    router: React.PropTypes.object.isRequired,
    currentHuntId: React.PropTypes.number,
    setCurrentHuntId: React.PropTypes.func
  },
  getInitialState() {
    return {
      game: {
        clues: [],
        participants: []
      }
    }
  },
  componentWillMount() {
    localStorage.currentHuntId = parseInt(this.context.currentHuntId)
    // gets list of hunts from user token
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position.coords.latitude, position.coords.longitude)
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;
      $.ajax({
        url: "/api/v1/hunts/"+this.context.currentHuntId+"?lat="+latitude+"&lng="+longitude,
        type: "get",
        beforeSend: function( xhr ) {
          xhr.setRequestHeader("Authorization", "Bearer " + auth.getToken());
        }
      }).done((data)=>{
      console.log('data returned ', data)
      this.state.game = data.data
      // setting the state of the game
      this.setState({ game: this.state.game })

      loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyB2U33goCrZ0Hilh_cdksT1_F8jBgUTl4w&libraries=places&callback=plotlocation');
      // grabbing the clues returned from the database
      // need clue number, lat and lng
      var clues = this.state.game.clues;
      var cluesdb =[];

      clues.forEach((el) => {
        var replacedec = el.description.split(' ').join('+');
        var clueobj ={
          'clue_number': el.clue_number,
          'desc': replacedec,
          'lat': el.lat,
          'lng': el.lng
        }
        cluesdb.push(clueobj)
      })

      // console.log('clues from the database', cluesdb);
      var cluesstring = JSON.stringify(cluesdb);
      // console.log('json string',cluesstring);
      var $hiddenDiv = $('#hidden');
      // console.log('hidden div ', $hiddenDiv);
      // remove cluesdb if it alreadt
       $('#cluesdb').remove();
      // put the clues data from the database into hiddendiv to pass it to google maps script
      $hiddenDiv.append($('<input id="cluesdb" type="hidden" value='+cluesstring+'>'));
    }).fail((error)=>{
      console.log('Gameview GET Error: ', error)
    })
  })
  },
  renderClue(clue) {
    return(<Clue key={clue.clue_id} details={clue} />)
  },
  renderParticipant(participant) {
    return(<Participant key={participant.participant_id} details={participant} />)
  },
  handleCheckIn(event) {
    event.preventDefault();

    if(this.state.game.clues.length) {
      console.log('clue length: ', this.state.game.clues.length)
      console.log('check in button clicked for clue: ', this.state.game.clues[this.state.game.clues.length-1])    // is this the correct last clue?
    }

    $.ajax({
      url: "/api/v1/hunts/"+ this.context.currentHuntId +"/clues/"+this.state.game.clues[this.state.game.clues.length-1].clue_id,
      type: "PUT",
      beforeSend: function( xhr ) {
        xhr.setRequestHeader("Authorization", "Bearer " + auth.getToken());
      }
    }).done((data)=>{
      console.log('next clue?: ', data)
      navigator.geolocation.getCurrentPosition((position) => {
        console.log(position.coords.latitude, position.coords.longitude)
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        $.ajax({
          url: "/api/v1/hunts/"+this.context.currentHuntId+"?lat="+latitude+"&lng="+longitude,
          type: "get",
          beforeSend: function( xhr ) {
            xhr.setRequestHeader("Authorization", "Bearer " + auth.getToken());
          }
        }).done((data)=>{
        console.log('data returned ', data)
        this.state.game = data.data
        // setting the state of the game
        this.setState({ game: this.state.game })
        loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyB2U33goCrZ0Hilh_cdksT1_F8jBgUTl4w&libraries=places&callback=plotlocation');

        // grabbing the clues returned from the database
        // need clue number, lat and lng
        var clues = this.state.game.clues;
        var cluesdb =[];
        clues.forEach((el) => {
          var clueobj ={
            'clue_number': el.clue_number,
            'lat': el.lat,
            'lng': el.lng
          }
          cluesdb.push(clueobj)
        })
        // console.log('clues from the database', cluesdb);
        var cluesstring = JSON.stringify(cluesdb);
        // console.log('json string',cluesstring);
        var $hiddenDiv = $('#hidden');
        // console.log('hidden div ', $hiddenDiv);
        // remove cluesdb if it alreadt
         $('#cluesdb').remove();
        // put the clues data from the database into hiddendiv to pass it to google maps script
        $hiddenDiv.append($('<input id="cluesdb" type="hidden" value='+cluesstring+'>'));
      }).fail((error)=>{
        console.log('Gameview GET Error: ', error)
      })
    })
    })
  },
  render() {
    var clues = this.state.game.clues;
    var participants = this.state.game.participants;
    // console.log('deadline: ',this.state.game.deadline)
    console.log('hunt game: ', this.state.game)
    // console.log('participants: ', this.state.game.participants)

    return (
      <div>
        <div className="center-align">
          <h2>{this.state.game.wager}</h2>
          <h4 id="time">Time Left: {moment(this.state.game.deadline).countdown().toString()}</h4>
        </div>

        <div className="row">
          {/* List of all User hunts + Edit|View|Delete options per hunt */}
          <div className="card-panel z-depth-5 gameview clues center-align">
            <h5 id="title">Clues:</h5>
            <div className="text">
              {/* List all clues here */}
              { clues ? clues.map((el)=> this.renderClue(el)) : console.log('no clues available') }
            </div>
          </div>

          <div className="map">
            <Map />
          </div>

          {/* User Hunt Record + Create Hunt btn */}
          <div className="card-panel z-depth-5 gameview status center-align">
            <h5 id="title">Player Status:</h5>
            <div className="text">
              {/* List each player status here */}
              { participants ? participants.map((el)=> this.renderParticipant(el)) : console.log('no participants available') }
            </div>
            <div>
              { this.state.game.showNextClue
                  ? <button style={{marginTop: '40px'}} onClick={this.handleCheckIn}>Check In</button>
                  : console.log('showNextClue is false') }
            </div>
          </div>
        </div>
        {/* {this.props.children} */}
      </div>
    )
  }
});


const Clue = React.createClass({
  render() {
    return ( <div className="listItem">{this.props.details.description}</div> )
  }
});


const Participant = React.createClass({
  render() {
    return (
      <div className="listItem">
        {this.props.details.username}: <div id="progress"><Progress completed={this.props.details.progress*100} /></div>
      </div>
    )
  }
});
module.exports = Gameview;
