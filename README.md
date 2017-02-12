# DoorBot

DoorBot provides a slack integration for connecting the office door to the LC Slack.

## Usage

Just write any character/word to @doorbot in a private message and the door opens.

## Installation

1. clone this repo to `/opt/`
2. `npm install`
3. `cp config.json.dist conig.json`
4. put the correct Slack API Token and whitelist in config.json

### autostart 
1. put `doorbot.sh ` to `/etc/init.d` and make it executable
2. execute `sudo update-rc.d doorbot.sh defaults` on RPi or corresponding command on your OS.