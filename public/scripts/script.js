// Copyright (c) 2016 IBM Corp. All rights reserved.
// Use of this source code is governed by the Apache License,
// Version 2.0, a copy of which can be found in the LICENSE file.

$(document).ready(function(){
	var spamming = false;
    var connected = false;
    var delay;
    var duration;
    var spamControl;
    var messageCount = 0;
	
	//functions to configure buttons
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
    
    //not connected upon page load
    buttonsDisconnected();
    
    //generate client
    var client = new Messaging.Client(document.URL.substring(7), 80, "client_" + jQuery.now().toString().substring(7, 13) + parseInt(Math.random() * 100, 10) );

    //connect options
    var options = {
         timeout: 3,
         //called if the connection has sucessfully been established
         onSuccess: function () {
             if (!spamming){
                 buttonsConnected();
             }
             connected = true;
         },
         //called if the connection could not be established
         //tries to reconnect
         onFailure: function () {
             if (!spamming){
                 buttonsDisconnected();
             }
             connected = false;
             client.connect(options);
         }
    };//end options
    
    
    //called when connection is lost
    //tries to reconnect
    client.onConnectionLost = function () {
        if (!spamming){
            buttonsDisconnected();
        }
        connected = false;
        client.connect(options);
    };
    
    //try to connect client on page load
    client.connect(options);
      
     //Creates a new message bject and sends it to the MQTT broker
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
    
    //calls publish when "send" button is clicked
    $('#send').click(function(){
        publish();
        $('#message').val("");
    });
    
    
    //update messaging rate
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
    //update messaging rate upon page load
    updateRate();
    //update messaging rate when selection is changed
    $("#rates").change(updateRate);
    
    //update messaging duration
    var updateDuration = function(){
        duration = parseInt($('#times').val());
        $('#duration').text(duration);
    };
    //update messaging duration upon page load
    updateDuration();
    //update messaging duration when selection is changed
    $("#times").change(updateDuration);
    
    //automatically publish messages
    var spam = function(){
        if(spamming){
            setTimeout(spam, delay);
            publish();
        }
    };
    
	//button configuration during automated messaging
    var toggleSpamButtons = function(){
        $("#start").prop("disabled", !$("#start").prop("disabled"));
        $("#stop").prop("disabled", !$("#stop").prop("disabled"));
        $("#send").prop("disabled", !$("#send").prop("disabled"));
    };
    
	//stop automated messaging
    var stop = function(){
        clearTimeout(spamControl);
        spamming = false;
        toggleSpamButtons();
        $('#message').val("");
    };
    $('#stop').click(stop);

	//start automated messaging at set rate for set duration
    $('#start').click(function(){
        spamming = true;
        toggleSpamButtons();
        if ($('#message').val() === ''){
        	$('#message').val("*");
        }//add a default message
        spam();
        spamControl = setTimeout(stop, duration*60000);
    });
});