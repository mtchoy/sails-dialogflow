
module.exports = function () {

    // var req = this.req;
    // var res = this.res;

    // const { WebhookClient } = require('dialogflow-fulfillment');
    // const { Card, Suggestion } = require('dialogflow-fulfillment');
    // const { dialogflow, Permission, BasicCard, Button, Image } = require('actions-on-google');

    // const agent = new WebhookClient({ request: req, response: res });

    // function welcome(agent) {
    //     agent.add(`Welcome to my agent!`);
    // }

    // function fallback(agent) {
    //     agent.add(`I didn't understand`);
    //     agent.add(`I'm sorry, can you try again?`);
    // }

    // function userProvidesType(agent) {

    //     let conv = agent.conv();
    //     let params = agent.parameters;

    //     if (["Drink Carton", "Coffee Capsule"].includes(params.wasteType)) {
    //         conv.close(`This can't be recycled!!!`);
    //         return agent.add(conv);
    //     }

    //     conv.data.requestedPermission = 'DEVICE_PRECISE_LOCATION';

    //     conv.ask(new Permission({
    //         context: `${params.wasteType}? Cool. To locate you`,
    //         permissions: conv.data.requestedPermission,
    //     }));
    //     return agent.add(conv);

    // }

    // function userGrantsPermission(agent) {

    //     let conv = agent.conv();
    //     let params = agent.parameters;
    //     let permissionGranted = agent.isPermissionGranted();

    //     console.log(agent);

    //     if (!permissionGranted) {
    //         conv.close('Sorry, permission denied.');
    //         return agent.add(conv);
    //     }

    //     const { requestedPermission } = conv.data;

    //     if (requestedPermission !== 'DEVICE_PRECISE_LOCATION') {
    //         conv.close('Sorry, I could not figure out where you are.');
    //         return agent.add(conv);
    //     }

    //     const { coordinates } = conv.device.location;

    //     if (coordinates) {

    //         // return conv.close(`You are at ${coordinates.latitude}, ${coordinates.longitude}`);

    //         const wasteType = conv.contexts.get('userprovidestype-followup').parameters.wasteType;

    //         var url = `https://api.data.gov.hk/v1/nearest-recyclable-collection-points?lat=${coordinates.latitude}&long=${coordinates.longitude}&max=30`;

    //         var options = {
    //             method: 'get',
    //             uri: url,
    //         };

    //         return request(options)
    //             .then(body => {

    //                 var parsed = JSON.parse(body);
    //                 console.log("length", parsed.results.length);

    //                 var nearest_cp = null;

    //                 parsed.results.some(function (cp) {

    //                     if (cp["waste-type"].indexOf(wasteType) != -1) {
    //                         nearest_cp = cp;
    //                         return true;    // breaking the some loop
    //                     }

    //                 });

    //                 if (!nearest_cp) {
    //                     conv.close("No collection point nearby.");
    //                     return agent.add(conv);
    //                 }

    //                 conv.close(`The nearest collection point is at ${nearest_cp.address_en}, it's one for ${nearest_cp.waste_type}.`);

    //                 conv.close(new BasicCard({
    //                     buttons: new Button({
    //                         title: 'See it on Google Map',
    //                         url: `https://www.google.com/maps/search/?api=1&query=${nearest_cp.lat},${nearest_cp.lgt}`,
    //                     }),
    //                     image: new Image({
    //                         url: 'https://img.icons8.com/color/1600/google-maps.png',
    //                         alt: 'Image alternate text',
    //                     }),
    //                     display: 'CROPPED',
    //                 }));

    //                 return agent.add(conv);

    //             })
    //             .catch(err => {
    //                 // You should also return a message here of some sort
    //                 conv.close("Error fetching data from Gov.hk");
    //                 return agent.add(conv)
    //             });

    //     }

    // };

    // let intentMap = new Map();
    // intentMap.set('Default Welcome Intent', welcome);
    // intentMap.set('Default Fallback Intent', fallback);
    // intentMap.set('User provides type', userProvidesType);
    // intentMap.set('User grants permission', userGrantsPermission);
    // // intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
    // // intentMap.set('<INTENT_NAME_HERE>', googleAssistantHandler);
    // agent.handleRequest(intentMap);

    'use strict';

// const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const { dialogflow, Permission, BasicCard, Button, Image } = require('actions-on-google');
const request = require('request-promise-native');

    const app = dialogflow();

app.intent('User provides type', (conv, params) => {

    if (["Drink Carton", "Coffee Capsule"].includes(params.wasteType)) {
        return conv.close(`This can't be recycled!!!`);
    }

    // conv.close(`Finding a collection point for ${params.wasteType}... `);
    // return conv.close("In fulfillment now!!");

    conv.data.requestedPermission = 'DEVICE_PRECISE_LOCATION';
    return conv.ask(new Permission({
        context: `${params.wasteType}? Cool cool. To locate you`,
        permissions: conv.data.requestedPermission,
    }));

});

app.intent('User grants permission', (conv, params, permissionGranted) => {

    if (!permissionGranted) return conv.close('Sorry, permission denied.');

    const { requestedPermission } = conv.data;

    if (requestedPermission !== 'DEVICE_PRECISE_LOCATION') return conv.close('Sorry, I could not figure out where you are.');

    const { coordinates } = conv.device.location;

    if (coordinates) {

        // return conv.close(`You are at ${coordinates.latitude}, ${coordinates.longitude}`);

        const wasteType = conv.contexts.get('userprovidestype-followup').parameters.wasteType;

        var url = `https://api.data.gov.hk/v1/nearest-recyclable-collection-points?lat=${coordinates.latitude}&long=${coordinates.longitude}&max=30`;

        var options = {
            method: 'get',
            uri: url,
        };

        return request(options)
            .then(body => {

                var parsed = JSON.parse(body);
                console.log(parsed.results.length);

                var nearest_cp = null;

                parsed.results.some(function (cp) {

                    if (cp["waste-type"].indexOf(wasteType) != -1) {
                        nearest_cp = cp;
                        return true;    // breaking the some loop
                    }

                });

                if (!nearest_cp) return conv.close("No collection point nearby.");

                conv.close(`The nearest collection point is at ${nearest_cp.address_en}, it's one for ${nearest_cp.waste_type}.`);

                return conv.close(new BasicCard({
                    buttons: new Button({
                        title: 'See it on Google Map',
                        url: `https://www.google.com/maps/search/?api=1&query=${nearest_cp.lat},${nearest_cp.lgt}`,
                    }),
                    image: new Image({
                        url: 'https://img.icons8.com/color/1600/google-maps.png',
                        alt: 'Image alternate text',
                    }),
                    display: 'CROPPED',
                }));

            })
            .catch(err => {
                // You should also return a message here of some sort
                return conv.close("Error fetching data from Gov.hk");
            });

    }

});
}
