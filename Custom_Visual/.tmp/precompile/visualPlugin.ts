import { Visual } from "../../src/visual";
var powerbiKey = "powerbi";
var powerbi = window[powerbiKey];

var iBCSA153789D2C6545208745114AF424AECD_DEBUG = {
    name: 'iBCSA153789D2C6545208745114AF424AECD_DEBUG',
    displayName: 'IBCS',
    class: 'Visual',
    version: '1.0.0',
    apiVersion: '2.6.0',
    create: (options) => {
        if (Visual) {
            return new Visual(options);
        }

        console.error('Visual instance not found');
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["iBCSA153789D2C6545208745114AF424AECD_DEBUG"] = iBCSA153789D2C6545208745114AF424AECD_DEBUG;
}

export default iBCSA153789D2C6545208745114AF424AECD_DEBUG;