/*
  Nothing Left Behind

  Extract from SAMD client
*/

#include <WiFi101.h>
#include "arduino_secrets.h"

// WiFi
WiFiSSLClient client;
char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;
int status = WL_IDLE_STATUS;

// Azure IoT
char azureHost[] = AZURE_HOST;
// Sas generation redacted, demo uses static
char azureSas[] = AZURE_SAS;

char thing[] = THING;
char family[] = FAMILY;
String deviceUri = String("/devices/") + thing + "/messages/";
char apiVersion[] = "api-version=2016-02-03";

void setup() {
  Serial.begin(9600);

  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, pass);
    delay(10000);
  }
}

void loop() {
  getMessage();
  String outgoingMessage = thing;
  outgoingMessage.concat(",");
  outgoingMessage.concat(family);
  outgoingMessage.concat(",");
  outgoingMessage.concat(listNetworks());
  postMessage(outgoingMessage);
  delay(15000);
}

void writeClientResponse() {
  while (client.connected()) {
    Serial.write(client.read());
    delay(10);
  }
}

void getMessage() {
  String message = checkForMessage();
  if (!message.equals("")) {
    handleMessage(message);
  }
}

String checkForMessage() {
  String response;
  if (client.connectSSL(azureHost, 443)) {
    client.print("GET ");
    client.print(deviceUri + "devicebound?" + apiVersion);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(azureHost);
    client.print("Authorization: ");
    client.println(azureSas);
    client.println("Connection: close");
    client.println();
    delay(1000);
    writeClientResponse();
    // HTTP code handling redacted
    client.stop();
  } else {
    // Error handling redcated
  }
  return response;
}

void handleMessage(String message) {
  // Redacted
}

void deleteMessage(String etag) {
  if (client.connectSSL(azureHost, 443)) {
    client.print("DELETE ");
    client.print(deviceUri + "devicebound/" + etag + "?" + apiVersion);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(azureHost);
    client.print("Authorization: ");
    client.println(azureSas);
    client.println("Connection: close");
    client.println();
    delay(1000);
    // HTTP code handling redacted
    client.stop();
  } else {
    // Error handling redcated
  }
}

String macString(uint8_t* macAddress) {
  char macStr[18];
  sprintf(macStr, "%02X:%02X:%02X:%02X:%02X:%02X", macAddress[5], macAddress[4], macAddress[3], macAddress[2], macAddress[1], macAddress[0]);
  return String(macStr);
}

String listNetworks() {
  int networks = WiFi.scanNetworks();
  String response;
  byte bssid[6];
  for (int network = 0; network < networks; network++) {
    response.concat(macString(WiFi.BSSID(network, bssid)));
    response.concat("|");
    response.concat(WiFi.RSSI(network));
    response.concat("|");
    response.concat(WiFi.channel(network));
    response.concat(",");
  }
  return response;
}

void postMessage(String content) {
  if (client.connectSSL(azureHost, 443)) {
    client.print("POST ");
    client.print(deviceUri + "events?" + apiVersion);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(azureHost);
    client.print("Authorization: ");
    client.println(azureSas);
    client.println("Connection: close");
    client.print("Content-Type: ");
    client.println("text/plain");
    client.print("Content-Length: ");
    client.println(content.length());
    client.println();
    client.println(content);
    delay(1000);
    writeClientResponse();
    // HTTP code handling redacted
    client.stop();
  } else {
    // Error handling redcated
  }
}
