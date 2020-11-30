#include <WebSocketsServer.h>
#include <ESPAsyncWebServer.h>
#include <WiFi.h>

AsyncWebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(1338);

IPAddress ipAddress;
// put the WIFI credentials here
// needs to be on the same wifi network unless the server's domain is public
const char* ssid = "WIFI NAME";
const char* password = "WIFI PWD";
int joyY = A3;


void wifiConnect() {
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("");
  Serial.println("WIFI Connected successfully!");
  Serial.print("IP Address: ");
  Serial.print(WiFi.localIP());
  ipAddress = WiFi.localIP();
}

void onWebSocketEvent(uint8_t client_num,
                      WStype_t type,
                      uint8_t * payload,
                      size_t length) {
 
  if(type == WStype_CONNECTED){
    IPAddress ip = webSocket.remoteIP(client_num);
    Serial.println("Websocket client connection number 2 received");
  } 
  
  else if(type == WStype_DISCONNECTED){
    Serial.println("Websocket client connection number 2 finished");
  }
}

void setup() {
  Serial.begin(115200);
  float xValue = analogRead(joyX);
  
  wifiConnect();
  server.begin();
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);
}

// the msg send is as follows:
// first char for player
// second char for direction(can be expanded for x and y)
// third char for button input
char cmd[3] = {'0', '0', '0'};

void runLoop() {
  float yValue = analogRead(joyY);
  // for the game to distinguish player inputs
  cmd[0] = '2';
  cmd[1] = '0';
  cmd[2] = '0';

  if(yValue > 2700.0000 && yValue < 2850.0000) {
    cmd[1] = '0';
  }
  
  if(yValue > 2800.0000) {
    cmd[1] = '1';
  }

  if(yValue < 2600.0000) {
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
