let globalHandlerInput;
let globalManager;
let globalAttributes;

const setHandlerInput = handlerInput => {
    globalHandlerInput = handlerInput;
    globalManager = handlerInput.attributesManager;
}

const getAttributes = async () => {
    globalAttributes = await globalManager.getPersistentAttributes();
    globalAttributes.prop &&= "default value";
    return globalAttributes;
}

const save = async () => await saveAttributes(globalAttributes)

const saveAttributes = async attributes => {
    globalManager.setPersistentAttributes(attributes);
    await globalManager.savePersistentAttributes();
}

const clear = async () => await saveAttributes({});

const getSlot = key => globalHandlerInput.requestEnvelope.request.intent.slots[key]?.value;

const isConfirmed = () => globalHandlerInput.requestEnvelope.request.intent.confirmationStatus === "CONFIRMED";

const isDenied = () => globalHandlerInput.requestEnvelope.request.intent.confirmationStatus === "DENIED";

const getResponse = (speakOutput, reprompt = false) => {
    const builder = globalHandlerInput.responseBuilder;
    builder.speak(speakOutput);
    if (reprompt) builder.reprompt(speakOutput);
    return builder.getResponse();
}