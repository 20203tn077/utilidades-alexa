/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require("ask-sdk-core");

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest";
    },
    async handle(handlerInput) {
        setHandlerInput(handlerInput)
        const { products } = await getAttributes();
        const speakOutput = !products.length 
            ? "Bienvenido, empieza a agregar productos"
            : "Bienvenido. Tienes un carrito en curso, sigue agregando productos";
        return getResponse(speakOutput, true);
    }
};

const AddProductIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
            && Alexa.getIntentName(handlerInput.requestEnvelope) === "AddProductIntent";
    },
    async handle(handlerInput) {
        setHandlerInput(handlerInput)
        if (isDenied()) return getResponse("Entendido, no se agregó ningún producto", true);
        const { products } = await getAttributes();

        const name = getSlot("name");
        const price = getSlot("price");
        const amount = getSlot("amount");

        const product = {
            name: name,
            price: price,
            amount: amount
        };

        products.push(product);
        await save();
        const speakOutput = "Producto agregado";

        return getResponse(speakOutput, true);
    }
};

const CloseCartIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
            && Alexa.getIntentName(handlerInput.requestEnvelope) === "CloseCartIntent";
    },
    async handle(handlerInput) {
        setHandlerInput(handlerInput)
        const { products } = await getAttributes();

        let subtotal = 0;
        for (const product of products) {
            subtotal += product.price;
        };
        const iva = 0.16;
        const total = subtotal + subtotal * iva;

        await clearAttributes();
        const speakOutput = `El total a pagar es de ${total} pesos, de un subtotal de ${subtotal} pesos más ${iva * 100} por ciento de IVA `;

        return getResponse(speakOutput);
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
            && Alexa.getIntentName(handlerInput.requestEnvelope) === "HelloWorldIntent";
    },
    handle(handlerInput) {
        const speakOutput = "Hello World!";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt("add a reprompt if you want to keep the session open for the user to respond")
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
            && Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent";
    },
    handle(handlerInput) {
        const speakOutput = "You can say hello to me! How can I help?";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.CancelIntent"
                || Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.StopIntent");
    },
    handle(handlerInput) {
        const speakOutput = "Goodbye!";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
            && Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.FallbackIntent";
    },
    handle(handlerInput) {
        const speakOutput = "Sorry, I don\"t know about that. Please try again.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "SessionEndedRequest";
    },
    handle(handlerInput) {
        console.log(`~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest";
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt("add a reprompt if you want to keep the session open for the user to respond")
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = "Sorry, I had trouble doing what you asked. Please try again.";
        console.log(`~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you"ve
 * defined are included below. The order matters - they"re processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        AddProductIntentHandler,
        CloseCartIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent("sample/hello-world/v1.2")
    .lambda();

// Utils

/*
    Esto es básicamente lo mismo, pero bastante más simplificado, aquí ya no hay que mandar el
    handlerInput a cada método, sino que se usa setHandlerInput al inicio de cada handler y ya
    con eso funciona todo lo demás; otra diferencia es que los atributos se guardan de forma
    global, lo que hace que ya no haga falta mandar el objeto attributes de regreso. Esto tiene
    ciertas implicaciones. Por ejemplo, si solo están manipulando un objeto, ya no hace falta
    que traigan todo attributes, si no que pueden solo llamar a la propiedad y manipularla, y
    como todo funciona por referencias de objetos, al usar save() todo se guarda de manera
    correcta, el único detalle sería tener cuidado con las propiedades que no sean objetos, ya
    que esas si no son referencias de objetos y si solo se traen esa propiedad pues no se va a
    guardar. enseguida coloco algunos ejemplos

    Ejemplo 1 - Correcto
    -------------------------------------------
    setHandlerInput(handlerInput)
    const attributes = await getAttributes()

    attributes.lista.push(elemento)

    save()

    

    Ejemplo 2 - Correcto
    -------------------------------------------
    setHandlerInput(handlerInput)
    const attributes = await getAttributes()

    attributes.objeto.propiedad = 'valor'

    save()



    Ejemplo 3 - Correcto
    -------------------------------------------
    setHandlerInput(handlerInput)
    const attributes = await getAttributes()

    attributes.propiedad = 'valor'

    save()



    Ejemplo 4 - Correcto
    -------------------------------------------
    setHandlerInput(handlerInput)
    const { lista } = await getAttributes()

    lista.push(elemento)

    save()

    

    Ejemplo 5 - Correcto
    -------------------------------------------
    setHandlerInput(handlerInput)
    const { objeto } = await getAttributes()

    objeto.propiedad = 'valor'

    save()



    Ejemplo 6 - Incorrecto
    Aquí el problema es que 'propiedad' no es un objeto, así que lo que se guardó en la
    variable 'propiedad' solo es el valor y no una referencia, por que al asignarle otro
    valor solo estamos modificando el contenido de la variable, más no la propiedad
    'propiedad' de attributes, provocando que no se guarde el cambio
    -------------------------------------------
    setHandlerInput(handlerInput)
    const { propiedad } = await getAttributes()

    propiedad = 'valor'

    save()
*/

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