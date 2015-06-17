$(document).ready(function(){
    $('#client-id').val("client_" + parseInt(Math.random() * 100, 10));
    
    var client;
    
     //Connect Options
    var options = {
         timeout: 3,
         //Gets Called if the connection has sucessfully been established
         onSuccess: function () {
             $('#messages').prepend('<span>Connected</span></br/>');
             //alert("Connected");
         },
         //Gets Called if the connection could not be established
         onFailure: function (message) {
             $('#messages').prepend('<span>Connection failed: ' + message.errorMessage + '</span><br/>');
             //alert("Connection failed: " + message.errorMessage);
         }
     };//end options
    
    $('#connect').click(function(){
       //generate client
       client = new Messaging.Client($('#host').val(), parseInt($('#port').val()), $('#client-id').val());
        
       //Gets  called if the websocket/mqtt connection gets disconnected for any reason
       client.onConnectionLost = function (responseObject) {
           //Depending on your scenario you could implement a reconnect logic here
           console.log("connection lost");
           $('#messages').prepend('<span>Connection lost: ' + responseObject.errorMessage + '</span><br/>');
       };
    
       //Gets called whenever you receive a message for your subscriptions
       client.onMessageArrived = function (message) {
           //Do something with the push message you received
           $('#messages').prepend('<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>');
       };
        
       client.connect(options); 
    });
    
     //Creates a new Messaging.Message Object and sends it to the HiveMQ MQTT Broker
    var publish = function () {
         //Send your message (also possible to serialize it as JSON or protobuf or just use a string, no limitations)
       var message = new Messaging.Message($('#message').val());
       message.destinationName = $('#topic').val();
       message.qos = parseInt($('#qos').val());
       client.send(message);
    };
    
    
    $('#subscribe').click(function(){
       client.subscribe($('#topic').val(), {qos: parseInt($('#qos').val())});
       $('#messages').prepend("<span>Subscribed to Topic: " + $('#topic').val() + "</span><br/>");
    });
    
    $('#publish').click(publish);
    
    $('#disconnect').click(function(){
       client.disconnect(); 
    });
    
    var spam = function(){
        if(document.getElementById("spam").checked){
            $('#message').val("spam");
            publish();
            setTimeout(spam, 1);
        }
    };
    
    $('#spam').click(spam);
});