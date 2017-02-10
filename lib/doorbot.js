(function(){

	'use strict';

	var path = require('path');
	var low = require('lowdb');
	var Bot = require('slackbots');
	var y = require('yapl');
	const exec = require('child_process').exec;

	/**
	 * DoorBot class
	 * @param {Object} settings containing definition
	 * @param {string} settings.token the API Token
	 * @param {string} [settings.name = bugbot] the bot name
	 * @param {string} [settings.dbPath = projectDir/data/bugbot.db] Path to the db file
	 */
	class DoorBot extends Bot{

		constructor(settings) {
			super(settings);
			this.settings = settings;
			this.name = this.settings.name || 'doorbot';
			this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'doorbot.db');
			this.whitelist = Array.isArray(settings.whitelist) ? settings.whitelist : [];

			this.db = null;
			this.id = null;
			
			this.on('start', this._onStart);
			this.on('message', this._onMessage);
			
		}

		_onStart() {
		    this._connectDb();
		}

		_connectDb() {
		    this.db = low(this.dbPath);

		    this.db.defaults({
		    	'log': []
		    }).write();
		}

		_firstRunCheck() {
		    var lastrun = this.db.get('info.lastrun').value();
			var currentTime = (new Date()).toJSON();

	        // this is a first run
	        if (!lastrun) {
	            this._welcomeMessage();
	        }

	        // updates with new last running time
	        return this.db.set('info.lastrun', currentTime).write();
	    }

	    log(text){
	    	var id = this.db.get('log').size().value() + 1;

	    	this.db.get('log')
			.push({id: id, timestamp: new Date(), message: text})
			.write();
	    }

	    getLog(){
	    	return this.db.get('log').value();
	    }

	    openDoor(time){
	    	var deferred = y();
	    	time = time ? time : 2;
	    	exec('sudo /home/pi/gpio -g mode 4 out', (error, stdout, stderr) => {
				if (error) {
					return deferred.reject(error);
				}
				exec('sudo /home/pi/gpio -g write 4 1', (error, stdout, stderr) => {
					if (error) {
						return deferred.reject(error);
					}
					setTimeout(()=>{
						deferred.resolve();	
					}, time*1000);
				});
			});
	    	
	    	return deferred.promise;
	    }

	    closeDoor(){
	    	exec('sudo /home/pi/gpio -g mode 4 out', (error, stdout, stderr) => {
	    		exec('sudo /home/pi/gpio -g write 4 0', (error, stdout, stderr) => {});
	    	});
	    }

	    _directMessage(event){
	    	if(event.text == "schnäpperle"){

	    	} else {
	    		this.getUserById(event.user).then((user)=>{
	    			var time = new Date();

	    			if( (time.getHours() < 22 && time.getHours() > 6)
	    				|| this.whitelist.indexOf(user.name) > -1 ){
	    				this.log(`Opened door for ${user.name}`);
	    				this.openDoor(2).then(this.closeDoor).catch(this.closeDoor);
	    			} else {
	    				this.log(`Did not open for ${user.name}`);
	    			}

	    		});
	    		
	    		
	    	}
	    }

	    _channelMessage(event){
	    	switch(event.subtype) {
				case 'group_join':
				case 'channel_join':
					this._join(event);
					break;
				default:
					break;
			}
	    }

		_onMessage(event){
			if(event.type == "message"
				&& typeof event.channel != 'undefined'
				&& event.channel.charAt(0) == 'D'){
				this._directMessage(event);
			} else {
				this._channelMessage(event);	
			}
			
		}

		_join(event) {
			if(this.self.id == event.user){
				this.db.get('channels').push(event.channel).value();
				this._welcomeMessage(event.channel);
			}
		}

		_welcomeMessage(channel) {
		    this.postMessage(channel,`Hi guys, roundhouse-kick anyone?
I may open the door for you :P`,
		        {as_user: true});
		}
		
	}	

	module.exports = DoorBot;

})();
