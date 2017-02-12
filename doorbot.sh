#!/bin/bash
### BEGIN INIT INFO
# Provides:          doorbot
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     1 2 3 4 5
# Default-Stop:      0 6
# Short-Description: Start daemon at boot time
# Description:       Enable service provided by daemon.
### END INIT INFO
case "$1" in
start)
cd /opt/doorBot && exec /usr/local/bin/node /opt/doorBot/index.js > /dev/null &;;
stop)
#Hier kannst du den Server beenden
;;
*)
echo "Usage: $0 {start|stop|restart}"
esac