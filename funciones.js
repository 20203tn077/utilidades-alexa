async function getAttributes(handlerInput) {
    const manager = handlerInput.attributesManager;
    const attributes = await manager.getPersistentAttributes();
    attributes.prop &&= "default value";
    return attributes;
}

async function saveAttributes(handlerInput, attributes) {
    const manager = handlerInput.attributesManager;
    manager.setPersistentAttributes(attributes);
    await manager.savePersistentAttributes();
}

async function clearAttributes(handlerInput) {
    await saveAttributes(handlerInput, {});
}

function getSlot(handlerInput, key) {
    return handlerInput.requestEnvelope.request.intent.slots[key]?.value;
}

function isConfirmed(handlerInput) {
    return handlerInput.requestEnvelope.request.intent.confirmationStatus === "CONFIRMED";
}

function isDenied(handlerInput) {
    return handlerInput.requestEnvelope.request.intent.confirmationStatus === "DENIED";
}

function getResponse(handlerInput, speakOutput, reprompt = false) {
    const builder = handlerInput.responseBuilder;
    builder.speak(speakOutput);
    if (reprompt) builder.reprompt(speakOutput);
    return builder.getResponse();
}