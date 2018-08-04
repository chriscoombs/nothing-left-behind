# Nothing Left Behind

Nothing Left Behind is a context based object tracker; just throw a Thing into a lunchbox or the pocket of a coat and Azure will send out an alert if Things don’t leave together.

## What it does

Each Thing is a battery powered Arduino (tested with MKR1000) hooked up to Azure IoT. Azure manages device state and produces alerts (currently Twilio SMS messages) if Things drift apart. 

Why Azure? As each Thing is battery powered, reducing energy consumption is critical. By powering up only to check-in with Azure we can leave the heavy lifting of calculations and sending alerts to the power of the cloud. Moreover, as each Thing isn’t always connected to the internet (it will spend most of its life in sleep mode) Azure IoT queues commands (like play a sound, or turn on the light) until the Thing checks-in again

## How I built it

### Arduino

Each v1.1 prototype is built from an Arduino MKR1000 hooked up to Azure IoT Hub. The code for the Arduino client is located in the `nlb_client` folder. Before uploading to your Arduino, be sure to create your own `arduino_secrets.h` file, based on the example provided, `arduino_secrets.h.example`.

### Azure

In Azure you will need to provision an IoT Hub instance and register your IoT devices. In order to calculate whether the Things have seperated we will configure an Azure Function as an IoT Hub trigger (use the EventHubTrigger example). Upload the Azure Function code located in the `function` folder. Before triggering the Azure Function be sure to set the required environment variables, based on the example `process.env.json.example` and to create a CosmosDB instance (this example uses the MongoDB API).

## Notes

The v1 prototype used Wi-Fi signals to compare the position of each Thing. Unfortunately, even when stationary the Things would send different scan results. As a result, v1.1 uses a very simple set of rules for determining if a Thing has been left behind - i.e. is a Thing which belongs to a Thing family, still connected to Wi-Fi when the other things aren't? If yes, send an alert.

v1.1 only works when connected to Wi-Fi (so leaving something at school is still a problem). I've ordered a couple of Arduinos with SigFox to test their location detection capabilities, which may become v2.

## More Information

For more, please visit the project's [DevPost page](https://devpost.com/software/nothing-left-behind).