#!/bin/bash
echo "Hi"
eval "rm -f /Users/mulumoodi/Downloads/dl*.png"
kill -9 $(ps | grep camserver|grep node|head -n1 | awk '{print $1;}')
eval "node camserver.js" &
eval "open sample.html"
