/*
MassWhisper
A Roll20 script to allow a GM to send a whisper to multiple characters

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l
Like this script? Buy me a coffee: https://venmo.com/theBenLawson
*/

var MassWhisper = MassWhisper || (function () {
    'use strict';

    //---- INFO ----//

    var version = '0.1',
    debugMode = false,
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 10px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
        alert: 'color: #C91010; font-size: 1.5em; font-weight: bold; font-variant: small-caps; text-align: center;'
    },

    checkInstall = function () {
        log('--> MassWhisper v' + version + ' <-- Initialized');
		if (debugMode) {
			var d = new Date();
            showDialog('Debug Mode', 'MassWhisper v' + version + ' loaded at ' + d.toLocaleTimeString(), 'GM');
		}
    },


    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!whisper')) {
			var parms = msg.content.split(/\s+/i);
			if (parms[1] && parms[1] == 'help') {
                commandHelp(msg);
			} else {
				commandWhisper(msg);
			}
		}
    },

    //---- PRIVATE FUNCTIONS ----//

    commandWhisper = function (msg) {
		// Whisper to the selected characters
		if (!msg.selected || !msg.selected.length) {
            showDialog('MassWhisper Error', 'No tokens are selected!', 'GM');
			return;
		}
        var inclGM, parms = msg.content.split(/\s+/i);
        inclGM = (parms[1] && parms[1].toUpperCase() == 'GM');
        var message = msg.content.replace('!whisper', '').trim();
        _.each(msg.selected, function(obj) {
            var token = getObj(obj._type, obj._id);
            if (token && token.get('represents') !== '') {
                var char = getObj('character', token.get('represents'));
                if (char) {
                    var char_name = char.get('name');
                    sendChat('player|' + msg.playerid, '/w "' + char_name + '" ' + message);
                }
            }
        });
	},

    commandHelp = function (msg) {
        // Show help dialog
        var message = '<span style=\'' + styles.code + '\'>!callsign help</span><br>Sends this dialog to the chat window.<br><br>';
        var message = '<span style=\'' + styles.code + '\'>!callsign message</span><br>Sends a whispered message to every character represented by a selected token.';
        showDialog('MassWhisper Help', message, msg.who);
    },

    showDialog = function (title, content, whisperTo = '') {
        var gm = /\(GM\)/i;
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        if (whisperTo.length > 0) {
            whisperTo = '/w ' + (gm.test(whisperTo) ? 'GM' : '"' + whisperTo + '"') + ' ';
            sendChat('MassWhisper', whisperTo + body, null, {noarchive:true});
        } else  {
            sendChat('MassWhisper', body);
        }
    },

    //---- PUBLIC FUNCTIONS ----//

    registerEventHandlers = function () {
		on('chat:message', handleInput);
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    MassWhisper.checkInstall();
    MassWhisper.registerEventHandlers();
});
