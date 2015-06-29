$(document).ready(function(){
	var spamming = false;
    var connected = false;
    var delay;
    var duration;
    var spamControl;
    var messageCount = 0;
	
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
        
        $('#send').css("background-color","#2BBEAA");
        $('#send').text("Send a Message");
    };
    
    buttonsDisconnected();
    
    //generate client
    var client = new Messaging.Client(document.URL.substring(7), 80, "client_" + jQuery.now().toString().substring(7, 13) + parseInt(Math.random() * 100, 10) );

    //connect options
    var options = {
         timeout: 3,
         //Gets Called if the connection has sucessfully been established
         onSuccess: function () {
             if (!spamming){
                 buttonsConnected();
             }
             connected = true;
         },
         //Gets Called if the connection could not be established
         onFailure: function () {
             if (!spamming){
                 buttonsDisconnected();
             }
             connected = false;
             client.connect(options);
         }
    };//end options
    
    
    client.onConnectionLost = function () {
        //Depending on your scenario you could implement a reconnect logic here
        if (!spamming){
            buttonsDisconnected();
        }
        connected = false;
        client.connect(options);
    };
    
    //connect client
    client.connect(options);
        
     //Creates a new Messaging.Message Object and sends it to the HiveMQ MQTT Broker
    var publish = function () {
       if (connected){
            var message = new Messaging.Message($('#message').val());
            message.destinationName = "topic";
            message.qos = 0;
            client.send(message);
            messageCount++;
            $('#messageCount').text(messageCount);
        }
    };
    
    $('#send').click(function(){
        publish();
        $('#message').val("");
    });
    
    var updateRate = function(){
        switch($('#rates').val()){
            case 'Low':
                delay = 100;
                break;
            case 'Medium':
                delay = 10;
                break;
            case 'High':
                delay = 1;
                break;
        }//parse low medium high
        
        $('#spamrate').text($('#rates').val().toLowerCase());
    };
    updateRate();
    $("#rates").change(updateRate);
    
    var updateDuration = function(){
        duration = parseInt($('#times').val());
        $('#duration').text(duration);
    };
    updateDuration();
    $("#times").change(updateDuration);
    
    
    var spam = function(){
        if(spamming){
            setTimeout(spam, delay);
            publish();
        }
    };
    
    var stop = function(){
        clearTimeout(spamControl);
        spamming = false;
        toggleSpamButtons();
        $('#message').val("");
    };
    
    var toggleSpamButtons = function(){
        $("#start").prop("disabled", !$("#start").prop("disabled"));
        $("#stop").prop("disabled", !$("#stop").prop("disabled"));
        $("#send").prop("disabled", !$("#send").prop("disabled"));
    };
    
    $('#start').click(function(){
        spamming = true;
        toggleSpamButtons();
        if ($('#message').val() === ''){
        	$('#message').val("*");
        }//add a default message
        spam();
        spamControl = setTimeout(stop, duration*60000);
    });
    
    $('#stop').click(stop);
});