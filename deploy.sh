COMMAND="cf apps | grep -w --quiet ${CF_APP}"
MOREF=$(cf scale ${CF_APP} | grep instances)
INSTANCES=${MOREF:11}


if eval $COMMAND; then
export EXISTS=true
export APP_NAME="${CF_APP}-new"
else
export EXISTS=false
export APP_NAME="${CF_APP}"
fi
 
echo "Pushing application"
 
cf push $APP_NAME $CF_PUSH_ARGS -n $APP_NAME --no-start
 
echo "Done pushing application"

echo "Setting environment variables"
 
IFS=',' read -a envvarsarray <<< "$ENV_VARS"
for element in "${envvarsarray[@]}"
do
IFS=':' read -a envvar <<< "$element"
cf set-env $APP_NAME ${envvar[0]} ${envvar[1]}
done

echo "Mapping routes in order to bala
nce traffic between two instances"
 
IFS=',' read -a routesarray <<< "$ROUTES"
for element in "${routesarray[@]}"
do
if [[ $element == *":"* ]]; then
IFS=':' read -a route <<< "$element"
cf map-route $APP_NAME ${route[1]} -n ${route[0]}
else
cf map-route $APP_NAME $element
fi
done

echo "Done mapping routes"
 
echo "Binding services"
 
IFS=',' read -a servicesarray <<< "$SERVICES"
for element in "${servicesarray[@]}"
do
cf bind-service $APP_NAME "$element"
done
 
echo "Done mapping services"
 
echo "Starting application"
 
cf start $APP_NAME
 
echo "Done starting application"

echo "Scaling down old application, while scaling up new application"

OLD_APP_COUNTER=$INSTANCES
NEW_APP_COUNTER=2
while [ $OLD_APP_COUNTER -gt 1 ]
do
let OLD_APP_COUNTER=OLD_APP_COUNTER-1
cf scale ${CF_APP} -i $OLD_APP_COUNTER
cf scale $APP_NAME -i $NEW_APP_COUNTER
let NEW_APP_COUNTER=NEW_APP_COUNTER+1
done
 
echo "Done Scaling old and new applications" 
 
echo "Cleaning up old application"
 
if $EXISTS; then
cf delete -f ${CF_APP}
cf unmap-route $APP_NAME mybluemix.net -n $APP_NAME
cf rename $APP_NAME ${CF_APP}
else
echo "No cleanup needed, app did not exist"
fi
 
echo "Done cleaning up the old application"

echo "Zero downtime deployment of application completed" 