'use strict';

let ipc = require('ipc');

function Timeline() {

	this.scene_id = 0;

}

Timeline.prototype.handleTime = function(time) {

	this.time = time;

	switch(this.scene_id) {

		case 0:
			if(time > 0) {
				this.startScene(1);
			}
			break;

		case 1:
      if(time > 8.5) {
			// if(time > 1) {
				this.startScene(2);
			}
			break;

		case 2:
			if(time > 15) {
				this.startScene(3);
			}
			break;

		case 3:
			if(time > 20) {
				this.startScene(4);
			}
			break;

		case 4:
			if(time > 42.5) {
				this.startScene(5);
			}
			break;

		case 5:
			if(time > 52) {
				this.startScene(6);
			}
			break;

		case 6:
			if(time > 59.7) {
				this.startScene(7);
			}
			break;

		case 7:
			if(time > 75.66) {
				this.startScene(8);
			}
			break;

		case 8:
			if(time > 83) {
				this.startScene(9);
			}
			break;

		case 9:
			if(time > 85) {
				this.startScene(10);
			}
			break;

		case 10:
			if(time > 96.5) {
				this.startScene(11);
			}
			break;

		case 11:
			if(time > 102) {
				this.startScene(12);
			}
			break;

    case 12:
      if(time > 110) {
        this.startScene(13);
      }
      break;
	}

};

Timeline.prototype.startScene = function(scene_id) {

	this.scene_id = scene_id;

	switch(scene_id) {
		case 1:
			console.log(this.time, 'scene 1: trillen');
      ipc.send('strobe', 'launch');

			//code voor scene
		break;

		case 2:
			console.log(this.time, 'scene 2: start ost, aarde zichtbaar');
      window.bean.fire(this, 'timeline_event', 'arrived_in_space');
      ipc.send('roll', 33000);
			//code voor scene
		break;

		case 3:
			console.log(this.time, 'scene 3: uitleg beweging geven');
			//code voor scene
		break;

		case 4:
			console.log(this.time, 'scene 4: sterachtige objecten laten komen en rond vliegen');
      window.bean.fire(this, 'timeline_event', 'space_debris');
			//code voor scene
		break;

		case 5:
			console.log(this.time, 'scene 5: alarm asteroid');
      window.bean.fire(this, 'timeline_event', 'alarm_asteroid');
      ipc.send('strobe', 'alarm');

			//code voor scene
		break;

		case 6:
			console.log(this.time, 'scene 6: versnelling naar kometengroep');
      window.bean.fire(this, 'timeline_event', 'speed_up');
      ipc.send('strobe', 'red');
			//code voor scene
		break;

		case 7:
			console.log(this.time, 'scene 7: passerende kometen ontwijken');
      window.bean.fire(this, 'timeline_event', 'start_comets');
      ipc.send('strobe', 'double');

			//code voor scene
		break;

		case 8:
			console.log(this.time, 'scene 8: grote moederkomeet komt dichterbij');
      window.bean.fire(this, 'timeline_event', 'big_comet');
			//code voor scene
		break;

		case 9:
			console.log(this.time, 'scene 9: ontploffing komeet');
      window.bean.fire(this, 'timeline_event', 'big_comet_explosion');
      ipc.send('strobe', 'short');

			//code voor scene
		break;

		case 10:
			console.log(this.time, 'scene 10: boodschap aarde gered');
      ipc.send('roll', 16000);
			//code voor scene
		break;

		case 11:
			console.log(this.time, 'scene 11: aarde zichtbaar en komt dichterbij');
      window.bean.fire(this, 'timeline_event', 'back_to_earth');

			//code voor scene
		break;

		case 12:

      ipc.send('strobe', 'double');
      window.bean.fire(this, 'timeline_event', 'the_end');
			console.log(this.time, 'scene 12: soundtrack gedaan, zwart beeld');
			//code voor scene
		break;

    case 13:
      console.log(this.time, 'reset');
      window.bean.fire(this, 'timeline_event', 'reset');
      //code voor scene
    break;
	}

};

module.exports = Timeline;
