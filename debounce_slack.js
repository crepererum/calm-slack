// ==UserScript==
// @name        Slack Notification Debounce
// @namespace   https://crepererum.net/
// @description Debounce slack notification for sanity.
// @version     1.0
// @homepage    https://github.com/crepererum/debounce-slack
// @match       https://app.slack.com/*
// @grant       unsafeWindow
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    const NotificationOrig = unsafeWindow.Notification;
    const LastNotification = new Map();

    const ConfigSecondsName = "slack_debouncer_seconds";
    const ConfigSecondsDefault = 60;

    unsafeWindow.Notification = function(title, options = null) {
        const now = Date.now();
        console.log(`Notification: title="${title}" options=${options}`);

        const lastEntry = LastNotification.get(title);
        if (typeof lastEntry !== 'undefined') {
            const [last, notification] = lastEntry;

            if ((now - last) / 1000 < GM_getValue(ConfigSecondsName, ConfigSecondsDefault)) {
                console.log("bounce");
                return notification;
            }
        }

        console.log("pass");
        const notification = new NotificationOrig(title, options);
        LastNotification.set(title, [now, notification]);
        return notification;
    };

    // copy all properties from the original date, this includes the prototype
    const propertyDescriptors = Object.getOwnPropertyDescriptors(NotificationOrig);
    Object.defineProperties(unsafeWindow.Notification, propertyDescriptors);

    GM_registerMenuCommand("Configure Slack Debouncer", () => {
        const current = GM_getValue(ConfigSecondsName, ConfigSecondsDefault);
        const next = parseInt(prompt("Debounce Seconds", current));
        GM_setValue(ConfigSecondsName, next);
    });

    console.log("Slack Notification Debounce installed");
})();
