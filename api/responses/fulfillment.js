
module.exports = function () {

  var req = this.req;
  var res = this.res;

  const { WebhookClient } = require('dialogflow-fulfillment');
  const { Card, Suggestion } = require('dialogflow-fulfillment');
  const { dialogflow, Permission, BasicCard, Button, Image } = require('actions-on-google');

  const agent = new WebhookClient({ request: req, response: res });

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  // app.intent('User provides type', (conv, params) => {

  function userProvidesType(agent) {

    let conv = agent.conv();
    let params = agent.parameters;

    if (["Drink Carton", "Coffee Capsule"].includes(params.wasteType)) {
      conv.close(`This can't be recycled!!!`);
      return agent.end(conv);
    }

    conv.data.requestedPermission = 'DEVICE_PRECISE_LOCATION';

    conv.ask(new Permission({
      context: `${params.wasteType}? Cool. To locate you`,
      permissions: conv.data.requestedPermission,
    }));
    agent.add(conv);

  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('User provides type', userProvidesType );
  // intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
  // intentMap.set('<INTENT_NAME_HERE>', googleAssistantHandler);
  agent.handleRequest(intentMap);
}
