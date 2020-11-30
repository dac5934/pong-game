// WebSocket allowing the server to talk to the client

// put IP and port here if you don't want to re-input each time
const url_one = "ws://192.168.1.174:1337"; 
const url_two = "ws://192.168.1.173:1338"; //second player's IP and port
var url;
var output;

function webSocketConnect(urlIn) {
    socket = new WebSocket(urlIn);
    
    socket.onopen = function() {
        console.log("CONNECTED");
    };

    socket.onmessage = function(event) {
        output = event.data;
		console.log("MESSAGE RECEIVED " + event.data);
        
		if(output.substring(0,1) == "1") {
			set_direction_p1(output);
		} else {
			set_direction_p2(output);
		}
    };
    
    socket.onerror = function(event) { 
        console.log("ERROR: " + event.data);
    };

    socket.onclose = function(event) { 
        console.log("Disconnected");
    }; 
}

function set_connection(urlIn) {
	webSocketConnect("ws://" + urlIn);	
	console.log("successful connection! " + "ws://" + urlIn);
}


/*
uncomment this to automatically connect to the game
webSocketConnect(url_one);
webSocketConnect(url_two);
*/