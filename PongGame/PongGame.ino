#include <WebSocketsServer.h>
#include <ESPAsyncWebServer.h>
#include <WiFi.h>
#include <SPIFFS.h>

AsyncWebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(1337);

// Put WIFI credentials here
IPAddress ipAddress;
const char* ssid = "WIFI NAME";
const char* password = "PWD";
int joyY = A4;
int button1 = 25;

// Connect to the WIFI
void wifiConnect() {
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("");
  Serial.println("Connected successfully!");
  Serial.print("IP Address: ");
  Serial.print(WiFi.localIP());
  ipAddress = WiFi.localIP();
}

// Be sure to upload data to ESP32 through "ESP32 sketch data upload"
// in order to connect to the game through the internet
// Can still be played through the local file
void spiffsSetup() {
  if(!SPIFFS.begin()) {
    Serial.println("Error mounting SPIFFS");
  }
}

// Sends the index.html to the client from SPIFFS
void onIndexRequest(AsyncWebServerRequest *request) {
  IPAddress remote_ip = request->client()->remoteIP();
  Serial.println("");
  Serial.println("[" + remote_ip.toString() +
                  "] HTTP GET request of " + request->url());
  request->send(SPIFFS, "/index.html", "text/html");
}

// Sends the pong.css to the client from SPIFFS
void onCSSRequest(AsyncWebServerRequest *request) {
  IPAddress remote_ip = request->client()->remoteIP();
  Serial.println("");
  Serial.println("[" + remote_ip.toString() +
                  "] HTTP GET request of " + request->url());
  request->send(SPIFFS, "/pong.css", "text/css");
}

// Sends the pong.js to the client from SPIFFS
void onPongJSRequest(AsyncWebServerRequest *request) {
  IPAddress remote_ip = request->client()->remoteIP();
  Serial.println("");
  Serial.println("[" + remote_ip.toString() +
                  "] HTTP GET request of " + request->url());
  request->send(SPIFFS, "/pong.js", "text/javascript");
}

// Sends the websocket.js to the client from SPIFFS
void onWSJSRequest(AsyncWebServerRequest *request) {
  IPAddress remote_ip = request->client()->remoteIP();
  Serial.println("");
  Serial.println("[" + remote_ip.toString() +
                  "] HTTP GET request of " + request->url());
  request->send(SPIFFS, "/websocket.js", "text/javascript");
}

// Opens websocket allowing the transmission of information
void onWebSocketEvent(uint8_t client_num,
                      WStype_t type,
                      uint8_t * payload,
                      size_t length) {
 
  if(type == WStype_CONNECTED){
    IPAddress ip = webSocket.remoteIP(client_num);
    Serial.println("Websocket client connection received");
  } 
  
  else if(type == WStype_DISCONNECTED){
    Serial.println("Websocket client connection finished");
  }
}

void setup() {
  // IP address of the ESP is in serial monitor
  Serial.begin(115200);
  pinMode(button1, INPUT);
  float yValue = analogRead(joyY);

  //initialize everything
  wifiConnect();
  spiffsSetup();
  server.begin();
  webSocket.begin();
  server.on("/", HTTP_GET, onIndexRequest);
  server.on("/pong.css", HTTP_GET, onCSSRequest);
  server.on("/pong.js", HTTP_GET, onPongJSRequest);
  server.on("/websocket.js", HTTP_GET, onWSJSRequest);
  
  webSocket.onEvent(onWebSocketEvent);
}

// the communication between the input to the server
// (but it's at the server already) and client
// the msg send is as follows:
// first char for player
// second char for joystick direction
// third char for button input
char cmd[3] = {'0', '0', '0'};

void runLoop() {
  float state = digitalRead(button1);
  float yValue = analogRead(joyY);

  cmd[0] = '1';
  cmd[1] = '0';
  cmd[2] = '0';
  
  if(yValue > 2800.0000) {
    cmd[1] = '1';
  }

  if(yValue < 2500.0000) {
    cmd[1] = '2';
  }

  if(state == 1) {
    cmd[2] = '1';
  }
  
  webSocket.sendTXT(0, cmd);  
  delay(10);
}

void loop() {
  runLoop();
  webSocket.loop();
}
