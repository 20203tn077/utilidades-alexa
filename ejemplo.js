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
        const { products } = await getAttributes(handlerInput);
        const speakOutput = !products.length 
            ? "Bienvenido, empieza a agregar productos"
            : "Bienvenido. Tienes un carrito en curso, sigue agregando productos";
        return getResponse(handlerInput, speakOutput, true);
    }
};

const AddProductIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
            && Alexa.getIntentName(handlerInput.requestEnvelope) === "AddProductIntent";
    },
    async handle(handlerInput) {
        if (isDenied(handlerInput)) return getResponse(handlerInput, "Entendido, no se agregó ningún producto", true);
        const attributes = await getAttributes(handlerInput);

        const name = getSlot(handlerInput, "name");
        const price = getSlot(handlerInput, "price");
        const amount = getSlot(handlerInput, "amount");

        const product = {
            name: name,
            price: price,
            amount: amount
        };

        attributes.products.push(product);
        await saveAttributes(attributes);
        const speakOutput = "Producto agregado";

        return getResponse(handlerInput, speakOutput, true);
    }
};

const CloseCartIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
            && Alexa.getIntentName(handlerInput.requestEnvelope) === "CloseCartIntent";
    },
    async handle(handlerInput) {
        const { products } = await getAttributes(handlerInput);

        let subtotal = 0;
        for (const product of products) {
            subtotal += product.price;
        };
        const iva = 0.16;
        const total = subtotal + subtotal * iva;

        await clearAttributes(handlerInput);
        const speakOutput = `El total a pagar es de ${total} pesos, de un subtotal de ${subtotal} pesos más ${iva * 100} por ciento de IVA `;

        return getResponse(handlerInput, speakOutput);
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
    A todas las funciones hay que mandarle primero el handler input
    y tienen que tener cuidado con las que son asíncronas, que
    básicamente son todas las que manejen attributes
*/

// Función para obtener los atributos
async function getAttributes(handlerInput) {
    const manager = handlerInput.attributesManager;
    const attributes = await manager.getPersistentAttributes();

    /*
        En este bloque es donde se setean los atributos por defecto.
        Considero que lo que hace su papá de estar seteando la estructura
        en el launch no es lo más adecuado; y para separar bien las
        responsabilidades, es mejor que de eso se encargue este método.
        No hemos visto operadores todavía, pero el punto es que el operador
        &&= lo que hace es que si mi operando del lado izquierdo tiene algo,
        lo deja como si nada. Pero si es nulo entonces le asigna el valor
        que hay del lado derecho. Como gracias a esto siempre va a haber
        algo en mis atributos, la validación para saber si hay o no productos
        no sería intendandose fijar que la lista sea nula, sino que esté
        vacía (products.length === 0).
        En sí esta sería la única parte que tendrían que personalizar de
        acuerdo a las necesidades del examen
    */
    attributes.products &&= [];

    return attributes;
}

// Función para guardar los atributos, se deben mandar el objeto attributes
async function saveAttributes(handlerInput, attributes) {
    const manager = handlerInput.attributesManager;
    manager.setPersistentAttributes(attributes);
    await manager.savePersistentAttributes();
}

// Función para limpiar los atributos
async function clearAttributes(handlerInput) {
    /*
        Aquí no importa que le esté mandando un objeto vacío, porque la
        estructura se va a volver a definir en el método getAttributes
    */
    await saveAttributes(handlerInput, {});
}

// Función para obtener slots, se manda el nombre del slot
function getSlot(handlerInput, key) {
    return handlerInput.requestEnvelope.request.intent.slots[key]?.value;
}

// Funciones para validar la confirmación del slot, retornan un booleano

function isConfirmed(handlerInput) {
    return handlerInput.requestEnvelope.request.intent.confirmationStatus === "CONFIRMED";
}

function isDenied(handlerInput) {
    return handlerInput.requestEnvelope.request.intent.confirmationStatus === "DENIED";
}


/*
    Función para obtener la respuesta del intent, recibe un solo speakOutput
    y con reprompt (booleano) se indica si se espera o no respuesta del
    usuario, utilizando el mismo speakOutput.
    El objetivo de esta función es que sea más fácil poder terminar un intent
    desde un lugar que no sea el final del código. Un ejemplo de uso es cuando
    hay que validar que se haya confirmado el intent, ya que en caso de que no,
    se debería devolver una respuesta ahí mismo, pero sería algo tedioso estar
    poniendo ahí todo lo del builder y eso; también a veces lo que usan son
    ifs que abarquen todo el caso donde sí confirma, pero igualmente eso solo
    hace más engorroso el código
*/
function getResponse(handlerInput, speakOutput, reprompt = false) {  
    const builder = handlerInput.responseBuilder;
    builder.speak(speakOutput);
    if (reprompt) builder.reprompt(speakOutput);
    return builder.getResponse();
}