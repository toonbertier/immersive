'use strict';

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
			if(time > 8.57) {
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
			if(time > 42.72) {
				this.startScene(5);
			}
			break;

		case 5:
			if(time > 57.66) {
				this.startScene(6);
			}
			break;

		case 6:
			if(time > 65.06) {
				this.startScene(7);
			}
			break;

		case 7:
			if(time > 75.66) {
				this.startScene(8);
			}
			break;

		case 8:
			if(time > 88.1) {
				this.startScene(9);
			}
			break;

		case 9:
			if(time > 90) {
				this.startScene(10);
			}
			break;

		case 10:
			if(time > 101.56) {
				this.startScene(11);
			}
			break;

		case 11:
			if(time > 107.74) {
				this.startScene(12);
			}
			break;
	}

};

Timeline.prototype.startScene = function(scene_id) {

	this.scene_id = scene_id;

	switch(scene_id) {
		case 1:
			console.log(this.time, 'scene 1: trillen');
			//code voor scene
		break;

		case 2:
			console.log(this.time, 'scene 2: start ost, aarde zichtbaar');
			//code voor scene
		break;

		case 3:
			console.log(this.time, 'scene 3: uitleg beweging geven');
			//code voor scene
		break;

		case 4:
			console.log(this.time, 'scene 4: sterachtige objecten laten komen en rond vliegen');
			//code voor scene
		break;

		case 5:
			console.log(this.time, 'scene 5: boodschap komeet');
			//code voor scene
		break;

		case 6:
			console.log(this.time, 'scene 6: versnelling naar kometengroep');
			//code voor scene
		break;

		case 7:
			console.log(this.time, 'scene 7: passerende kometen ontwijken');
			//code voor scene
		break;

		case 8:
			console.log(this.time, 'scene 8: grote moederkomeet komt dichterbij');
			//code voor scene
		break;

		case 9:
			console.log(this.time, 'scene 9: ontploffing komeet');
			//code voor scene
		break;

		case 10:
			console.log(this.time, 'scene 10: boodschap aarde gered');
			//code voor scene
		break;

		case 11:
			console.log(this.time, 'scene 11: aarde zichtbaar en komt dichterbij');
			//code voor scene
		break;

		case 12:
			console.log(this.time, 'scene 12: soundtrack gedaan, zwart beeld');
			//code voor scene
		break;
	}

};

module.exports = Timeline;
