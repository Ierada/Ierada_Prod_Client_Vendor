#!/bin/bash 


echo ###Checking  requierd network or will create 

docker network inspect ierada-test >/dev/null 2>&1 || docker network create ierada-test

echo ### building images#####
docker build    -t   frontend:test-v1 .
echo #### Removing old container#####

docker rm -f frontend-test

echo #### Running New container with updated images#####
docker run  -d  --name frontend-test -p 8443:443   --restart unless-stopped  --network ierada-test --env-file .env  frontend:test-v1

echo #### done ####

docker ps 

