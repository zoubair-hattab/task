#!/bin/bash
DIR="/var/log"
FILE="run.log"
if [ ! -d "$DIR" ]; then
    mkdir $DIR
    touch $DIR/$FILE
else
    if [ ! -d "$DIR/$FILE" ]; then
    touch $DIR/$FILE
    else
    chmod +777 $DIR/$FILE
    fi
fi
echo $(date), "Starting FTSO "
sleep 5s
node ./mainFTSO.js  >> $DIR/$FILE 2>&1 & echo FTSO started with PID $! 

while :
do
sleep 1m
pidof node >/dev/null
if [[ $? -ne 0 ]] ; then
        echo "Restarting  Data Provider:     $(date)" >> $DIR/$FILE
        node ./mainFTSO.js >> $DIR/$FILE 2>&1 & echo FTSO started with PID $! 
fi


done
