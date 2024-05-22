#!/bin/bash

# Used to set up secrets for the turn server, for hosting networked Hivemind servers

if [ ! -f .env ]; then
    echo TURN_SECRET=$(openssl rand -hex 16) > .env
fi
