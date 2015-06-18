$(document).ready(function(){
    //the send button also acts as a connection signal
    var buttonsDisconnected = function(){
        $('#send').prop('disabled', true);
        $('#start').prop('disabled', true);
        $('#stop').prop('disabled', true);
        
        $('#send').css("background-color","#D9534F");
        $('#send').text("Disconnected...");
    };
    
    var buttonsConnected = function(){
        $('#send').prop('disabled', false);
        $('#start').prop('disabled', false);
        
        $('#send').css("background-color","#126D7A");
        $('#send').text("Send Message");
    };
    
    buttonsDisconnected();
    
    //connect options
    var options = {
         timeout: 5,
         //Gets Called if the connection has sucessfully been established
         onSuccess: function () {
             buttonsConnected();
         },
         //Gets Called if the connection could not be established
         onFailure: function (message) {
             buttonsDisconnected();
             client.connect(options);
         }
    };//end options
    
    //generate client
    var client = new Messaging.Client(document.URL.substring(7), 80, "client");
    
    client.onConnectionLost = function (responseObject) {
        //Depending on your scenario you could implement a reconnect logic here
        buttonsDisconnected();
        client.connect(options);
    };
    
    //connect client
    client.connect(options);
        
     //Creates a new Messaging.Message Object and sends it to the HiveMQ MQTT Broker
    var publish = function () {
         //Send your message (also possible to serialize it as JSON or protobuf or just use a string, no limitations)
       var message = new Messaging.Message($('#message').val());
       message.destinationName = "topic";
       message.qos = 0;
       client.send(message);
        $('#message').val("");
    };
    
    $('#send').click(publish);
    
    var rate;
    $("#rates").change(function(){
        rate = $('#rates').val();
        $('#messageFrequency').text(rate);
    });
    
    var spamming = false;
    
    var spam = function(){
        if(spamming){
            $('#message').val("*");
            publish();
            setTimeout(spam, 1000/rate - 1);
        }
    };
    
    var toggleSpamButtons = function(){
        $("#start").prop("disabled", !$("#start").prop("disabled"));
        $("#stop").prop("disabled", !$("#stop").prop("disabled"));
        $("#send").prop("disabled", !$("#send").prop("disabled"));
    };
    
    $('#start').click(function(){
        spamming = true;
        toggleSpamButtons();
        spam();
    });
    
    $('#stop').click(function(){
        spamming = false;
        toggleSpamButtons();
    });
});