/* Viper's Pit Version 1.7 Scripts.
By: HHT, TheUnknownOne, Ethan
Credit to: Max, Lutra
*/
/* Documentation for class Reg:
   - Everything is stored in the file Reg.json
   
   Reg.save (key, value):
   Creates/overwrites key with value.
   Example: Reg.save("Server_Name", "Hello");
   
   Reg.init (key, value):
   Creates key with value (no overwrite).
   Example: Reg.init("Script_Loaded", true);
   
   Reg.get (key):
   Gets data associated with key. Can be undefined (if the key doesn't exist)
   Example: Reg.get("Server_Name");
   
   Reg.remove (key):
   Removes key.
   Example: Reg.remove("Server_Name");
   
   Reg.removeIf (function): [ADVANCED]
   Removes all keys which the function returns true on. Function passed gets two parameters. 
   First is the data associated with the current key, second is the name of the key.
   Example: Reg.removeIf(function (key_data, key_name) {
   if (key_name.indexOf("AutoIdle") != -1) {
   return true;
   }
   
   return false;
   });
   
   Reg.removeIfValue (key, value):
   Removes key if the data associated with it is value.
   Example: Reg.removeIfValue("Server_Name", "Hello");

   Reg.saveData ():
   Saves all data stored to Reg.json. All functions do this automaticly, so no need to use this.
   Example: Reg.saveData();

   Reg.clearAll ():
   Removes ALL data stored and clears Reg.json. Useful if you made a huge mistake or change that requires it to be flushed.
   Example: Reg.clearAll();   
*/
/* Documentation for prototype Bot:
   Creates a bot. Example:
   vpbot = new Bot("Viper's Pit", "red", "+", true);
   
   Function documentation:
   new Bot (name, color, prefix, withItalics):
   Creates a bot with name name, colored color. Prefix is optional and can be empty. 
   Default is "+". withItalics can be true/false depending if the bot should have italics like auth.
   Example: vpbot = new Bot("Viper's Pit", "green");
   
   Bot.sendAll(message, channel):
   Sends message to channel. The message will be formatted with given configuration.
   Channel is optional and if none given sends message to every channel.
   Example: vpbot.sendAll("Welcome to Viper's Pit!");
   
   Bot.sendMessage(id, message, channel):
   Sends message to id in channel. The message will be formatted with given configuration.
   Channel is optional and if none given sends message to every channel.
   Example: vpbot.sendMessage(src, "Hey, "+sys.name(src)+"!", 0);
*/
/* Documentation for prototype CommandList:
   Create a command list. Example:
   
   var User = new CommandList("title commands", "blue");
   User.add("cmd1", "desc for cmd1");
   etc.
   User.finish();
   Lists.User = User;
   
   To display, use: 
   Lists.User.display(src, chan);
   
   Function documentation:
   new CommandList (title, bordercolor, help, list_type):
   Creates a command list with title, title. The borders will be colored with bordercolor.
   Help is the help message (default is "Type the following in the main chat in order to use them:")
   list_type should be "ul" (unordered list) or "ol" (ordered list). Default is ul.
   Example: var User = new CommandList("User Commands", "red", "This is the list of user commands:", "ol");
   
   CommandList.add (command, description):
   Adds command with description to the command list.
   description is useless if the title of the list did not contain "Commands" (for rules and other lists.)
   Example: User.add("cmd1", "desc for cmd1");
   
   CommandList.finish ():
   Needs to be called to finish the command list (adds final border).
   Example: User.finish();
   
   CommandList.display (player, channel):
   Displays the command list to id player in channel channel.
   Example: User.display(1, 0);
   
   Note: Can also be used for rules and other lists.
*/
HostIps = ["127.0.0.1"];
// List of IPs that can use /start [exe], /dos [ip], and /startpo commands. These people must be owner (perms or regular).

function poUser(id) {
	this.id = id;
	this.ip = sys.ip(id);
	this.floodCount = 0;
	this.caps = 0;
	this.muted = false;

	this.originalName = "";
	this.megauser = false;
}

SESSION.identifyScriptAs("VP Script 1.7 Beta");
SESSION.registerUserFactory(poUser);

({
	serverStartUp: function () {
		script.init();
	},
	init: function () {
		html_escape = function (str) {
			return str.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
		}

		html_strip = function (str) {
			return str.replace(/<\/?[^>]*>/g, "");
		}

		String.prototype.format = function () {
			var str = this;
			var exp, i, args = arguments.length,
				icontainer = 0;

			for (i = 0; i < args; i++) {
				icontainer++;
				exp = new RegExp("%" + icontainer, "");
				str = str.replace(exp, arguments[i]);
			}

			return str;
		}

		String.prototype.midRef = function (position, n) { // QStringRef QString::midRef
			if (n == null || typeof n != "number") {
				n = -1;
			}

			var str = this;
			var strlen = str.length - 1;
			if (position > strlen) {
				return "";
			}

			var substri = str.substr(position);
			if (n > strlen || n == -1) {
				return substri;
			}

			return substri.substr(0, n);
		}

		String.prototype.replaceBetween = function (pos1, pos2, replace) {
			var str = this;
			var returnStr = str;
			var sub = str.substr(pos1, pos2);
			returnStr = returnStr.replace(sub, replace);

			return returnStr;
		}

		String.prototype.scramble = function () {
			var thisString = this.split("");
			for (var i = thisString.length, j, k; i; j = parseInt(Math.random() * i), k = thisString[--i], thisString[i] = thisString[j], thisString[j] = k) {}
			return thisString.join("");
		}

		sys.appendToFile("Reg.json", "");
		if (sys.getFileContent("Reg.json") == "") {
			sys.writeToFile("Reg.json", "{}");
		}
		
		script.loadRegHelper();
		script.loadBots();
		print("Registry has been loaded.");

		var configFile = sys.getFileContent("config").split("\n"),
			x, c_conf, serv = /server_name=/,
			desc = /server_description=/,
			ann = /server_announcement=/;
		servername = "";
		for (x in configFile) {
			c_conf = configFile[x];
			if (serv.test(c_conf) && !ann.test(c_conf) && !desc.test(c_conf)) {
				servername = c_conf.substring(12, c_conf.length).replace(/\\xe9/i, "é").replace(/\\xa2/i, "¢").trim();
				break;
			}
		}

		namecolor = function (src) {
			var getColor = sys.getColor(src);
			if (getColor == '#000000') {
				var clist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];
				return clist[src % clist.length];
			}
			return getColor;
		}

		vplogin = function (name, color) {
			sys.sendHtmlAll("+<b><font color=red>W</font><font color=blue>e</font><font color=red>l</font><font color=black>c</font><font color=green>o</font><font color=orange>m</font><font color=purple>e</font><font color=red>B</font><font color=blue>o</font><font color=green>t</font></b>: <b><font color=" + color + ">" + name + "</font></b> has logged on to <b>"+Reg.get('servername')+"</b>!", 0);
		}

		vplogout = function (name, color) {
			sys.sendHtmlAll("+<b><font color=red>G</font><font color=blue>o</font><font color=red>o</font><font color=black>d</font><font color=green>B</font><font color=orange>y</font><font color=purple>e</font><font color=red>B</font><font color=blue>o</font><font color=green>t</font></b>: <b><font color=" + color + ">" + name + "</font></b> has logged off of <b>"+Reg.get('servername')+"</b>!", 0);
		}

		cmp = function (a, b) {
			return a.toLowerCase() == b.toLowerCase();
		}

		cut = function (array, entry, join) {
			if (!join) join = "";
			return array.splice(entry).join(join);
		}

		stringToTime = function (str, time) {
			if (typeof str != 'string') {
				return 0;
			}

			str = str.toLowerCase();
			time = time * 1;

			var unitString = str[0],
				unitString2 = str.substr(0, 2);

			var units = {
				's': 1,
				'm': 60,
				'h': 3600,
				'd': 86400,
				'w': 604800,
				'y': 31536000
			},
			units2 = {
				'mo': 2592000,
				'de': 315360000
			};

			var unit1 = units[unitString],
				unit2 = units2[unitString2];

			if (unit2 != undefined) {
				return unit2 * time;
			}

			if (unit1 != undefined) {
				return unit1 * time;
			}

			return units.m * time;
		}

		getAuth = function (id) {
			if (typeof (id) == "number") return sys.auth(id);
			else return (sys.id(id) !== undefined) ? sys.auth(sys.id(id)) : 0;
		}

		floodIgnoreCheck = function (src) {
			var myNameToLower = sys.name(src).toLowerCase();
			return myNameToLower in FloodIgnore;
		}

		removeTag = function (name) {
			return name.replace(/\[[^\]]*\]/gi, '').replace(/\{[^\]]*\}/gi, '');
		}
		randcolor = function () {
			var nums = 5;
			var str = '';
			while (nums >= 0) {
				str += sys.rand(0, 16).toString(16);
				nums--;
			}
			return "<font color='#" + str + "'>";
		}

		colormodemessage = function (message) {
			var x, retmsg = "";
			for (x in message) {
				if (x == "format") {
					break;
				}
				retmsg += randcolor() + message[x] + "</font>";
			}

			return retmsg;
		}

		lolmessage = function (message) {
			var x, retmsg = "";
			for (x in message) {
				if (x == "format") {
					break;
				}
				retmsg += "lol";
			}

			return retmsg;
		}
		
		pewpewpewmessage = function(message) {
			var sendStr;
			var playerLen = sys.playerIds().length, randPlayer = sys.playerIds()[sys.rand(0,playerLen)];
			while (sys.loggedIn(randPlayer) == false) {
				randPlayer = sys.playerIds()[sys.rand(0,playerLen)];
			}
			var name = sys.name(randPlayer), auth = sys.auth(randPlayer);
			var sendStr = "<font color=" + namecolor(randPlayer) + "><timestamp/><b>" + html_escape(name) + ": </b></font>" + (hasEmotesToggled(randPlayer) ? emoteFormat(message) : message);
			if (sys.auth(randPlayer) > 0 && sys.auth(randPlayer) < 4) {
				sendStr = "<font color=" + namecolor(randPlayer) + "><timestamp/>+<i><b>" + html_escape(name) + ": </b></i></font>" + (hasEmotesToggled(randPlayer) ? emoteFormat(message) : message);
			}
			return sendStr;
		}


		if (typeof tourmode == 'undefined') {
			tourmode = 0;
		}

		Reg.init("Megausers", "{}");
		Reg.init("FloodIgnore", "{}");
		Reg.init("Capsignore", "{}");
		Reg.init("Autoidle", "{}");
		Reg.init("Channeltopics", "{}");
		Reg.init("Mutes", "{}");
		Reg.init("Tempbans", "{}");
		Reg.init("Rangebans", "{}");
		Reg.init("Bannedwords", "{}");
		Reg.init("Kickmsgs", "{}");
		Reg.init("Banmsgs", "{}");
		Reg.init("Welmsgs", "{}");
		Reg.init("Emoteperms", "{}");

		if (typeof MegaUsers == 'undefined') {
			MegaUsers = {};
			try {
				MegaUsers = JSON.parse(Reg.get("Megausers"));
			} catch (e) {
				MegaUsers = {};
			}
		}

		if (typeof FloodIgnore == 'undefined') {
			FloodIgnore = {};
			try {
				FloodIgnore = JSON.parse(Reg.get("FloodIgnore"));
			} catch (e) {
				FloodIgnore = {};
			}
		}

		if (typeof Capsignore == 'undefined') {
			Capsignore = {};
			try {
				Capsignore = JSON.parse(Reg.get("Capsignore"));
			} catch (e) {
				Capsignore = {};
			}
		}

		if (typeof Autoidle == 'undefined') {
			Autoidle = {};
			try {
				Autoidle = JSON.parse(Reg.get("Autoidle"));
			} catch (e) {
				Autoidle = {};
			}
		}
		if (typeof Mutes == 'undefined') {
			Mutes = {};
			try {
				Mutes = JSON.parse(Reg.get("Mutes"));
			} catch (e) {
				Mutes = {};
			}
		}
		if (typeof Tempbans == 'undefined') {
			Tempbans = {};
			try {
				Tempbans = JSON.parse(Reg.get("Tempbans"));
			} catch (e) {
				Tempbans = {};
			}
		}
		if (typeof Rangebans == 'undefined') {
			Rangebans = {};
			try {
				Rangebans = JSON.parse(Reg.get("Rangebans"));
			} catch (e) {
				Rangebans = {};
			}
		}
		if (typeof Bannedwords == 'undefined') {
			Bannedwords = {};
			try {
				Bannedwords = JSON.parse(Reg.get("Bannedwords"));
			} catch (e) {
				Bannedwords = {};
			}
		}
		if (typeof Kickmsgs == 'undefined') {
			Kickmsgs = {};
			try {
				Kickmsgs = JSON.parse(Reg.get("Kickmsgs"));
			} catch (e) {
				Kickmsgs = {};
			}
		}
		if (typeof Banmsgs == 'undefined') {
			Banmsgs = {};
			try {
				Banmsgs = JSON.parse(Reg.get("Banmsgs"));
			} catch (e) {
				Banmsgs = {};
			}
		}
		if (typeof Welmsgs == 'undefined') {
			Welmsgs = {};
			try {        
				Welmsgs = JSON.parse(Reg.get("Welmsgs"));
			} catch (e) {
				Welmsgs = {};
			}
		}
		if (typeof Channeltopics == 'undefined') {
			Channeltopics = {};
			try {
				Channeltopics = JSON.parse(Reg.get("Channeltopics"));
			} catch (e) {
				Channeltopics = {};
			}
		}
		if (typeof Emotetoggles == 'undefined') {
			Emotetoggles = {};
			try {
				Emotetoggles = JSON.parse(Reg.get("Emotetoggles"));
			} catch (e) {
				Emotetoggles = {};
			}
		}
		
		if (typeof Emoteperms == 'undefined') {
			Emoteperms = {};
			try {
				Emoteperms = JSON.parse(Reg.get("Emoteperms"));
			} catch(e) {
				Emoteperms = {};
			}
		}
		
		hasEmotePerms = function(name) {
			var n_l = name.toLowerCase();
			if (!Emoteperms.hasOwnProperty(n_l)) return false;
			return true;
		}
		
		hasEmotesToggled = function (src) {
			if (getAuth(src) <= 0 && !hasEmotePerms(sys.name(src))) return false;
			if (Emotetoggles[sys.name(src).toLowerCase()] == undefined) return false;
			return true;
		}

		getTier = function (src, tier) {
			return sys.hasTier(src, tier);
		}
		
		ev_name = function(num) {
			var ret = num == 0 ? "HP" : num == 1 ? "ATK" : num == 2 ? "DEF" : num == 3 ? "SPATK" : num == 4 ? "SPDEF" : "SPD";
			return ret;
		}
		
		isTier = function(tier) {
			var found = false;
			sys.getTierList().forEach(function(t) {
				if (cmp(t,tier)) found = true;
			});
			return found;
		}

		border = "<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>";

		if (typeof (muteall) == 'undefined') {
			muteall = false;
		}
		if (typeof (supersilence) == 'undefined') {
			supersilence = false;
		}
		if (typeof (rouletteoff) == 'undefined') {
			rouletteoff = true;
		}
		if (typeof (htmlchatoff) == 'undefined') {
			htmlchatoff = false;
		}
		if (typeof CommandsOff == 'undefined') {
			CommandsOff = [];
		}
		if (typeof (lolmode) == 'undefined') {
			lolmode = false;
		}
		if (typeof (spacemode) == 'undefined') {
			spacemode = false;
		}
		if (typeof (capsmode) == 'undefined') {
			capsmode = false;
		}
		if (typeof (reversemode) == 'undefined') {
			reversemode = false;
		}
		if (typeof scramblemode == 'undefined') {
			scramblemode = false;
		}
		if (typeof colormode == 'undefined') {
			colormode = false;
		}
		if (typeof pewpewpew == 'undefined') {
			pewpewpew = false;
		}
		if (typeof bots == 'undefined') {
			bots = true;
		}
		if (typeof (maxPlayersOnline) == "undefined") {
			maxPlayersOnline = 0;
		}

		Reg.init('MOTD', '');
		Reg.init("Leaguemanager", "HHT");

		if (Reg.get("Champ") === undefined) {
			var LeagueArray = ["Gym1", "Gym2", "Gym3", "Gym4", "Gym5", "Gym6", "Gym7", "Gym8", "Elite1", "Elite2", "Elite3", "Elite4", "Champ"];

			for (var x in LeagueArray) {
				Reg.init(LeagueArray[x], "");
			}
		}

		Leaguemanager = Reg.get("Leaguemanager");

		var channelIds = sys.channelIds();
		ChannelNames = [];
		for (var x in channelIds) {
			ChannelNames.push(sys.channel(channelIds[x]));
		}

		PlayerIds = sys.playerIds();

		var makeChan = function (cname) {
			sys.createChannel(cname);
			return sys.channelId(cname);
		}

		staffchannel = makeChan("Auth Party");
		league = makeChan("Viper's League");
		watch = makeChan("Watch");
		android = makeChan("Android Channel");

		getTimeString = function (sec) {
			var s = [];
			var n;
			var d = [
				[315360000, "decade"],
				[31536000, "year"],

				[2592000, "month"],
				[604800, "week"],
				[86400, "day"],
				[3600, "hour"],
				[60, "minute"],
				[1, "second"]
			];

			var j, n;
			for (j = 0; j < d.length; ++j) {
				n = parseInt(sec / d[j][0]);
				if (n > 0) {
					s.push((n + " " + d[j][1] + (n > 1 ? "s" : "")));
					sec -= n * d[j][0];
					if (s.length >= d.length) {
						break;
					}
				}
			}

			if (s.length == 0) {
				return "1 second";
			}

			return andJoin(s);
		}

		andJoin = function (array) {
			var x, retstr = '',
				arrlen = array.length;

			if (arrlen === 0 || arrlen === 1) {
				return array.join("");
			}

			arrlen--;

			for (x in array) {
				if (Number(x) === arrlen) {
					retstr = retstr.substr(0, retstr.lastIndexOf(","));
					retstr += " and " + array[x];

					return retstr;
				}

				retstr += array[x] + ", ";
			}

			return "";
		}

		ban = function (name) {
			sys.ban(name);
			if (sys.id(name) != undefined) {
				kick(sys.id(name));
			} else {
				aliasKick(sys.dbIp(name));
			}
		}

		getName = function (name) {
			var pId = sys.id(name);
			if (pId == undefined) {
				return name;
			}

			return sys.name(pId);
		}

		kick = function (src, floodBot) {
			var xlist, c;
			var ip = sys.ip(src);
			var playerIdList = PlayerIds,
				addIp = false;

			for (xlist in playerIdList) {
				c = playerIdList[xlist];
				if (ip == sys.ip(c)) {
					if (!floodBot) {
						sys.callQuickly('sys.kick(' + c + ');', 20);
					} else {
						sys.kick(c);
					}
					addIp = true;
				}
			}

			if (addIp) {
				reconnectTrolls[ip] = true;
				sys.callLater("delete reconnectTrolls['" + ip + "'];", 5);
			}
			sys.kick(src);
		}

		aliasKick = function (ip) {
			var aliases = sys.aliases(ip),
				alias, id, addIp = false;
			for (alias in aliases) {
				id = sys.id(aliases[alias]);
				if (id != undefined) {
					sys.callQuickly('sys.kick(' + id + ');', 20);
					addIp = sys.ip(id);
				}
			}
			if (addIp != false) {
				reconnectTrolls[addIp] = true;
				sys.callLater("delete reconnectTrolls['" + addIp + "'];", 5);
			}
		}

		pruneTempbans = function () {
			var x, t = Tempbans,
				c_inst, TIME_NOW = sys.time() * 1;
			for (x in t) {
				c_inst = t[x];
				if (c_inst.time != 0 && c_inst.time < TIME_NOW) {
					delete t[x];
				}
			}
		}

		pruneMutes = function () {
			var x, t = Mutes,
				c_inst, TIME_NOW = sys.time() * 1;
			for (x in t) {
				c_inst = t[x];
				if (c_inst.time != 0 && c_inst.time < TIME_NOW) {
					delete t[x];
				}
			}
		}

		script.loadCommandLists();
		print("Command lists have been loaded.");

		emoteFormat = function (message) {
			var emotes = 0;

			message = message.replace(/xD|XD/g, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAACXZwQWcAAAAyAAAAMgCxEE/eAAAOC0lEQVRo3t2aaXRVVZbHf+fe++aX914SMpIEMkEGIIpBVIJMIghoiaLlsq1y2ZbtWKvKsl1abdtiteOyyqnKoZpapWs5rFZLkBKRSZBZkHkMMYTMCS9z3jzce/vDe4kgCQTBfOiz1vuQ5OXe8zt77//eZ58j+GmGCbABTkCc8nsv4AGCgH4xXygu0nNsQD5wKVAGjAFShCDFZJSFEBAKa2ia3g20ATXAAWAPcAzovlCwCwGR4pOfD1xvNskTsjKsSWNzE6SC0QnkZtuwWRWy0iwoikSzO0CvN0Jji5/qWi/Hanr1uiafx+OLVgKrgeXAQSA8XCACKALukmVxa8Eoe/bsqenSnKszKCt2kZpsxmSSQYo/Wo8vtIj/rOlEIxqdPWGOVvfw1daTfPl1C4equtuDIW0FsATYCUR/SpAk4G5ZFg9MLE0cfdctecyfmUlWphVJEqDFJj4UHxFCxGyqQ3tniA3bT/LOJzVs2O7uCIbU94FXgdqfAqQceDYn0zrr/l8UynctyiUt1QI66NqFxa0QgCzweCIsW9XIn/5WycHK7v26zpPASkA91zPkIbxHBhbKslgy5+qM8r8+d7l0y4Ic7FZDDOBiaY8GJqNEWWki112dgc+vph+t7p0bjeoRYD8QuRAQBXjAbJJfvv9fCjJfW3wZ+bkJoOn8ZEOHRJeJayrSSXQYLbsOdE73B1UHsO1sQiCfQ5UeSLAbnvvDw+Ocv3+wFEeC4YLdaKgwBkVw+SXJFOYmyNt2tZf3eiN2YPNgljkbyI0mo/Snp34z3vXwr4owGUS/AA3XEEBJoZO8bLu0Ybv7Ml8gGgC2D5RzBgO5VJLEkvtuLxz5xEMlmAzSsEOcap2iAgcWsyxv2tFWHolq3wFHhgLiAv587dSMK17/QzlOp/GnjYkBrCBkEZPnU1JQWUkS7Z0h8879HeOAr4COc4Hcm5VuefC1pyZKdQ1eOjpDJCeaMZik0x5+0QEkgZAEgaDKnoOdNLX6yUyz9udRRZGYUOxi2672lMbWgDleDaiDgYwVglcevbdkxPWzRvLkywf545JKvt7hxueLkOQ04XQYkRRxUYo0IWKrr6pwot7LR5/Xs/jVQ7z69yo0Ha6dmh5LtHEXcziMJDmNfLGhuSAS0fYA1YMlxOfHjXE+/sW708jJtNHRGWLrrjaWrW5k0842AKZensJNc7O4amIKycmm2Iqp+pANJYglP12H9o4g23a3s3RVI5u/bUMImDY5lYVzsqgoH0Gi03habAoB/qDKHb/dzrLVjZ8DtwH+H4KMEoI1Lz52yZhH7ytG1/TYJCWBGtWpa/SxdnMLy9Y0cfBYN6nJZq6bnsHPZo9k/FgXVpshVp4MEk9CEiAEPl+Eg5XdLF/bxJcbW2jrCDKhyMXCOVnMrkgnZ6QNWRGg6QMKjJAFX65v5taHtnq8vujPgA0/BPm3/FH2t9a8N0PKy7GfMaHYRCDgVzlU1c2Kr5r4Yn0LJ9uDjBvr5IZrRjJ7ajp52fZ+v+4XHh1q6r2s2dzK8rWNHKrqISPVwoKZmSyYmUnpWBcWizykckcI8Pqj3HTvFtZuaX0DeOhUEBPw8T235d/w9rOTzpjIGa6hxFa3oz3IxyvqefaNwzS1Bpg6KYVP36ogJdn0fdErCY4d7+Xm+7dwuKqH0jFOnniwlHkzMnAmmmKKeB6u2WeVv7xTxa8X764ErgGa+oK9wKBIjz96b7FjXLErVsUO5h6SoLc3wpadbt56r5qPVtQjEFw/ayT331FASaHz+wCNgxsNMlaLQjCs9e9Her0RXHYDLocR2SBxPvIhhMBiklm6ujHB549uBqr6/ntRdqb1f9d/MFMuyE04zbx9cRIJa1TXeli5oZllaxqpqfNRmGtn4Zws5k3PJG+UHcUgoav6gGYUkoTPG2Hv4U6Wrm5k1cYWvL4oV1yazKLrspk2OZXUVMuQxEMI8PqizL97E5t2uJ8BnlTifyvLz7HLGWkWfigT7o4gW75t4x8rG9i6ux2LRebainSeeWQCl41PIiHB0O/bA0LEpVNXNWwWmYrJqUyZlMq/3xPg629O8o+VDTzy7D5cTgPXTctg4ZxsyopdWK3KoPGi62C3GRg/1smmHe7xgFGJ55KC/FF2bBYZXY8RB4Iqr79bxYfL6+joCnHpuCT+8LtxzLoqncx0C5IcVxZVP59qA+Lfz0yzcPvCXG6el0NldQ+fr2tm+bpG3v+sjtJCB/fcls+ieTmDx6ssKMpzAIwCXEo80NPysu2x7Wn8RZGIRkOznxuuGcnCOVmUjHFiNsvnXv2hQumxIDcqgrKSRMpKEnnglwV8s6eDj7+oZ8/hLhbOzUaRxWAPIDfbhskoJYbCWoIC2AGX02GIB0RMvxPsBl75r4koioSQQFcvfPKDQsVdKMlpZN6sTOZMy0BVtcEh+lo3VgVJEglAeh9I4oC7KlnEkpzKsAxdj7meJEBSpPPpoSVI/D8ZCuADes5MOtLFa9/9WAup2lCq7TDgU+ItzC6PN9ovvVFV5/NV9TS2BlCUeNwMM4TJKHP9zEzSUsyDbuoCQRVdpxdoUeJEbScavP0bKFXV+XqHm2272zhc1YtLtWCWlGHcFOq0aX4MLwruvDUPovqAWfFEg49gSO0BvEq8o1d9vN5LIKhiMcmYjBJ/fOISTtT7uO6XG5niL6DIPAJtmOyiofNh+wG272vnzptzB/mSTtWJXoB6oKtvmQ8cr/NqLW1BKS/HDpqO0SCR6DRgscn09AYxCGnYQASCVMXGdye8BEMqJqN8Roni80c5eKwH4BAQ6lOtAy3ugHv/0a5YEyguhYlOI4W5dprCvcMG0VdoOmUz0aiGpg2gOUJQ1+ij8nhvBNjR17sCOBEKa/vXbm5FP8UfDSaZqyen0qj14tHCwypiZ104CTZ/20aLO1AP7D0VJACsWL/NTX2LP1aux4uj2VPSMSZrHA92IoYJRQc6owFsNgVZFqchCQEBX5TP1zWh62wAGk4FAVj9Xa2n9ov1zf221DWdonwHs6amscffTEiPDgtIWI9yMuplXKEzdkRxmjUEOw90sm1Puw/4lPju6VSQak3TP3lv6QncbcFY6wcwGCV+9fN8PHY/RwJtSD/CKpqmoanq9x9NixWNA3qNwB310WsMMHVS6hkBEg5p/P3jGrp6wl/HW6gDtoOaW9zB+SnJJtdV5SkxG+uxkru6wcNX+5opMqcMOadomobZZiVtdA6jJ5SQVVxAet5orA476DrhYBBN1foXrc+tNnlqSS4RPHZfMdZTLCJkwepNLTz/xmFfMKT9Pq5Y/SXKqeOwqun/8+Z71f89uyJdKitNRFd1DAaJh+8uYtOONra01jHXWXhWu+i6jtFsYuwV5YybUUFKdhYmi7k/9qLhCN6ubuoPV3Jwwxaaq2tAj1mjJtzFUc3NSz8vIznJ1F9xCyFoaw/y0l+P0t0bWQ6sO1ensbK7N3zZybZg3pxpGVhMsc1WSrIZu03hvQ3VOHUz6YaEQSHsiS5m3HkbV9w4j8S0FGRFPs1FJFnCYreRnj+avIkTiIYjtJ1ooCvq57Puo1w5y8V/PFCKySD1y3FU03n+jSN8uLzuuA6/ARrPBeIHjlfXemYLgXPa5FTk+EoWFzhxdwdZuusEOQYXLtl8hkgajEam37GICTMqQDBoLHxvOTOjSouob2nkrb2rcRbp/OXpcrIzrad1Yj78rI7Frx3yBcPqY/F26ZC68Q2aTte+I12z7DaDqXxCMpIU67+Wj09i3/FO1h1tIMvoOA1G1zSKp1zOlTctOM3vz5bBJUmiqqmWF1a9TzChhb+9MJlLShP7N1tCEvxzbSMPP7NXbe8MvQq8zgB9nrOdjxwKRzTP1t1tFXarYiovS0YSYLMamDophb01Haw8Wo9dNpKi2JCEwGgxc/Xti0gemX5WSwghUGQZX9DPR+tX8NArT6JYG1jywmTKJySfAfHgk7vVplb/m8DieM47r4MeDdgdDmuerbvbK6JRzTRxfBImo4wjwcDMK9PoDgVZdqiGBp8HmzCQXziGKTfOx2A0gh6bcN9HkiRkSQZ0Onu6WbVzI4+//SIffPUBC66189pT5YzNd8RbtYKopvPBslp+98zeaFNr4E3gP+Nbjh99qqsAdxkU6emb5mZlLP7teIoKHCAgFNJYs6mZ196tYveuLgpHFLBowUIuHVNKTlomBsXQL6qdvT1UN9byzZF9bNr3DSd7armq3MGDvxjLlEkpGBQpBiELWt0BXl5SydsfVHs9vuifgefPBnG+x9PTgefG5CVc8cjdReKWBTkkJhoBQW9PmM3fulm+tpEdezvo6NIxynaiqkDXYvIdUYMohhCjskxMvzyVeTNGUlaSiMksx/ZBkiAYUFmzuYUX3z7KN3s7qjVNfxr46FwnuucLApAB/NpokP51ymUj0u6+LZ85UzMYMcIEsoQWUensClPf7ONke4CGZj+RiMaIJBPpqRay0qykp1iw2ZTT3uz1RNi6u513Pqlh5YZmr8cX/RR4CTh8PhXz+Q6Z2OWB+0xGaf74sa6U+TMzuaYineJ8B4kuI5JRYsDOmq6DBnpUw+OLUlPvZeMON/9c18TO/R0ery+6EXg7frQWPN/S/8cOAzAOWCgEcx12Q1Fetj2hpNBBcYGTzDQL2ZnW/hwE0OIO0OwOcOy4hyPf9fBdrSfY0R2u0TR9PbA0vrfw/9g9zMXYB7mAUmAScAmQK0kiw2SUFAHGeC0YCoU1TVV1N1BH7CbQt8RuNbgZ9Axg+EAGcj0rsQs4CrG7XHJcdVRid7M8nOftn3ON/wMhU8lajgIBhwAAAEp6VFh0c29mdHdhcmUAAHja88xNTE/1TUzPTM5WMNMz1jNXMLDUNzDRN7BQCLRQyCgpKbDS1y8vL9fLzE1MT81NTM9MztbLL0oHANiaEZh+e7NWAAAAIXpUWHRUaHVtYjo6RG9jdW1lbnQ6OlBhZ2VzAAB42jMEAAAyADIMEuKEAAAAInpUWHRUaHVtYjo6SW1hZ2U6OmhlaWdodAAAeNozNDAwAAAB6ADCXokWjwAAACF6VFh0VGh1bWI6OkltYWdlOjpXaWR0aAAAeNozNDAwAAAB6ADCRQSm8gAAACJ6VFh0VGh1bWI6Ok1pbWV0eXBlAAB42svMTUxP1S/ISwcAEXsDeF85R+IAAAAgelRYdFRodW1iOjpNVGltZQAAeNozNDI1MjU0MzE2AgAK+wIAORq2mAAAAB56VFh0VGh1bWI6OlNpemUAAHjaMzPXMzIxMcxOAgAJtAI0M/qtEwAAAFF6VFh0VGh1bWI6OlVSSQAAeNoFwUsKgDAMBcAb+VZuPIG3KCFNJZgfVJHe3pmhJgcAeDx4y5L6jk9vLelK4HTPmBAI46Sq1aaryWqDWLaK6wf/ThfvZZ1s3AAAAABJRU5ErkJggg=='/>";
			});

			message = message.replace(/:lolwut:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBggGBQkIBwgKEAkKDRYXDRgMDRoQFBsWHxwhIB8cHh4jJzIqIyUvJR4eKzIsIzMpLiwsIR4xNTAqNSYrLCkBCQoKDQsNGQ4OGTQcHiQ1KSksKSwpLCksKSkpNCwpLCkpKSkpKSkpKSkpKSwpKSkpKSkpKSkpKSkpKSkpKSkpKf/AABEIADIAMgMBIgACEQEDEQH/xAAbAAADAAMBAQAAAAAAAAAAAAAABQYDBAcCAf/EADgQAAEDAwICCAQCCwEAAAAAAAECAxEABAUSITFBBgcTFFFhcYEiM5GxFTIXQlJUVWJ0kpOh4Rb/xAAZAQEBAQEBAQAAAAAAAAAAAAAEBQMBAgD/xAAhEQACAQQBBQEAAAAAAAAAAAAAARECAxIhMQQTMkFxUf/aAAwDAQACEQMRAD8A2HutPHWuNeFjbLNypBCNQMSeE+Vc8Q1dZS4U7cLK3FqJVJkzXvIWrIV2doh9JKh85IChxnh7VRdHLNDCZWkE6RM8PajXXjtG1mjJpC9vC3SQlSmlaE8QADtWyjHXD9ylLTS9PP4Y+u1WrABZCSkSRtIrIoFIgARzgj7bUXuuB/YScyQl7jLjELD7ajufiKTuJqlw3WnZWmLZTe2qu9Np0rU2mQY2B9xG1a+abUuUGYUD9Kmuj2Ltcl0nNg+Fm3WCU6DBkAmJrey55C9RQk00W36VsQTPclb/AMooqW/AWf4BkP8AN/yikQgejALf8Recfs31vOJAKi+nSVK32HIbDmaY9GQ4u0dcIPaayCDyjxpT0YvOyyItyqEXKY94MH7j3qpxpRir51AB0FZIk77+Pjzo99tNoodNQmk1yai8jdN34bZfeUonZPZxw8+Q9aYZG6uVWDQTb6nXSRBVwimJfQtRcBEAGPGl13dIRasvakDS6ZlQ5jejTvSGYONiO0tX3yshq51AH5sx5iK0sM8jE59d6WXVhlZkN8YI4j67VV3d/wB0tjEyobSZqUbvbeze71dKeBcXt2UTAO49DJFbW229Br1CpWz5+LWXJ3Nf3ivlLXsy6p9wspcDZUdA1cp2opuvwl7L7I9UikK7XGXakkGQFjUNuEEVom3v8dk+7Zhxk3CkSjQsEkDaSOPHmRUNiOn3SLBoCbXKvqSBsl2HE/7p91cNv9KMtmzcvleQetwpK3DqMhQJ35cANuVZ3Kckb2a3Q+dFWw6EOHVGjl60puMtiU3GhLalPJUI7NhSkzx4xB9a9NqeTdu2N4C3cJPxBWx9j4edY7jvrGoNM26hGxLpA4bEiIJFChJwyvS80ZMvdt3Vuh8GEFPw+vjUI/dd4eUpKpQFHTvPOqi7t3E4m5euPkWrKyreAVwYA9yJrndleP2TodYcgjyBHuDsaXZphS0TeorycL0OJ86K20dYGSSgDuuPMD9zTRSJB4sm+QroPUcT/wC4e/pF/dNFFcR7LrrZabQmxeShId/aAhX1qBDrnY/nVw8fWiii3PIo2PBjXpkAjq+udO3wt8Nv1hXJ0/kHpRRSvSAVcv6ZKKKK4fH/2Q=='/>";
			});

			message = message.replace(/:hmmm:|:hmm:|:hm:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/gif;base64,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'/>";
			});

			message = message.replace(/:ming:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/gif;base64,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'/>";
			});

			message = message.replace(/:sadtroll:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,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'/>"

			});

			message = message.replace(/:whyme:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAABCCAIAAABy/6cMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABA9SURBVGhD1dp1jGXFtgbwwd1dg7u7Q3B3hxAsuLt7cAnu7u7uEDy4u7u7c+/v5XtZd/fpntOnhxnue/uPkzq1S9a3vFbtfj/88MO/+v789ddff/zxh3nV+PPPP/39+eef01lLZljL02Nn36nodEY/xKGsSVavU4vEAAuqX3/9VePHH3889NBDp5566lFHHXXEEUecbLLJpp122t13371lSp+265WeNgPC9H4h8ffff0dxh48pxkdu5t57771rrLHG4osvftZZZ7388stU46effoLZmAz7/vvv11prrW233VYjfPntt9863GvAhrUw8X9AetDUOXdD+lNPPbXYYouNNdZYd911l7+oSX89taDFseP5558fbrjhbrvtthZ9/juC6nDu/4LsFWG00fPVV1/NPvvs66677jvvvKNND8HLb0m49g5ssjVAW2OllVY677zzSnuJ9B+wz05BRscAG3300T/44AO2111iBmDWL7/8klf+fv3118FZ1qtn11131Vls/b8CMrJC65hjjsmuYm9NVQEsFugV/P7G4v39+OOPW2zh22+/HXvssXHKgH8AoV06kmRImW222V577bWmDIOzWBCiF1544TXXXHOnnXYK4EknnXSLLbb47LPPiC6O6rvvvjv66KP5Xr5qookm0u7QtAZ4WEcgUbbUUks98sgj7f1TNBCeDTfccNhhh51qqqnmnHNOIUQbpJFGGmn44YcfYYQRKPzII4+s09/zzz9/tNFGowKDVKT9Bdm0rrnmmkucIBak6I+Btfiqcjx01TDs+OSTT6666qpZZpll8MEHh2eUUUYRPP1OOOGEAimN7dev30wzzVTyKbsdYIn1b2Lvklx++eU///xzRHMk8Z/9c8XVXwyimV9++SUZ8jdxRRzs5JNPLpBa5+233ybGUPZfkyRaUXPMMccQDvrOPvtsPiOxpDvOkkOzQXUFUjhrinVuvPHGI488kgM7/fTTH3jggQUXXDCpyEAXYC3YRZLFzmBA0DDDDMNbgKqHBG655ZYCmaylR6kCYLqJY4wxBqVtumJTTJQhXXbZZd988w3fQ5PxLmoyiJ6eQWazeeed9913362AzoS++OKLoGpabI+UATDuuONC2/TGb731FnVNgGGZ1JXjIeqWgDTQobbaZFTUNrJNuoTKiPf++++fcsopo7d6/KI+XrFHYR522GGmx9iCwQrypN122+3JJ59konYZYogh5Eyrrrrq3XffPUhx9ux4WIvDRJ1OqCh/ePHFF88///wTTzzxEksscd1118HZP1synvMMs7DASO3tttvuxRdffOWVV2R2mOW54YYbnnjiCbK1bNjRa3Y5YELuGeQGG2wAYZwB+mQnQw899EUXXQRVlG3ffffVAyq1TIpTriUxZumll84BIiICAJhLLrlkxx13pB2xc68233xzf2Wze+6554AB6GRWF5Do82y88cZ33nmnyQTiQdZQQw110003iQdohcor9MFGJ6ebbrrXX389E7NfRLfMMssIPEnuillZs+Sv/+mnn7YmJyyWZPCgeFoliT4ORui3pfZ4443HwcpOpOaFAdqSGxnK2oSElhhApXMEy1POsxxyxtvliCOOgNOmPO2gQGjNVpBcAn/w4Ycfesf1HX/88RDSTEqVQNL09YkHV1999WmnndYESVbGS9+sk/FgeKLV+S01ZhpWPumkk/bff38halDg7AIyBElQMBiVAGszv/XXXx9l9LNOlSVV2E488cTnnnuuiCsREbgYaB1zu3uU+K1HH3301FNPTTpFpPL1WHJpykDB3API1VdfPQ5j0003pUXyctFy5ZVXprqPP/54+cBQgx38bdJaeLgo+Y1wijid2LTaaqup8QAMZyUS2nqcwkTLUuB11lmHZzr44IMHemLQBeSVV155wQUXiNGoQTQ58DcbbbSRv05PYtq1117bTDIhFBW23377qN/ll19uygILLLDssstuueWWM844o5Tt2WeffeGFF4jI37322uuOO+7ANcHj2GOPlQ9ZGUi/NPa9994jTKYR6Q3EbLYLyAkmmGCzzTar1d944w3CcVYiHHU3VQ9hAE0xMA9pEIWkzDAHq+uvv570dE4//fSG6RToX331VaIGibPdb7/9HDvGGWccv+ecc04OK6Wc2AThrLPOGpAtpvF39LYLSMc8OpkIiYJsD14O/smz82TAHHPMgRGEAGrqdHm1yy67kDDJizF0zzPkkEPy0ldccYU28OKQ38oQa1k+WXFsIMowK3cBOckkk8jdmn5SbBh//PETMxI2Y1qAQfjQ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'/>";

			});

			message = message.replace(/:trollface:|:troll:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//wAALCAAgACABAREA/8QAGgABAAIDAQAAAAAAAAAAAAAABQIEAQMGB//EADAQAAICAQMCAgcJAQAAAAAAAAECAwQRAAUhEhMxYQYUIlFxgaEVIzJBQlJTYmOR/9oACAEBAAA/APQrm4JWlECRvNOVL9CYGF97E8AfH5Z0edw3mV8Q0aqeTSs5+JwoH11n17dIwGsLVCH9SpIR/wB1cpXpJLJq20RJincjaMkpKmcEjPgQSMjzGgor9oSzSPiSxcneuI1kVXj6C2FQMCpIALckcnzGt20S2IL1rv7tLPTrxgTPaVAYpDz0hhjIAPJwR7j46Mlp+xDuZ9IrK9pmRy8xro2P6sGDfDwx4as/aNq9cijkbsSwyKYnSFh09YbGSwGVwCCpCnHI8M6M9OKlppWuU4Y5VrXQZFdSVHVEnJx4fhAz56Ir7luzKJ2mp9UMGO425P1EK3tfnnJ449xyNItTlnktwrcjkM8Y5oj7oMcgh53y2OASFIJyeNdFt9GrLANtqMJYmcy7hPHkLI37MnJ544zkKME88oWIbVa1YaOvLPDO4kzA6h0PSoIIYjI9kEEHOoOlqbmHasSfyWpEX6r1HUk2X1hu5uMnX/lGzBfmxPU30HlpWKKOGNY4UVEUYVVGAPlr/9k='/>";

			});

			message = message.replace(/>_>|<_</g, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,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'/>";

			});

			message = message.replace(/:stoned:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,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'/>";

			});

			message = message.replace(/:yesyesyes:|:yesyes:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/jpeg;base64,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'/>";

			});

			message = message.replace(/:nonono:|:nono:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/gif;base64,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'/>";

			});

			message = message.replace(/\._\./g, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,R0lGODlhDwAPAPECAAAAAP//AP///wAAACH5BAEAAAIALAAAAAAPAA8AAAIslA2Zx5IB4WIgWnnqvQBt7nzbE5ARiWqnZoqSWipwB39d6JaZe2f11HDIGgUAOw=='/>";

			});

			message = message.replace(/:yay:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEoAAAA+CAIAAAADARrxAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAA3ZSURBVGhD5dt1qG3VFgbwa3d3d3dgd2Mn2IGJiF3YqNiJCnZhJ3Ygit1YqM8O7G6v+d4Pv8dksfbea6/jOfc91PXHYe2555pzfCO+MeZY+wz7d+/rt99++9cf1yOPPPLMM8/kvjZSvspN7WOZ//LLL7/yyis+5m/1pnPxzo06l21+Kuu7hjXA+xt89Q+A9/vvvzNU/v7Nrn+A9QZpMQxUXWH48OEPP/zwG2+88c033/AI16+//mpO7t34mJs8+O233z7//PODlKHX44O13nfffZelTzvttFlmmWWsscYac8wxJ5tssplmmmnWWWedffbZp5122jXXXPO2227DYx988MHXX3/9/fff//LLL7Tg+umnn2Dbdtttp5tuuieeeOKFF14wJwvSwuAxDwoe9ZPv9ddfn3DCCa+44ooY5McffyTZzz//nI/ugWHMW2+99eCDD95xxx232247gKecckrgJ5hggn333feggw5ad911xx13XKqhoEkmmQQwT/0f4EXubAzbs88+O9FEE7Gh+67kZP5yyy0HBpOOPvro44033jjjjDPSSCONNtpoI488spFhf1xjjDGGv+CdfvrpX375JWxDQnUDtl6wAeMvRxp77LGZq1nNeeTmm2/mvSuttNICCyww22yzTT311FNMMQWoUEHrcrPiiiuyXnxh8KazwoDhZVc24XWjjjoqhKEKg131XXglzkYvJaiMWMfg+++/f9FFF+20005HHHHE7rvvDvPSSy/90EMPDR7hgOGFAG280EILvfbaa0SscUANZADUrh9++ME4zoxSkE1g59nxxx9/yy23/N9RC4qLg2XLp556SizxtG222WajjTbCFvfee297TRdTzz///Msuu+xmm222wQYbzDPPPNGUbz/66CORefjhh5cd2y9em9nWevExD6+wwgr2RgkuTEAUpmivaUYLPGx09NFHi8N3333X4GeffWa1L774giUtKFB9fO+995Iwa6m1Pdq28CLT8ssvj7VDcTjgk08+yU4tWY4HJpd4hPsdd9xxRW78RFNIJRa78MILr7vuOv7vYxC2h1Sd2QpeTDfDDDOgddhGGWUU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'/>";

			});

			message = message.replace(/:lol:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/gif;base64,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'/>";

			});

			message = message.replace(/:lazah:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,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'/>";

			});

			message = message.replace(/:derp:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}

				return "<img src='data:image/png;base64,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'/>";

			});

			message = message.replace(/sadface/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/jpeg;base64,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'/>";

			});

			message = message.replace(/:fuckhax:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				str = "<img src='data:image/png;base64,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'>";
				return str;

			});

			message = message.replace(/d:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGM0VCMkIzNTVDOTVERjExQTkwQUYwM0EyOTI4N0VDNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5NjUwQjhERkE5QzMxMURGOUI1QkJDOUQ2MUIxRDY2QiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5NjUwQjhERUE5QzMxMURGOUI1QkJDOUQ2MUIxRDY2QiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNzI1Qjg5MzlGQTlERjExOTg5MEVFQzY0NkFCMTZCNiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGM0VCMkIzNTVDOTVERjExQTkwQUYwM0EyOTI4N0VDNSIvPiA8L3JkZjpEZXNjcmlwdGlv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'/>";

			});

			message = message.replace(/:d/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,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'/>";
			});

			message = message.replace(/:yds:|:youdontsay:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				str = "<img src='data:image/jpeg;base64,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'>";
				return str;

			});

			message = message.replace(/:badass:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/gif;base64,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'/>";

			});

			message = message.replace(/:boss:|:likeaboss:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/jpeg;base64,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'/>";
			});

			message = message.replace(/:yuso:|:yuno:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAAA/CAIAAADFQ7kTAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAA3pSURBVGhD7dt3rFRVHgdw/zPGEo0lagwL2HvvDRexgaholKKINWoU7A2x94a9IvbeFUHFXrH3gg17b6wg0nQ/u9/syezw3mPmzQOzcW9ebu6cOfee8/19f/3Om+WPv8Axy18A4x//BzkTWf69saPlnc5YJu3c8jlXHkamTp06efLk3377zYWvcs4RvL5tKyHPMu0OGny0B06YMCGbzkYnTZr02GOPXXPNNcsuu+yCCy640EILzTfffHPNNdexxx57++23w1m1YhvCy5PbEmQYKDt+4403HnjggX333XeVVVbZZZddbrvttldeeeWnn376x7+Pt99++9lnn7388stXWGGFxRZb7KSTTpoyZUqRS4OCrrq9jUF6OhrPOOOMVVddtX379s7XXXcdroDHJ3p//fXXUBd1zfwvv/zynHPO6dy5c79+/aKuldrbOOCGQBZzKgTCcPzxxy+//PJPPfXUN998M3bsWCNgTJw4EcjvvvvuoosuyqaNjBs3ztm0Sy65ZPz48a6p9Oqrr77xxhtXGVGDCtwQSHuNjsXwnIcOHdq9e/fPPvsMgAyaQBY5Pvroo1133RWe3JKtU90bbrhh0KBBb7755umnn04uWKUCzz//fGQR2hvhsyGQkXd2gKUBAwb06tXrxx9/DELjRQQxVx8hdLBM9Lr45JNPQHW90UYbuevdd98Nqvfee2/77bdfbrnl8GzCn8lkWfvrr79eaaWVTjnlFMppMEYVbivjn4+AgfrFF19gzMcjjjji/fff/+WXX3D4wgsvuKa6Dz74oG9Ne/LJJ1H61ltvNUKje9uASbvB4Zlnnhl+WpZ6tDcxxjUndNlll/3888+vv/76wQcf/NJLLzHpwYMHUwccmgD2Gmus8dprrwVnbq8Xc6MgExVXXHFF26VpLQfx7A/bpgEW46Sl4seYMWMOOOAAdggGeNTe9Q8//GCms9AaEwjOmQoyCml53t+OW5ZxbNIc4jCZQo4aNcq9X331FYQC5qmnngqPCQMHDuSigidsM9HDDz+8FRxGHA0xmX2cfPLJTzzxRATcXP5UQh8Du/DCCw877LDvv//+3HPPRRf+3fvyyy9zqgZPPPFEZ4PUnhAd0X8iuPrqq1tYogV6GwKZsL7eeusJAzZalfGUVUsuGkXlZr799tv99tvvmWeeke6IqFg1eM899+y9996ff/45gwQSbxFN+PS0DTfc0EKtyEMbAmnhYcOGbbnllraYtZvbgV1CyH/yLldcccXFF1989913n3/++UbmnHNOSR9s9HadddahyR4CzAcffECH3eWx+KTYDz300BZbbFGvQbaBuvbp0+fxxx9HaSLHtDvIoF0SBJVDWrt27c477zyQhg8f7mL//fffaqut+Fiqe//994sfI0eOlDMsueSSd9xxB2vMM7luT5APJZDWdTTEpPXoKhlD2LJXCJPXXnstYHPMMcciiyxi04gKsL59++KWukp6JO7gSWL5Htc33ngjzEGIZBmVpL8uhI0yKQx06dLF2qJIC549skcmzvnPCy644LnnnhsyZAj2ID/yyCMXXXRRH/nYe++914Vn8mR77LGHZODVV181QhzxzAKmsmamgqR+iows2RyTCTP0Oa4SLYceeigjRCnRMGkP+fTTTw2y1auuugqqffbZR10m41NtSqRcCzYmewihdOzY8Z133smiNcbMhtR10003ZVoWa84gAz5myZEgQY4qSCCTvbFGg/TQARKdpK44PProo9XTfK+YMfvss3M2RZTEtPvuu6tLKxPj6RLbEMjNN9+c+lUGj+a8KwZoIwYEj9GjR8MjoYdNSHz66adTZ3pORsRM+QBlNlkQ1lWgpanFzFGsqbanC6xyQmtABgn2UJFg3bLaZD7T4jOYMQfLZ0IiGZAASNYBSMhNee0jfcYqV8TTmJm8P1mBeylCMNQYMxsCKcOs0TDsXqVCt230tNNO22STTaRpSbs5IeTolQiVRODAs29hu+WWW0QUH6PzjhTfdL5Ga4wsGgLJ9Ue6LUvUt+l9mEkhncNMqi3WqMdD8+nFcccdBy1uEci1Sn2S/USUSYDwvO666848de3du3fti9li0pdyoAj4++67T4qnjNxuu+2ohjRIeORalJrwJ2Uvt4BKOmuvvXbt67aGyUKaxXbeeeeSl1aFkJLHZjwfy6CRjAMZXQVGkKC6sgKAudYDDzyQ0aYcK1mORUlKBhLvWmNdUre6FpDWEK8j2uhSXdKN6sIgGTjkkEMUk/g0Et/DDz/66KOSoSh2eTKhUPINNthghjueLECK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'/>";
			});

			message = message.replace(/:winning:|:win:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBggGBQkIBwgKCQkKDRYODQwMDRoTFBAWHxwhIB8cHh4jLjIqIyUvJR4eKzssLzM1ODg4ITQ8QTw6QTJCODUBCQoKDQsNGQ4OGTUkHiQuNS01NDU0NCw0NS4yLDU0NTQsKS8pNDQpLC0sNDQsNDU1NC40LCwsLDQsLDQsNCk0LP/AABEIADAAMAMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAGBwUIAQMEAv/EADEQAAIBAwIEBAQFBQAAAAAAAAECAwAEEQUGBxIhMRNBUWEiMnGBFDORweEjUmKh0f/EABkBAAMAAwAAAAAAAAAAAAAAAAIDBAABBf/EABsRAAMBAQEBAQAAAAAAAAAAAAABEQIDEiEx/9oADAMBAAIRAxEAPwB3SypBC8srcqRqWY+gHekpvTj4Lmzls9pxTQSlsG9mVRhR/YvXqff9KY/EzVG0fhzrFzG5SQweErL3Bchc/wC6qnA4kjZFypPmB2FaZgQXe+9yXdq0eoa7dzwuys0TNlWwc4I9PbtW/R+JW6NvFZLLVpHjBz+FuAHjIPXAHkPoRUPpmhXmqRyPZK0jRj4yV6d+nWvN3p4ilaG4V4J0TPLy9zQ1BeXKWX4ccRLPfujeIOSDUYRi5tQfl9GHqp/ii+q18BZvw/E4Rh/hmtJFP+XY/tVlKJAgbxc0O/3Bw5vrTS18S4UpL4QGTIFbJUe//MVWrbtsTeuzof6Sksp9cgAfqauPSF3ttme04lanc26LGt3yTBUUYOME4z5khSfqaHbiGc1dBLoek2+laIltHGM8uXYj5nPUmh7fO3rG/UTO6Q3CfJIOhJ9K67WXUxDGb+dCjvyCONcHHXB5v4rFvoUd4zXLyztJkq7NITUtL/NX4CvDiyuNv8Robt+VkiiLkgfMrdMD3qyqsGUMOxGRSa0+05tzw20CfFOvJ0HlkE/bzpygAAADAFP5aevrI+2Vn4jNBXEbRpZoYNXtlBNn+d168nr9sk0a15kjSaJo5FDo4KspGQQe4pul6UFZ08uoUc9yklnE3w8yyBhzHAOPLNYhl8B28PlcynOEOQPvUrrm07vSZGS0tpb6zfJUovMyexHf71osdD1G7RRbWU4ftmVeRQPq37VG8OyHQXTLVp17StC29IpV6CKGQt9DgfvTGqH27t9dFt2aRxLdy/mSDt9B7VMVVzz5zCHpr1qo/9k='/>";
			});

			message = message.replace(/:pedo:|:pedobear:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/jpeg;base64,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'/>";
			});

			message = message.replace(/:fu:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/jpeg;base64,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'/>";
			});
			message = message.replace(/:facepalm:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/jpeg;base64,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'/>";
			});

			message = message.replace(/:bug:|:error:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,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'/>";
			});
			
			message = message.replace(/:sb:|:notime:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/jpeg;base64,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' />";
			});
			
			message = message.replace(/:rage:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/jpeg;base64,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uz/7RZPPP+C/n+f8L/K/0i+fEkcf82Pqv53/AHRL/B/6L7H+ceOFB/0Xc/LlePpKBY+vf5yS8hSRQ//Z/+0MDlBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAHHAIAAAJnYQA4QklNBCUAAAAAABCH+UJMiNuHdYmm2tL6AWvxOEJJTQPtAAAAAAAQAEgAAAABAAEASAAAAAEAAThCSU0EJgAAAAAADgAAAAAAAAAAAAA/gAAAOEJJTQQNAAAAAAAEAAAAHjhCSU0EGQAAAAAABAAAAB44QklNA/MAAAAAAAkAAAAAAAAAAAEAOEJJTQQKAAAAAAABAAA4QklNJxAAAAAAAAoAAQAAAAAAAAACOEJJTQP1AAAAAABIAC9mZgABAGxmZgAGAAAAAAABAC9mZgABAKGZmgAGAAAAAAABADIAAAABAFoAAAAGAAAAAAABADUAAAABAC0AAAAGAAAAAAABOEJJTQP4AAAAAABwAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAADhCSU0ECAAAAAAAEAAAAAEAAAJAAAACQAAAAAA4QklNBB4AAAAAAAQAAAAAOEJJTQQaAAAAAANbAAAABgAAAAAAAAAAAAAAMgAAADIAAAATAHoAZQBiAF8AYwBvAGwAdABlAHIAXwByAGUAYQBjAHQAaQBvAG4AAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAADIAAAAyAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAEAAAAAAABudWxsAAAAAgAAAAZib3VuZHNPYmpjAAAAAQAAAAAAAFJjdDEAAAAEAAAAAFRvcCBsb25nAAAAAAAAAABMZWZ0bG9uZwAAAAAAAAAAQnRvbWxvbmcAAAAyAAAAAFJnaHRsb25nAAAAMgAAAAZzbGljZXNWbExzAAAAAU9iamMAAAABAAAAAAAFc2xpY2UAAAASAAAAB3NsaWNlSURsb25nAAAAAAAAAAdncm91cElEbG9uZwAAAAAAAAAGb3JpZ2luZW51bQAAAAxFU2xpY2VPcmlnaW4AAAAN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Oi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhhcE1NOkRvY3VtZW50SUQ9InV1aWQ6RkFEQUFDOTFDQUY4RTIxMUE4MjlBMDdGNThCNDhDMTMiIHhhcE1NOkluc3RhbmNlSUQ9InV1aWQ6RkJEQUFDOTFDQUY4RTIxMUE4MjlBMDdGNThCNDhDMTMiIHhhcDpDcmVhdGVEYXRlPSIyMDEzLTA3LTI5VDIzOjIwOjIzLTA0OjAwIiB4YXA6TW9kaWZ5RGF0ZT0iMjAxMy0wNy0yOVQyMzo0Nzo0NC0wNDowMCIgeGFwOk1ldGFkYXRhRGF0ZT0iMjAxMy0wNy0yOVQyMzo0Nzo0NC0wNDowMCIgeGFwOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgRWxlbWVudHMgNi4wIFdpbmRvd3MiIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiBwaG90b3Nob3A6SGlzdG9yeT0iIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgdGlmZjpOYXRpdmVEaWdlc3Q9IjI1NiwyNTcsMjU4LDI1OSwyNjIsMjc0LDI3NywyODQsNTMwLDUzMSwyODIsMjgzLDI5NiwzMDEsMzE4LDMxOSw1MjksNTMyLDMwNiwyNzAsMjcxLDI3MiwzMDUsMzE1LDMzNDMyO0VDMUIzNkEwODdDOTc5QzRGNDU3RDQyM0YxMjA2NDA4IiBleGlmOlBpeGVsWERpbWVuc2lvbj0iNTAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI1MCIgZXhpZjpDb2xvclNwYWNlPSIxIiBleGlmOk5hdGl2ZURpZ2VzdD0iMzY4NjQsNDA5NjAsNDA5NjEsMzcxMjEsMzcxMjIsNDA5NjIsNDA5NjMsMzc1MTAsNDA5NjQsMzY4NjcsMzY4NjgsMzM0MzQsMzM0MzcsMzQ4NTAsMzQ4NTIsMzQ4NTUsMzQ4NTYsMzczNzcsMzczNzgsMzczNzksMzczODAsMzczODEsMzczODIsMzczODMsMzczODQsMzczODUsMzczODYsMzczOTYsNDE0ODMsNDE0ODQsNDE0ODYsNDE0ODcsNDE0ODgsNDE0OTIsNDE0OTMsNDE0OTUsNDE3MjgsNDE3MjksNDE3MzAsNDE5ODUsNDE5ODYsNDE5ODcsNDE5ODgsNDE5ODksNDE5OTAsNDE5OTEsNDE5OTIsNDE5OTMsNDE5OTQsNDE5OTUsNDE5OTYsNDIwMTYsMCwyLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDIwLDIyLDIzLDI0LDI1LDI2LDI3LDI4LDMwOzc5OUUzMURFRDA0RDU0OTQzNTNEMjgzM0IwRjM4NUQ2Ii8+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/Pv/iDFhJQ0NfUFJPRklMRQABAQAADEhMaW5vAhAAAG1udHJSR0IgWFlaIAfOAAIACQAGADEAAGFjc3BNU0ZUAAAAAElFQyBzUkdCAAAAAAAAAAAAAAABAAD21gABAAAAANMtSFAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEWNwcnQAAAFQAAAAM2Rlc2MAAAGEAAAAbHd0cHQAAAHwAAAAFGJrcHQAAAIEAAAAFHJYWVoAAAIYAAAA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' />";
			});
			
			message = message.replace(/:eww:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				
				return "<img src='data:image/png;base64,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' />";
			});
			
			message = message.replace(/:nb:/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,/9j/4AAQSkZJRgABAQEASABIAAD/7SE0UGhvdG9zaG9wIDMuMAA4QklNBCUAAAAAABAAAAAAAAAAAAAAAAAAAAAAOEJJTQQ6AAAAAACTAAAAEAAAAAEAAAAAAAtwcmludE91dHB1dAAAAAUAAAAAQ2xyU2VudW0AAAAAQ2xyUwAAAABSR0JDAAAAAEludGVlbnVtAAAAAEludGUAAAAAQ2xybQAAAABNcEJsYm9vbAEAAAAPcHJpbnRTaXh0ZWVuQml0Ym9vbAAAAAALcHJpbnRlck5hbWVURVhUAAAAAQAAADhCSU0EOwAAAAABsgAAABAAAAABAAAAAAAScHJpbnRPdXRwdXRPcHRpb25zAAAAEgAAAABDcHRuYm9vbAAAAAAAQ2xicmJvb2wAAAAAAFJnc01ib29sAAAAAABDcm5DYm9vbAAAAAAAQ250Q2Jvb2wAAAAAAExibHNib29sAAAAAABOZ3R2Ym9vbAAAAAAARW1sRGJvb2wAAAAAAEludHJib29sAAAAAABCY2tnT2JqYwAAAAEAAAAAAABSR0JDAAAAAwAAAABSZCAgZG91YkBv4AAAAAAAAAAAAEdybiBkb3ViQG/gAAAAAAAAAAAAQmwgIGRvdWJAb+AAAAAAAAAAAABCcmRUVW50RiNSbHQAAAAAAAAAAAAAAABCbGQgVW50RiNSbHQAAAAAAAAAAAAAAABSc2x0VW50RiNQeGxAV/8kgAAAAAAAAAp2ZWN0b3JEYXRhYm9vbAEAAAAAUGdQc2VudW0AAAAAUGdQcwAAAABQZ1BDAAAAAExlZnRVbnRGI1JsdAAAAAAAAAAAAAAAAFRvcCBVbnRGI1JsdAAAAAAAAAAAAAAAAFNjbCBVbnRGI1ByY0BZAAAAAAAAOEJJTQPtAAAAAAAQAF/8kgABAAEAX/ySAAEAAThCSU0EJgAAAAAADgAAAAAAAAAAAAA/gAAAOEJJTQQNAAAAAAAEAAAAHjhCSU0EGQAAAAAABAAAAB44QklNA/MAAAAAAAkAAAAAAAAAAAEAOEJJTScQAAAAAAAKAAEAAAAAAAAAAjhCSU0D9QAAAAAASAAvZmYAAQBsZmYABgAAAAAAAQAvZmYAAQChmZoABgAAAAAAAQAyAAAAAQBaAAAABgAAAAAAAQA1AAAAAQAtAAAABgAAAAAAAThCSU0D+AAAAAAAcAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAA4QklNBAgAAAAAABAAAAABAAACQAAAAkAAAAAAOEJJTQQeAAAAAAAEAAAAADhCSU0EGgAAAAADUwAAAAYAAAAAAAAAAAAAAkwAAAKPAAAADwBvAGIAYQBtAGEALQBuAG8AdAAtAGIAYQBkAC0AbAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAACjwAAAkwAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAQAAAAAAAG51bGwAAAACAAAABmJvdW5kc09iamMAAAABAAAAAAAAUmN0MQAAAAQAAAAAVG9wIGxvbmcAAAAAAAAAAExlZnRsb25nAAAAAAAAAABCdG9tbG9uZwAAAkwAAAAAUmdodGxvbmcAAAKPAAAABnNsaWNlc1ZsTHMAAAABT2JqYwAAAAEAAAAAAAVzbGljZQAAABIAAAAHc2xpY2VJRGxvbmcAAAAAAAAAB2dyb3VwSURsb25nAAAAAAAAAAZvcmlnaW5lbnVtAAAADEVTbGljZU9yaWdpbgAAAA1hdXRvR2VuZXJhdGVkAAAAAFR5cGVlbnVtAAAACkVTbGljZVR5cGUAAAAASW1nIAAAAAZib3VuZHNPYmpjAAAAAQAAAAAAAFJjdDEAAAAEAAAAAFRvcCBsb25nAAAAAAAAAABMZWZ0bG9uZwAAAAAAAAAAQnRvbWxvbmcAAAJMAAAAAFJnaHRsb25nAAACjwAAAAN1cmxURVhUAAAAAQAAAAAAAG51bGxURVhUAAAAAQAAAAAAAE1zZ2VURVhUAAAAAQAAAAAABmFsdFRhZ1RFWFQAAAABAAAAAAAOY2VsbFRleHRJc0hUTUxib29sAQAAAAhjZWxsVGV4dFRFWFQAAAABAAAAAAAJaG9yekFsaWduZW51bQAAAA9FU2xpY2VIb3J6QWxpZ24AAAAHZGVmYXVsdAAAAAl2ZXJ0QWxpZ25lbnVtAAAAD0VTbGljZVZlcnRBbGlnbgAAAAdkZWZhdWx0AAAAC2JnQ29sb3JUeXBlZW51bQAA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' />";
			});
			
			message = message.replace(/pface/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,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' />";
			});
			
			message = message.replace(/feelsgd/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,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' />";
			});
			
			message = message.replace(/feelsrs/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,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'/>";
			});
			
			message = message.replace(/feelscr/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,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'/>";
			});
			
			message = message.replace(/feelsbd/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,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'/>";
			});
			
			message = message.replace(/feelsnv/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/gif;base64,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'/>";
			});
			
			message = message.replace(/nigrin/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,R0lGODlhMgAyAPcAAAIDAAoFAgYJAwsLBAYJCQsNCxMNAxQLBhwNAwwQBw0QDRURBRsTBRUVCxsVCRwZDAoNEA0RExIUFBwcExgZGiYKAjAIACMVBioXBiMZByIVCikXCSQaCysbCzYZCTMdCyQaEy0dEjUfERwiFywgDjQhDjwiDC0iEyQkGiglGTQkFDskEzwpFTQmGTknGjUqGzwqGjEwGhseIxwgJSQlJiwrIikrKyotLzkuIj0yJTQyKDQ1Njk7O0MZCkIkDkkmDkImEkcmFkMqFUwrFEQsG0wtGlItFFcqGFItGUUyHUwyHFc1GlQzHVw0G105H2QpG2Q2HGo2HWM5HXM8HkYzI0w0I0o5KFQ1IlEyJ1k2IVM5JVs7JFIzKVQ8K1w9KmY0IWM8I2w8ImI/Kms9KXE9IXY7KXs+MTdDJ1ZCLlxCLVNTLkhFNlxDMV1IN2xBJWdEKGRDLWtDK3RCJHtEJnNELHtEKnZKLnxKLXtRLGNFM2xFM2RKNGxKNGxMOnRGMnpDNXRMNHtNM3NNOXtPOm9RPnxSNXVSPXxTPHtXPVRoOnN0Ojo7Qj1ASEdISldURVFRVmpOQGtUQnVUQHtWQXxZQ3hZS3JnTmdobYZHJ4RLJoRLK4tOLJRPLYdQKIxRLpRTLZlUL4JFNIRNM4tNNYRNOoRSNYxUM4JVO4xWOoVZOYxaO5NWM5hXM5RaNJtbNJNcO5pcO6RcNJtgO6ZjOqNjPYRcQ4VZRYxdRZZYQ5RdQoRhRo1hRoViS4xkTIprT5RiRJtjRJJkS5ppS4toU5NrU5psU5hoVYx1UJR1XpxzW6NlQqVqRaxsRaNsS6dxSaxyTLF1TqFtUqhsVKRzVKpyUqV1Wqt2WaV6XKt7W7N6VbN7XI14ZZ12Y6J6Yqt+Y7B5ZbOAXZyCYquFabWEaqeNdbaKc6iWdbiWeMeQe8Chf2BlgZCVh7OagrmoiLatl8GPgsaciMeqjs2xjs6ulci1mcW4o9rAn9XGqdvOt+DKrOTVudvTwerawejgwgAAAAAAACH5BAAAAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAMgAyAAAI/gBLbWGSRYqcKVMyfeIEqxmwW9HESbxmLdu0cd7GXXNWbJqwT5syzdEkR8qSHyZKXLiwIIPLDAwCeWHCJMwdUZk6tfoEi9o0YMLGlTvHrhw2bOK8XWvWDBs4YKs6zcFDJ40QFipKlCDRgQEJrhgYHNFC0w2gUp5WqQVGzZqsXNXKDf32TBy2aQ6bgXMmyxSeN2lgnHjwoEGGDhgyPCihosMFBlEGYoWhJc0bRKV+Mf2FClezZw5pOcPWLBewaNOOGeKTJseJFCQaJJi9gIFXrCXCdnGihMOACSNQpMjRhs+uX69MbYpFixYsWKtatVKVKhUlNDFw4EDxYILsBAEG/jDIwAFrh9wXcrzp3eBBcBQjcuSg4uXNnTtqR73axF8TnSxEqMDBCyBM4J134nHQ0gkZUMEBCblhsAYYSpxwgoAccNCAAyRwQIQSS5ChySaniILJHFNIwYQQGHJwAhVoaKEEESyssMIHKpyAwQkMsPABBhhY4YQWLAihhRNvwJFHFy7gSAQTTYx0YhlRNGHEEEAwpkQfwyAzDBxBsACEmCk9uEAIOm7AgBZLpEFTFjTBwcswfXBBxJ1EQDHHHHKEAcUQJtgIBBx8CEJIG12kkYQKG3CwAmIuEFZCBhg4psQWW2hRhAcqiNABDDm00IIKLtxZBBRk+PEFEz580MEK/lcUkQQMGoBQwwAaVLrAAyqQoMICXGXA1QVKaJHpBxm+YAUAPEQwgAMXuOACEEzQEcgYSHhgW6C/UuFIAxSE18AAAxigoAAMcFCCBxispMSQVbjAQACUmOPAAgcYEAkRGqiwAhN+BHMIEhgYYMAHkwKRTjwnBMDAAiz4YIAAu15YZErtKpGFE0TAoMIRrYizhwYMoGHOLXkgMYkYYOwCCBAMHABDFyIwkYs89PhSwgZD0MEEBg+AsEISV/mQ0gcMEOGEE0xUoUQTU8AiDjK9YCNMKJMIsrIYxFBCBAYbVAFJF34EIgw25JBTSxlGYDAAAi0QkYQSQ/xgdMZggMEE/gswCDEEGIh0k0wpUfwAxBViZHFIMr+kYcKrWHRBRRBNgMFGF0FgUEEAE+yhCh5ubOEESiV8QOwXUqShhyBWeeBBDz14cIEGRfgRxxunCLOLG0yIoEIQXUTSBaMVVIAAAhp4kYwzqdxBhklD3M2AElK4QccdpQhDjCFcBCGCCEXQoUkd9r0iTCp48FajEGAI0ocVLojgQhe7aAOOMLJ0EoYTS0T/eAZKAIP4VuGKWDCDGcpgxSoUuIo50MENpVCGM15RCN74YAluuIMmMuEJT5iCLdkABziYIYtMTAEKSzCC3ZC2hDhoEBSxiGEsZjHDWLDCE6IgiSyscQ1h4KF//m8oRSqAMQ1rFJEazsgGNKDhjFl8ohMnVOEPfkACBmzBDXXIBAxj4YoDKsOIwdgFKkxxh7qIIxl2WMIb8IAIRKAhDYKgBDG6IY5yPOMZs8gfFFNogj5+YAFXJEMnPrFFZTTDGL3ogxf2YIhSmAIb1qiGD9f4hj0MRAlW2EIcBkGMa1xjGrIARScyEQUjGMEEH/jRBUQ3h0EyBBjFCIYhrvAhQBQiFb+gRjOE0QxTpCIOSkiFK1qxBC1IYhB8mIQxqpEMWGgCilAwgg9IcAEMII0gc8DEJtTyilsYYiZwCMQsOGPIZSzjGbKQhRycIItZtAIKMOhFLfjAh1oQ4xaB/kDRFJxwynYxIGNbkMNINCGKUwxCD0y4gh5aAY1SrEIZB2TGLPJYCjvIwhmiQEIIeHEKPcBhC4g4BB3CEIVoGo0lLZneEqonBznQgQ5xKEIQ3uAHWCgjELHQxje+oY1sMMMVppAOLOQgMTZMwhaDgIMX+DAGKBwheh9Q0wJqw4AcKIEJTpBC3vRmgnAGwhOqKEUsoAGPecRjHLTgxBxKgaK2AUAFggAEHQCRByJcAU6o3MBjHmabHAjhQwRh2geI8AY3+MEOJoIhM3oaC05QqUpAuMAAAPABPuhBDEtgghZoBCjTIWCqDLiXDcb0tCYwgQMZMJa1TjGGLJgBE5wA/gUoNkGGIGDMAOEJAAwmgYiBEEELw/NXBzRQm9rciwYwYMGTmNABB3QBDoIoBR7CugINYGEMdZhDEzyAgAAIAAAAEIB40qALRAhCEHDYAxtggIGssIQBuWLAAG7wAhawAAlACAAVKNFGRKTCFL8whAgOIAIkDEEEC/BueAEwgA4sARG6MIQg9JCpRWkgB5E1gAMy5IAELGIHMIABEkQwAS6kwRCIKMQhVPGLXdQiDzAIAQNwKwDxooAFTOADHqpDBwoHyEId6EIVJHsBMyXgEo2AARCIMIQqdMEKTuaDQ1uBil/k4haVIAJuHaYFSlAnrKW4gxPAQAQHOOAFMKBC/h+YIN8M9GoAR15EDe7EBDDkIQ9sQHMcRrGK5zTkHN3ghSQgYQxvcAMXfshCEIDgAQ04IAAASAEXqNCGPRRBvi6SbAF48OFSKcENfVCvFbwgAhCIoAlhCAUutCGUd5RDGn7AggjC0l3wAuAAOEBDF7qQhzGwgFwd4IADBkCARzyiETu4ExjiwAbWSEIQRwgAAVQAhB484QlfeELsLGCB4lkAAwcIAAiwAIk+9OHOffjCBgKwgA48wAAEGMAijt2IHLjg03now6AlQYonSGAY5OhFKEZBijKYgRi2KEMt9ECJLjyAC3/4gxcgQQk+5CGmCyDAhsFTYxosYt6PgJ8W/qB7i15Mwg9l4MI63HGPedhDH+iYRz/iIQ56hMMde/CCGcxQhTxQwhaCYIMWOkAuB8h3AN+dgQ0asYhG6EAFRNgCIG4RDFuY4Q9mqIQ76nGPfPQDHfDgBz3I4Y5jbGMQovhDx3hRi0kAwgtJWIB4x0WA7wKg6YygwQ5qkAIVXIEPpwgGMeKA9TFsYx/3eHk85qGPsSPDHIMghRmQ0IE91OIQg8jDFlSA9AWQy+4A2IENbu0I+MSABV4IxC2aUYsxhEIOhqgHPu6hj3vcAx/xaAc5JnEKOhThAkRAqh/6wIYqaAAABOC4rQEwg7qPYA06SIQOWmAFwKMiGNhNeC0W/i+PeZQV0LfIRRmCgIAQ8KEQhMpDFWAAbwEkYLLLb74AFHCGRJyhBmuAgRdOUYhdBAIMuHALfeAHt2AM3GAMtzAMxiANf2AEF2AAWmBZcKAHXlAFJ1BjCrZ8AGADEBABBWAJiUADOuAIOdAFiHAKp3ALYlAH0sANttALC2gM3bBTpHAEDCAAISAGXgAHhpAGaEAESCdeoGdrO5AABSABnFYDI1ADNfACgnALfnAKgZAFoWANYAcP8PAO3xANdTAEj+YAQZAFXmAIfYAGVnCBNTaE4CUBjdAABCABM8ADKTACDdAAICAGVRcIpQAmTVAGpEAKolAGXxAE3PU24CMG/pLAC3uABjDQAOKlgeBFADfAAwkwAjsgAxCAAmuAAgWQAlqQCskACKgwCmOwAiuxVwdwAAMQAAhQKlswCLagC3lABSdALvCngRFgAzYQATLAgXVXAygwAG0ACXtQDbtQCq8QCHKQBSsQAiDgABqgAR8APlkAUr0wDLzQBY1ILpAIAAXwcRwoAzJAAAQQARFwAyMQAmaQBsFQDLeAC1LoB2OwBVxQj14gBnoACIOQCsHQC8lgCASCdN0IADdgCTywAxGgAAoQAYsgAxHACL1YA1VQC8kgRrmQC79gC6cgCZVACUfVC8JwZf44DF1AAnJnd0M4AoqgBnrnkBBwA+pwM46XYAN8dwKHQAy6cAq4gAvJwA3EMAy90AvEQAzFEA3BYE/cIAkuMGwEMJBqYAk1IAMBAQAh+QQBAAAAACwAAAAAMgAyAIAAAAAAAAACM4SPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofEovGITConBQA7' />";
			});
			
			message = message.replace(/nigig/gi, function ($1) {
				if (emotes > 3) {
					return $1;
				}
				emotes++;

				return "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAXfklEQVRoQ9VaebRddXX+zrnzPL3hvvk9kry8JGQgIMgUqihotFDBIoI4QSsQrEAWiSyqVEQ0tLS1KmhdgLYuKq1iRTpIBZGaNBVEIXN4yZvy5nfneTqn3/6de18Cgqur7T/dWVn33HPP8NvTt7+9f08zDMPE/wMpZMqYWZzEocMz+MnPDuDgvqOo1quoNepq9dr/lSL5VBLjo2OY2n8Q6cW5ZdOE2+PoO30t+jriaPh0uL1BeL2+NzRdpVp+zflGvaG+l4tZJNI5pFJZjI0tYfcLx16jiMNm/98rUjJNvPSP38crz/wUM8nF31igh2ecDmD9uk74ejYgHtYRaOuDPdoOV9sASjbrlkY1vXxvvqJDayplOt1IZ6owClkkswYOv3oCx4/NYm4+j6mpUYgS/2OPFIsFZVXxwo+++TB27/kZfA5NPTBnNxCo68uLssOE7vCq770hHYND7WiLinpAqGu1UirXO6y++10GCjUnTKMOTecCbTyuFaHxfvkcnyhg/ytHkDISOLQ3iUwqhUatZClSKhdVjogbNaMCU3fBqFTUj9VGBV6ziKLmRRXWDXV63+cLYXZuHM8++hgOHz2yvGj1nFoF9koZdZdbnbc5XOpTFBWlwrY67AEfesMOnLa6nzFeoVVd6F3/DpgrVsIR7HnN8079kk5n8Oq+cUwvTmMyuYQXn5lEvVqzFNl/4AXTyAMlI6VOKDdqJdTqNdiyGvSoHdFgCL5gBLpNQyjQgf37XsHz3/oWyvmT4VA3CiiW6jBqJuoON9xul1JChxMGzVDLWWEnv+tUyuuxo9sfwIbNqxCip0TaejcgMrwZnp5h5XEJWxGPpqljI1vBgaP7MTVnYGr6BPbseVV5RSnylS/tNPOMiiyT31Y04EEeeSaknwmWqWlYN9yL+Kr16GmLoys+iL1P/wSPffsR6LkUQ6ACrWbAZVbVw8p8WUl3o2KAuRCC29+ulBAp5LLIF0qw6RbKODVeRIlF/Eohr66joyeovBRe+zb4hlcj3nbasjLFGg1cLiC9sIRjE2lkEkmV9JIroox2zXVXKLXNWh4hk5kXtmJdJEyX961di9NWbcK6NWfg0MHDuH/HDnQ7NZgOHWFa3azzdiqUrZhwOZmkDKlylVZnkvoCQaWAiEMzMcfQMCslXuOB12lDrlqFz6wj7HHDyQioNhqIxYLYvH4Fgu3tWHnBVkTXnI06I6FesQxQqBYxduAgkmkdB5emlnNFu/L95y/XkfZYSC0+3B1fVubiDh+M9ZcgEIli+6euR20yhehAN5yZAtxEFqfNhqqdsCTGYH5RB7ipqFNzUjkr10SMqkGPVVEuWbnm9oVRKpfh4bVyzkMjuKms5GeVRoiEw1jZHsHwlndjywc/pJTJlusq6ZMzSyq80oVp/Oy544RngsMXd+00/Xy57rdgzO/2MX4dWEil0REJw982iI1nnIFHv/wAdj/+PfT0DSI1P6dywO32wOUOopxNw+3S+N0KKxdDvmwyyWtleqCAitOvgKRcLiFFz5kEBI3545breL1pc0NrWDVEM6xQVMryeRKiw2deiA/ee586l1qcRTWbQNEMIJXM48D+cbz06zFo33jonmWP1IkgLRGFRMKxTqxlUbvr3s/DyfgMh8KMy3mlSCcVjflcOL6UxRwVL0NDgU/zMTpNhx9hCTU+U0LHRSjNlsooEtFk8S1pKSXfqwQCk6im1a0wMu12RrpJowDXb7sdl9z0R8gzN6XmCExXijomRpM4MnbU8oiRteLYRnhPEqlCDks3+b5i6DT0n7YRD3zus5gan4GfYRTkQiNcZIjWsttM5BktLy0uIsFwKzRO1hB5hsdhR9zrwUi7ZZhSLk+FrWsMKkXfoGYazKHmffRctaHxPD1CRUQZEc3mwD1/dh+G3/J25kez8Lr9rPZFTBxLQ7vqXW81s6RbmsYwMC3sl+OWbH3bu1CoZ/GVv/oewtEQInxfiFbqYlxIYjqcHj6MKGIw1hnzGaKYwVwRydcsjE+QEw257OgMsDAy2dMly/NGg9bmPfJWeaNu03nOUJ8iJ+ODx0TEzeechY/dehs8egTu7pi6RsrF0iwVOfutw8uhFQsRTQJ+dYEkvsi6ofX48sPfRSGRwGBHFGHie4yLkkSPR0LEexeKVIIrQprUqMxkTafTDBEnvFIUiVAphpRIRLdeleT3arUEh1lTCNeSqtSKButXs5iKOVrKiCJOuxMfuOFDGN50IfoG44ixHAgA5OboiC/cdZOpB4PqWW+U9C+8PIZHv/YwVne1IU6LkiqhyEWL9PV0oJecKVfMoVis8HyJC2tgPJlQ4RGS+sBC6nK5UKGCkh+SM2bdQKmUVdeIB0TEC/K7iJsLFinTk3Kc162SUOIzzt9yPrZ++Dqs2XQBuuMWC5Aaoz38NSvZy2ZFIVZL8iw+glrPPPksXnx+N0a6OhBkvLqJ/9lSFeNc+MbuDpXsiYIgUlnVErF2klaNsai67KzswgY8VqiJMqXUvPKW5EeuGXqtd5ZJk8QjLTlVobrTpRQZ6OrHNXfuxAXnnItYz9DytaqySw60pMHElSRvyb6fjyI9dRxdnXGY1QoqgkJELEGuMLHeTWurokhaMraUxigpfI4vDPB8JByF3+GAiwkd4XfNzlCiwuIRrVFVudLyiITVSYVq9ISACvOu6Zmq7uC7ed4Twu33fQYbN21GKNILO8NcpwO0T9/8PjMti2sWQlFkamkCE+PTKl+Kx5PQK3QxC9iJmRMwnE70M+mjAUvbFPNBJEQiOTk/gxkGdY11QtBrw9CA+u3I8WNYEeb1mhsOUpYIoTlDbibJrqKhGaotZcqs8iKijIh4SaUSkUuK6P27HsT6d54PO1PQbwvLaWj3XXa+uWJVD5aGVuGsMy/C3NwU9h48iqO/+rl6iCiyf2ySsV/HZdfehK52B448+1Osjrkxz5AqZVKYzxXVIkuETjBkaqYdDdRx5vpN6hlLi/NMypJVyYl4TiKdVHJRoNJsnho0VksERUmjlSJV5o6dkSAiXslm8/jcX38FH7jqBkgj5iILkE/tX760zZT+QGi0NDvS3R1nAo7u26tu/s5X/xajU/PqWBR574YBvPjz3dDyvG5sQlkqU2uQ3Glo2G2qljhY0b3BKAY7O1V+pPLMn2IadnrTxn8iHiJTMWsx14pRU0VQlBGvSAF0M7+dDK1WoosyOZ6v0Hi3/ukDuPEPbl5WRJ6hHf3RN81Wx+YLB5HmzYVcFcmFE+oln7ztFhRGpxFikq9bvRobwt2oRnVUFhdwfHoBCXrDZmdxjHZCY0KWiUZpJr18lqlgmOTSxbALk24IfW/RfHl2o5xBskDU4qfAd7aZJ6JIyyOtMNOZYyLTzMO77r4PN27fvuxBpcjikV+a0nJKnInoTq9qsmy0rkGm+dFL34WXD+xDf08nLjnrbHjyTVRxkfFmMhgjbXEx+cEiKBSkQQXikSBiZL4lEkpvs3bYmJANIqEgXIZJLovVeI9AbjaTVO8WjxQMG+tSXUG8cDEhj52kOALXXobRoYUktu38E6VIK7SUIr9t+DA7ewK3XX+Vekmo0kCklCZStGHl2j6Qr6GesdBOFJpOpEgdEqi5WO0rWUTDMfTEIuwGA+qadEGgtYh6E3JFmYrG+sJcSDLPJLTK/F9lD1Qk4uT5+zpCfpihmcxmEKRSfnplMZvDFZ/Zies+/unXeuS3KfLyMz/GPz38MMpL4xidnFA3rmc7apJ5pgsJVbHDZANRThfGTkypl7S197K6F2ndPNEtjHBHB+yhLrJgGR7klCIaE8skfZ9nLSqRKGazRQUUMt5xMj/FWwIMa8gk5Pg9W85FcnKKDdSSWkPvBe/FLfc/8N9T5NXRo/jWbdtQycypan10MUmLNTBCGI36PNgzncRsoYwunxuhYBhmLgNPiJS7fxA10vqDs5PopjWHevsQ7eeAgd3nwvgY8lx03V6HiwWzwloymykq1iuKaPSOUBGDdaaVI1JLNg8P0jgmqc88BnvWomBr4LZHn1SKeJpDjzcNra/u2I49T34H3bSol33HnqPjULBICTtsXEiAqBRny9Egpa4yt3T0xjuEbMGmVRSRHGPRHOG5+NAaLpYc68QhFYZKCMFMLkX/0ySaFYMdJxdoMrzSBAklVKyTSLo64lY59+IxGofNVsUVwvvueIjIGGLnaCLgd7xxjsi458Z3nod6Yk4pIq3pkZl51aqWGzYMxvykH05E2KeIlHIl6KQ4HQwzp5tkk4TQIL0fJaq52bWv6VmFgs+O7NwkKvRWgi/3+T2qMRNFFhiiJnt9zWg2VxwnSR3SiYZtwQ4MBTR0BbpxZGma1IY1q2clznv/3W8cWoIAuaypXDUxcwA7Lt+qEizW3qluGE+XkCHCCJxaGC+IEkJX3wjrRBrziXmEiFB+Jrdu8yoEk1ZXasXggMWJ0nOzMMs1ZDTL4hGS0JkFUhqSxzIT//WKZHnZSq5npL+TYSVhp2M2t4QNF12JkUuuQzE3x4IYJ1tuzrWkOmYmprF/rgAfuczsoefwhe2fQL/fpdAnR0hMcdJn6k4M+By0igZ/kEzYx56AtSdC9xc47qkuZpk3iWVLZUnvBV6lhrilxtAbWnPiklYtrgsZPjeX42zLbVfJrvKDIi1zgjm4iV4ejLcpRFwiokmtuXrHQxhZ1auuM+teBMNOaAsL0pyCPIqLmF1EV1c7ntuzG9+9+yNoC3kRC3dYWM9wCJH0NZovijh9sLN6i+iFDHIS88UiiaQdQSZyllaW/ClprAm8P854lh5eErw1pJAmSwy0yAIsoXSqiDeEIXSz5wlJTnI0+urcAjZfvBW3fP4v2Mvk0RazmiunTtK49xfTy7Qzx2IXi7qUIl//9LVYR0voTMgSeVSZiCHFysGFrWaobB7cgPWXngNPs5hNTp3AzNET2MvJo9tj43/eQ9qiQop1Is58qtIbxXyDjNnqAIXeJNMpFbLiDRHxiHhDRPhYH5Ncwj1JmiMDiy8+8l2c/pYzX1MM5VrtH3641/SymosUWcnleGLyeXztrp0KlSTRK0zeUobowjecf+ZmbL/5ak7VvUj7h5E++hK6hnphpmYYnktYyp/Aq0tOTBzeh/lUAS6txnpBjzCf9CbCCZWhv1QdEiqT5TioYDjgIQSLElLV27x+DNOQyuL8f2hmChu2XIoHH3v8NZ5rfdF+sf+wWcnRjbo17bZ7fDDzE/jjm29CJ5Oo5GDyCg8ikhU4UPvDD38UmzaO4NcvH8Y8i2B6YRZru1cDQRe61w4jxnDMVd04spjGL597CqmZGfWuobYwLS/WrhHO3ajni1igcZj9VKShqrnyCKG3SAiO+f04Z2gQ6WQBR5IzODxfwK133o57Pr/rN7yhPJLP50yzZlMV1mZjRW542U8kcMMVV7CwLRCZOtiZlbG4sAgHlbzq8stxfL6IxcMvkLFbUekyrEX4OCoqSjOU5diHi/AQbuV7GxcZ7QiSGZ80plyTMbOqgmfoMQ67rKggFRKhbuxbrOtlfDSfLuOe+/4ct+745Bsr8mYU5eZrPoBjv9yNwd4eVl9roSXGb1cghGQsjn6vHXnmhZcoMra0oH4PsVBFAySCTWU8riq3ANgdMl+ChOaMQRpPFi2hI7AsA4gMKYu0sC0lDBJGkbpmh53jVF22FyiiyOPffATv/th1J63RPFL9yJsp8sXPbMOT334Cpw/2qRhP8+UyBvLoQRyq5dBP60cNhgq9Iotfz95DZKaaR+rEDJYMtzovqCXjUsmLEhmASKXOSQvpf61UUGgleWFwMWJ5AYCWAhGXREoDKTqrxnD7mye+gy3nvk3dK9IgApY4RRF5U0X+7el/xnZOK84ZXoE0n55mhye5UuKLNq3ZgIsvuQhtXT0o+rxY+vUBJP9zDw4cP8qaI/Ncu+JSfp8T05m8RdeFT0m/7vGgzg2iNNtZk+CiEIph1cqNlie8HHR4CLuiiECxKHfHrgcwNNgJI8kmLGiFdYEDvywHfG+qyNJSCR/53Yug5zm0DkfUQpSLOcK/4vpPoZNjgfTkOMIkifI5tu8XmGVimiiwUPq4p+JHg4Ps0Tz7faLtDK0oWCUiKCXekL7jjZSQa0QRGb1KlRNFPASI97BIez0BBGkoj2aDveFETicdIl1SyS4TcNoHJl1VoQXEZWEOG+7d9VnseeKHGCGdTufsWL1uBfdPKOmTU5dIWy/39xLYO/qK2jLrjnaogbYokWD31+B+iITLGDmVEW5nY5ZBJskevlnwWnNguabO3HILqok3WrMsEtV0mevpHcCVO2+BlyPYSHPfMGD3oeDROM6wQfvxvz5lVhpZ5aKWFDgRbzDZkpNjeOIbj6ne22Qhy1QyWNGcUeU4AgrY2RaTe5UqTnRyctdDlmpUWWW1HGboCSmIkhvSs89TASGaFRa+DItgKyda72wNHIXDiQdbilQ4fBgj9F527eW47JqrycuqCHAuJqJ7nAhUasi5yH4/ePUlZrVewFzSgr/+jjDiZ521rNShp5+BbXoJEXKrcaJXObVAmLZGQU4Ouzs4TZQepL83pjpGoekpKpFqVnWxfIE7VQkmusy48pxCprg33iCky6BO5lsiArciArkSUga94yT7zbAXkmfc+aVdWDEygFSxhAj3NJV4rHDPmNz/7OloX6YoHhaznkHSj0vPQyDGPoRunJ+bwQuP/D1WsMonWMAquaTqGUSkDQ3qbLQiAYQ59QvROjP5RdJymYYw/DnFEqQ6ccquVYqFsEzveOidEr0jCogybk5Y1Np43s1Ab8ksu8ie04dw+933wshbMK2TzIYYerrsx+RzmJdkX7lqYFmRzr5OnL31HeritSNr1WeIFfYHX38Q9qkkKgE7jPnE8jxKRv4hzp56+zrYn/cQCLhHQl4lophvE6kW81nF2fKFghreiTdeL6cWQPGInYhVZ75O0ygb1m3E793KOVbBgl2v18lN2TA3lDjNYQmYnV/gHuK2jypFgnVW8f71nO+CrekQdE4Zw2JVfv5q939g9KlnFLUouerwVDiAYwusHupuQ3t/L13OFnYpSTrO2bD0IVRCCqMM54rME5EalTxVCVk8+aXyinxKbiiviLVZaAWxahwMsgvDlbfcAJ0TFZFAKIAVrGNO1qM59jdpekW78ws7zUVW2Tb2E4a/CzZeFO5o43D65AA4wRh/5ftPW25t7uYGm8Nmr8sH1ynDZOFec0xuqRkCs3OMaRf31Ss5jkil6JGvtcTFYlnhVFJEjqWKd9IQ4gkRyZMsF5ri17eQvm+56mJ1XlCrPxpTW+giKrRu/MRWM1u0NnhE/F7uxq4aRDwUWT4nRezlp55Edt+xk1YjtXbzRborhlhXFL2eOF5JTKDA4UKSOSHhVC4XifGcyNNyBfblkgutpH69EvIygV0ZBOocssk+i0iJ8LvA/fuOoXXY9smPM1o6YGNu+VtepjISXtp5552rQqvOP4so5P0YOG0Aq7esUcneEkn6zMQUvr/rL9HPDSCNL/RTCZkwujQf0qckZ4ZZnpItteaAuvWM13tDzks4tbiVeEMoicBvyyMSWlJnVP70reaffkRx5Ye3op15ayejkBxplQ3tonf+jqUIh2ciA2vWonOoGytH1rMPaGIiz/eTLP7708/j7x56EBF6rSWsr4rei5gcJmiy2cMthpYU6ZlTRbwisCvSQqtWbgi5lHmvSF56lKYiWe6xr9q4efkxH7/l2uVjH9vvCXpI27Hj5mXUcjrYi3RHFQWQhef9XlV8pAhJ4osF7r/jsxjjsK61GHliCzrl2Mt1WH/dQms2FdRc/KMYTj+ypBQRh6W0WF5Ewa3aY7eG1i3JCq9rjp8ktNZyi7pnIIgnf/BTXPH7W3HW+WdypuxVNclkTml/fNcdZrVWUPcnmXBxu1BxbqC0nfSGWiAh79ndL3LTJ4OX91pbDrK4lrSUqdE6zd205d9aisg18ntLCekCpXUWBWTrzemgp2Q/nuEpHhFJyL4kDbLx7e/ln5AM4PHHvo0QW4iVIxtx4YVn8G/BVqBOo/8XqehiAyf11hAAAAAASUVORK5CYII='>";
			});
			
			return message;
		}

		function atag(s) {
			return '<a href="' + s + '">' + s + '</a>';
		}

		function clink($1) {
			return ChannelLink(sys.channel($1));
		}

		ChannelLink = function (channel) {
			if (sys.channelId(channel) == undefined) {
				return "";
			}

			return "<a href='po:join/" + channel + "'>#" + channel + "</a>";
		}

		addChannelLinks = function (line2) {
			var line = line2;
			var pos = 0;
			pos = line.indexOf('#', pos);
			var longestName = "",
				longestChannelName = "",
				html = "",
				channelName = "",
				res;
			while (pos != -1) {
				++pos;
				ChannelNames.forEach(function (name) {
					channelName = String(line.midRef(pos, name.length));
					res = channelName.toLowerCase() == name.toLowerCase();
					if (res && longestName.length < channelName.length) {
						longestName = name;
						longestChannelName = channelName;
					}
				});
				if (longestName !== "") {
					html = "<a href=\"po:join/%1\">#%2</a>".format(longestName, longestChannelName);
					line = line.replaceBetween(pos - 1, longestName.length + 1, html);
					pos += html.length - 1;
					longestName = "";
					longestChannelName = "";
				}
				pos = line.indexOf('#', pos);
			}
			return line;
		}

		function atag(s) {
			return '<a href="' + s + '">' + s + '</a>';
		}

		function formatLinks(message) {
			return message.replace(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/gi, '$1');
		}

		format = function (src, str) {
			if (typeof str != "string") {
				str = String(str);
			}

			var auth = sys.maxAuth(sys.ip(src));
			if (src == 0) {
				auth = 3;
			}

			str = str.replace(/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>');
			str = str.replace(/\[s\](.*?)\[\/s\]/gi, '<s>$1</s>');
			str = str.replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>');
			str = str.replace(/\[i\](.*?)\[\/i\]/gi, '<i>$1</i>');
			str = str.replace(/\[sub\](.*?)\[\/sub\]/gi, '<sub>$1</sub>');
			str = str.replace(/\[sup\](.*?)\[\/sup\]/gi, '<sup>$1</sup>');
			str = str.replace(/\[sub\](.*?)\[\/sub\]/gi, '<sub>$1</sub>');
			str = str.replace(/\[code\](.*?)\[\/code\]/gi, '<code>$1</code>');
			str = str.replace(/\[link\](.*?)\[\/link\]/gi, '<a href="$1">$1</a>');
			str = str.replace(/\[servername\]/gi, "Viper's Pit".bold());
			str = str.replace(/\[spoiler\](.*?)\[\/spoiler\]/gi, '<a style="color: black; background-color:black;">$1</a>');
			str = str.replace(/\[time\]/gi, "<timestamp/>");
			if (auth != 3 && !htmlchatoff) {
				str = str.replace(/[a-z]{3,}:\/\/[^ ]+/i, atag);
			}
			str = str.replace(/\[color=(.*?)\](.*?)\[\/color\]/gi, '<font color=$1>$2</font>')
			str = str.replace(/\[face=(.*?)\](.*?)\[\/face\]/gi, '<font face=$1>$2</font>');
			str = str.replace(/\[font=(.*?)\](.*?)\[\/font\]/gi, '<font face=$1>$2</font>');

			if (auth > 0) {
				str = str.replace(/\[size=([0-9]{1,})\](.*?)\[\/size\]/gi, '<font size=$1>$2</font>')
				str = str.replace(/\[pre\](.*?)\[\/pre\]/gi, '<pre>$1</pre>');
				str = str.replace(/\[ping\]/gi, "<ping/>");
				str = str.replace(/\[br\]/gi, "<br/>");
				str = str.replace(/\[hr\]/gi, "<hr/>");
			}

			str = addChannelLinks(str); // do this late for other bbcodes to work properly
			return str;
		}

		firstGen = function (poke) {
			if (poke < 152) {
				return sys.rand(1, 6);
			} else if (poke < 252) {
				return sys.rand(2, 6);
			} else if (poke < 387) {
				return sys.rand(3, 6);
			} else if (poke < 494) {
				return sys.rand(4, 6);
			}

			return 5;
		}

		randPoke = function () {
			return "<img src='pokemon:num=" + sys.rand(1, 649) + (sys.rand(1, 100) == 50 ? '&shiny=true:' : '') + "'>";
		}

		formatPoke = function (pokenum, shine, backsprite, gendar, gan) {
			if (!pokenum || pokenum < 1 || isNaN(pokenum)) {
				if (sys.pokeNum(pokenum) == undefined) {
					return "<img src='pokemon:0'>";
				} else {
					pokenum = sys.pokeNum(pokenum);
				}
			}

			var shiny = false,
				back = false,
				gender = "neutral";

			if (shine) shiny = true;

			if (backsprite) back = true;

			if (gendar) {
				gendar = Number(gendar);
				if ((gendar == 0 || gendar == 1 || gendar == 2)) {
					gender = {
						0: "neutral",
						1: "male",
						2: "female"
					}[gendar];
				}
			}
			return "<img src='pokemon:" + pokenum + "&shiny=" + shiny + "&back=" + back + "&gender=" + gender + "&gen=" + gan + "'>";
		}

		if (typeof teamSpammers == 'undefined') {
			teamSpammers = {};
		}
		if (typeof reconnectTrolls == 'undefined') {
			reconnectTrolls = {};
		}
	},
	beforeNewMessage: function (message) {
		var m = "Script Warning in sys.teamP";
		if (message.substr(0, m.length) == m) {
			sys.stopEvent();
			return;
		}
	},
	afterNewMessage: function (message) {
		if (message.substr(0, 33) == "The name of the server changed to") {
			servername = message.substring(34, message.lastIndexOf("."));
			return;
		}
		if (message == "Script Check: OK") {
			serverowner = "HHT";
			sys.sendHtmlAll("<b><i><font color=Blue><font size=4>+ScriptBot:</font></b><b><i><font color=Black><font size=4> Server Owner " + serverowner + " has updated the scripts!</font></b></i>");
			script.init();
			return;
		}
	},

	beforeChannelJoin: function (src, channel) {
		var user = SESSION.users(src);
		if (channel == staffchannel && !user.megauser && getAuth(src) < 1 || channel == watch && getAuth(src) < 1) {
			guard.sendMessage(src, "HEY! GET AWAY FROM THERE!", 0);
			watchbot.sendAll(sys.name(src) + "(IP: " + sys.ip(src) + ") tried to join " + sys.channel(channel) + "!", watch);
			sys.stopEvent();
			return;
		}
	},

	beforeChannelDestroyed: function (channel) {
		if (channel == staffchannel || channel == league || channel == watch || channel == android) {
			sys.stopEvent();
			return;
		}
		var cname = sys.channel(channel);
		ChannelNames.splice(ChannelNames.indexOf(cname), 1);
	},
	megauserCheck: function (src) {
		SESSION.users(src).megauser = sys.name(src).toLowerCase() in MegaUsers;
	},

	afterChannelCreated: function (chan, name, src) {
		ChannelNames.push(name);
	},

	afterChannelJoin: function (src, chan) {
		var channelToLower = sys.channel(chan).toLowerCase();
		var topic = (Channeltopics[channelToLower] !== undefined) ? Channeltopics[channelToLower] : "No channel topic has been set.";
		if (chan !== 0 && chan !== android) {
			topicbot.sendMessage(src, topic.topic, chan);
		}
		if (chan == android) {
			topicbot.sendMessage(src, "This is the Android user channel. Feel free to chat and battle with other android users. Click <a href='http://code.google.com/p/pokemon-online-android/wiki/TeamLoadTutorial'>here</a> to learn how to import a team.", chan);
		}
		if (chan != 0 && chan !== android) {
			watchbot.sendAll(sys.name(src) + "(IP: " + sys.ip(src) + ") has joined " + sys.channel(chan) + "!", watch);
		}
	},

	beforeLogIn: function (src) {
		// RangeBans - In Order: HotSpot Shield, Anime Oblivion Advertisers, Swizz, EDOGAWD, Swizz again, Moonlight //
		if (sys.ip(src).substr(0, 6) == "74.115" || sys.ip(src).substr(0, 4) == "151." || sys.ip(src).substr(0, 6) == "74.177" || sys.ip(src).substr(0, 7) == "197.216" || sys.ip(src).substr(0, 6) == "78.129" || sys.ip(src).substr(0, 7) == "174.14174.141") {
			watchbot.sendAll("A noob who was rangebanned tried to log in and got kicked! (IP: " + sys.ip(src) + ")", watch);
			sys.kick(src);
			return;
		}
		var srcip = sys.ip(src);
		if (reconnectTrolls[srcip] != undefined) {
			sys.stopEvent();
			return;
		}

		pruneTempbans();

		var poUser = SESSION.users(src),
			cu_rb, t_n = sys.time() * 1;
		if (typeof Tempbans[srcip] !== "undefined") {
			if (sys.auth(src) > 2) return;
			poUser.autokick = true;
			bot.sendMessage(src, "You are tempbanned! Remaining time: " + getTimeString(Tempbans[srcip].time - t_n), 0);
			sys.stopEvent();
			watchbot.sendAll("Tempbanned IP [" + sys.ip(src) + "] tried to log in.", watch);
			return;
		}

		for (var x in Rangebans) {
			if (x == srcip.substr(0, x.length)) {
				if (sys.auth(src) > 2) return;
				poUser.autokick = true;
				bot.sendMessage(src, "You are rangebanned!", 0);
				//bot.sendMessage(src, "You are rangebanned! Remaining time: " + getTimeString(Tempbans[srcip].time - t_n), 0);
				sys.stopEvent();
				watchbot.sendAll("Rangebanned IP [" + sys.ip(src) + "] tried to log in.", watch);
			}
		}

		if (sys.name(src) == "HHT" || sys.name(src) == "Warm Fusion") {
			var ip = sys.ip(src)
			var sip = ip.substr(0, 9)
			if (sip != "74.77.226" && ip != "127.0.0.1") {
				sys.stopEvent();
				poUser.autokick = true;
			}
		}
	},
	afterLogIn: function (src) {
		//sys.setAnnouncement("<center> <table width='560' height='161' style='background-image: url(Themes/Classic/Teambuilder/PokeDex/OMGHUGE.png);'> <tr> <td width='119' style='padding-top: 30px;'> <center> " + randPoke() + " </center> </td> <td width='308' style='padding-top: 12px;'> <center> <table width='304' height='45' style='background-image: url(Themes/Classic/BattleWindow/NewPokeBar.png);'> <tr> <td align='center' width='304' style='padding-top: 10px; padding-bottom: 10px;'> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> <font size='5'>W</font><font size='3'>ELCOME</font> <font size='5'>T</font><font size='3'>O</font> <font size='5'>V</font><font size='3'>IPER'S</font> <font size='5'>P</font><font size='3'>IT</font> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> </td> </tr> </table> <table width='308'> <tr> <td width='154'> <font color='darkblue'> <b> <font size='4'>F</font><font size='3'>ORUMS:</font> <a href='http://viperspit.freeforums.org/index.php'>click here</a> </b> </font> </td> <td width='154' dir='rtl'> <font color='darkblue'> <b> <font size='4'>C</font><font size='3'>LANS:</font> <a href='http://viperspit.freeforums.org/clan-section-f23.html'>click here</a></font> </b> </font> </td> </tr> </table> <table width='308'> <tr> <td width='100%'> <center> <div style='margin-bottom: 4px;'> <font color='darkgreen' size='4'> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> <b>Battle against the Viper's League!</b> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> </font> </div> <div style='margin-bottom: 4px;'> <font color='darkred' size='4'> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> <b>Type /commands for commands.</b> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> </font> </div> <div> <font color='darkblue' size='4'> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> <b>Type /rules for the rules.</b> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> </font> </div> </center> </td> </tr> </table> </center> </td> <td width='119' style='padding-top: 30px;'> <center> " + randPoke() + " </center> </td> </tr> </table> </center>", src);
		var poUser = SESSION.users(src),
			myName = sys.name(src),
			ip = sys.ip(src),
			myAuth = getAuth(src);

		poUser.originalName = sys.name(src);

		if (Autoidle[myName.toLowerCase()] != undefined) {
			sys.changeAway(src, true);
		}

		if (myAuth > 0) {
			sys.putInChannel(src, watch);
			sys.putInChannel(src, staffchannel);
		}
		
		sys.sendHtmlMessage(src, "<font color=Red><timestamp/><b>+ForumBot: </font></b> Join the Viper's Pit forums <a href='http://viperspit.freeforums.org'>here</a>.", 0);
		sys.sendHtmlMessage(src, "<font color=Black><timestamp/><b>+CommandBot: </font></b>Type /commands to see the commands!", 0);
		sys.sendHtmlMessage(src, "<font color=Blue><timestamp/><b>+RuleBot: </font></b>Type /rules to see the rules!", 0);
		sys.sendHtmlMessage(src, "<font color=Green><timestamp/><b>+LeagueBot: </font></b>Type /league to view the league! ", 0);
		sys.sendHtmlMessage(src, "<font color=CornFlowerBlue><timestamp/><b>+PlayersBot: </b></font>Number of players online is " + String(sys.numPlayers()).bold() + "!", 0);
		var MOTD = Reg.get("MOTD");
		if (MOTD !== "") {
			sys.sendHtmlMessage(src, "<font color=red><timestamp/><b>Message of the Day: </font></b>" + MOTD, 0);
		}

		if (sys.numPlayers() < 30 && Welmsgs[sys.name(src).toLowerCase()] == undefined) {
			vplogin(sys.name(src), namecolor(src));
		}
		if (Welmsgs[sys.name(src).toLowerCase()] != undefined) {
			var theirmessage = Welmsgs[sys.name(src).toLowerCase()];
				var msg = (theirmessage !== undefined) ? theirmessage.message : vplogin(sys.name(src), namecolor(src));
				if (theirmessage != undefined) msg = msg.replace(/{server}/gi, Reg.get("servername"));
				sys.sendHtmlAll(msg, 0);
			}
			
		pruneMutes();
		if (Mutes[ip] != undefined) {
			var myMute = Mutes[ip],
				muteStr = myMute.time != 0 ? getTimeString(myMute.time - sys.time() * 1) : "forever";
			poUser.muted = true;
			bot.sendMessage(src, "You are muted for " + muteStr + ". By: " + myMute.by + ". Reason: " + myMute.reason, 0);
		}

		var swiftswim = false,
			drizzle = false,
			isIllegalCombo = false,
			current_poke_abil;
		if (getTier(src) == "5th Gen OU") {
			for (var i = 0; i < 6; i++) {
				current_poke_abil = sys.teamPokeAbility(src, i);
				if (current_poke_abil === 2) {
					swiftswim = true;
				}
				if (current_poke_abil === 33) {
					drizzle = true;
				}

				if (drizzle && swiftswim) {
					isIllegalCombo = false;
					break;
				}
			}
			if (isIllegalCombo) {
				bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
				sys.changeTier(src, "5th Gen Ubers");
			}
		}

		script.megauserCheck(src);

		if (tourmode == 1) {
			sys.sendMessage(src, "", 0);
			sys.sendHtmlMessage(src, border, 0);
			sys.sendHtmlMessage(src, "<font color=blue><timestamp/><b>±±± A " + tourtier + " tournament is in signup phase, " + script.tourSpots() + " space(s) are left! ±±±</font></b><br><font color=red><timestamp/><b>Type <font color=black>/join</font> to join!</font></b>", 0);
			sys.sendHtmlMessage(src, border, 0);
			sys.sendMessage(src, "", 0);
		} else if (tourmode == 2) {
			sys.sendMessage(src, "", 0);
			sys.sendHtmlMessage(src, border, 0);
			sys.sendHtmlMessage(src, "<font color=blue><timestamp/><b>±±± A tournament (" + tourtier + ") is currently running. ±±±</font></b>", 0);
			sys.sendHtmlMessage(src, border, 0);
			sys.sendMessage(src, "", 0);
		}

		var tier = getTier(src, "5th Gen OU");
		if (tier) {
			script.dreamAbilityCheck(src);
		}
	},

	step: function () {
		if (typeof stepCounter == 'undefined') {
			stepCounter = 0;
		}

		stepCounter++;
		if (stepCounter % 5 == 0 && sys.numPlayers() > 0) {
			//sys.setAnnouncement("<center> <table width='560' height='161' style='background-image: url(Themes/Classic/Teambuilder/PokeDex/OMGHUGE.png);'> <tr> <td width='119' style='padding-top: 30px;'> <center> " + randPoke() + " </center> </td> <td width='308' style='padding-top: 12px;'> <center> <table width='304' height='45' style='background-image: url(Themes/Classic/BattleWindow/NewPokeBar.png);'> <tr> <td align='center' width='304' style='padding-top: 10px; padding-bottom: 10px;'> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> <font size='5'>W</font><font size='3'>ELCOME</font> <font size='5'>T</font><font size='3'>O</font> <font size='5'>V</font><font size='3'>IPER'S</font> <font size='5'>P</font><font size='3'>IT</font> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> </td> </tr> </table> <table width='308'> <tr> <td width='154'> <font color='darkblue'> <b> <font size='4'>F</font><font size='3'>ORUMS:</font> <a href='http://viperspit.freeforums.org/index.php'>click here</a> </b> </font> </td> <td width='154' dir='rtl'> <font color='darkblue'> <b> <font size='4'>C</font><font size='3'>LANS:</font> <a href='http://viperspit.freeforums.org/clan-section-f23.html'>click here</a></font> </b> </font> </td> </tr> </table> <table width='308'> <tr> <td width='100%'> <center> <div style='margin-bottom: 4px;'> <font color='darkgreen' size='4'> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> <b>Battle against the Viper's League!</b> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> </font> </div> <div style='margin-bottom: 4px;'> <font color='darkred' size='4'> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> <b>Type /commands for commands.</b> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> </font> </div> <div> <font color='darkblue' size='4'> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> <b>Type /rules for the rules.</b> <img src='Themes/Classic/Teambuilder/check-icons/radio-checked.png'> </font> </div> </center> </td> </tr> </table> </center> </td> <td width='119' style='padding-top: 30px;'> <center> " + randPoke() + " </center> </td> </tr> </table> </center>");
		}
	},

	beforeChangeTier: function (src, oldtier, newtier) {
		var swiftswim = false,
			drizzle = false,
			isIllegalCombo = false,
			current_poke_abil, teamNum;
		if (newtier == "5th Gen OU") {
			for (var i = 0; i < 6; i++) {
				current_poke_abil = sys.teamPokeAbility(src, i, i);
				if (current_poke_abil === 2) {
					swiftswim = true;
				}
				if (current_poke_abil === 33) {
					drizzle = true;
				}

				if (drizzle && swiftswim) {
					isIllegalCombo = false;
					teamNum = i;
					break;
				}
			}
			if (isIllegalCombo) {
				bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
				sys.changeTier(src, teamNum, "5th Gen Ubers");
				sys.stopEvent();
			}
		}
	},
	beforeChangeTier: function (src, oldtier, newtier) {
		if (newtier == "5th Gen OU") {
			if (script.dreamAbilityCheck(src)) {
				sys.stopEvent();
			}
		}
	},

	beforeChatMessage: function (src, message, chan) {
		if (getAuth(src) < 1 && message.length > 600) {
			sys.stopEvent();
			bot.sendMessage(src, "Sorry, your message has exceeded the 600 character limit.",chan);
			watchbot.sendAll(" User, "+sys.name(src)+", has tried to post a message that exceeds the 600 character limit. Take action if need be. <ping/>",watch);
			return;
		}
		if (sys.name(src) == "Ian" && message == "OK!") {
			sys.stopEvent();
			sys.sendHtmlAll("<timestamp/> <b>Ian Check: </b><font color=green>OK!</font>", chan);
			return;
		}
		if (message == "<3") {
			sys.stopEvent();
			sys.sendAll(sys.name(src)+": <3",chan);
			watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
			return;
		}
		if (message == ">_<") {
			sys.stopEvent();
			sys.sendAll(sys.name(src) + ": >_<", chan);
			watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
			return;
		}
		var poUser = SESSION.users(src),
			isMuted = poUser.muted,
			originalName = poUser.originalName,
			isLManager = Leaguemanager == originalName.toLowerCase(),
			myAuth = getAuth(src);

		if (/\u2061|\u2062|\u2063|\u2064|\u200B|\xAD/.test(message)) {
			if (sys.auth(src) == 0) {
				watchbot.sendAll(html_escape(sys.name(src)) + " tried to post a bad code. Killed it.", watch);
				kick(src);
			}
			sys.stopEvent();
			return;
		}
		if (myAuth < 2 && isMuted) {
			pruneMutes();
			if (Mutes[sys.ip(src)] == undefined) {
				poUser.muted = false;
			} else {
				sys.stopEvent();
				var myMute = Mutes[sys.ip(src)],
					muteStr = myMute.time != 0 ? getTimeString(myMute.time - sys.time() * 1) : "forever";
				bot.sendMessage(src, "Shut up! You are muted for " + muteStr + "! By: " + myMute.by + ". Reason: " + myMute.reason, chan);
				watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Muted Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
				script.afterChatMessage(src, message, chan);
				return;
			}
		}


		if (myAuth < 1 && muteall) {
			sys.stopEvent();
			bot.sendMessage(src, "Shut up! Silence is on!", chan);
			watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Silence Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
			script.afterChatMessage(src, message, chan);
			return;
		}
		if (myAuth < 2 && supersilence) {
			sys.stopEvent();
			bot.sendMessage(src, "Shut up! Super Silence is on!", chan);
			watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Silence Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
			script.afterChatMessage(src, message, chan);
			return;
		}
		if (message.indexOf(/[\u202E\u202D]/) != -1) {
			bot.sendMessage(src, 'WHY DID YOU TRY TO POST THAT, YOU NOOB?!', chan)
			watchbot.sendAll(html_escape(sys.name(src)) + ' TRIED TO POST A BAD CODE! KILL IT! <ping/>', watch);
			sys.stopEvent();
			script.afterChatMessage(src, message, chan);
			return;
		}
		if (message.indexOf(/[\u0300-\u036F]/) != -1) {
			watchbot.sendAll(html_escape(sys.name(src)) + " TRIED TO POST ZALGO AND GOT KICKED! </ping>", watch);
			kick(src);
			script.afterChatMessage(src, message, chan);
			return;
		}
		if (message.indexOf(/[\u0430-\u044f\u2000-\u200d]/) != -1) {
			bot.sendMessage(src, "DON'T USE UNICODE, YOU NOOB!", chan);
			watchbot.sendAll(html_escape(sys.name(src)) + ' TRIED TO USE UNICODE!! </ping>', Watch);
			sys.stopEvent();
			script.afterChatMessage(src, message, chan);
			return;
		}
		if (message.indexOf("&#8") != -1) {
			bot.sendMessage(src, "WHAT ARE YOU DOING?!", chan);
			watchbot.sendAll(html_escape(sys.name(src)) + " tried to mess up the chat! <ping/>", watch);
			sys.stopEvent();
			script.afterChatMessage(src, message, chan);
			return;
		}

		if (myAuth <= 0) {
			var i, msgtolower = message.toLowerCase();
			for (i in Bannedwords) {
				if (msgtolower.indexOf(i) > -1) {
					sys.stopEvent();
					sys.sendMessage(src, sys.name(src) + ": " + message, chan);
					return;
				}
			}
		}

		if ((message[0] == '/' || message[0] == '!') && message.length > 1) {
			print("[#" + sys.channel(chan) + "] Command -- " + sys.name(src) + ": " + message);
			sys.stopEvent();
			var command;
			var commandData;
			var pos = message.indexOf(' ');
			if (pos != -1) {
				command = message.substring(1, pos).toLowerCase();
				commandData = message.substr(pos + 1);
			} else {
				command = message.substr(1).toLowerCase();
			}
			var tar = sys.id(commandData);
			
			if (command !== "sendto") watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Command -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);

			if (command == "webcall" || command == "scriptchange" || command == "loadscript" || command == "updatescript") {
				var allowed = ['HHT', 'ian', 'ethan', 'warm fusion'];
				if (allowed.indexOf(originalName.toLowerCase()) == -1) {
					bot.sendMessage(src, 'You may not use /' + command + ', noob.', chan);
					return;
				}
				sys.sendHtmlAll('<font color=blue><timestamp/><b>+ScriptBot: </b></font>The scripts were webcalled by ' + sys.name(src) + '!', 0);
				if (commandData == undefined || commandData == "") {
					commandData = "https://raw.github.com/nameless-server/Scripts/master/scripts.js";
				}

				sys.webCall(commandData, function (resp) {
					try {
						sys.changeScript(resp);
						var oldContent = sys.getFileContent("scripts.js");
						sys.writeToFile("scripts.js", resp);
						sys.writeToFile("scripts_before_webcall.js", oldContent);
					} catch (e) {
						sys.changeScript(sys.getFileContent("scripts.js"));
						bot.sendAll("Oops! " + sys.name(src) + " made a script error! Thankfully, the script recovered itself!", 0);
						bot.sendMessage(src, "The error was " + e + " on line " + e.lineNumber, chan);
					}
				});
				return;
			}
			if (command == "updatetiers" || command == "loadtiers") {
				var allowed = ['HHT', 'ian', 'ethan', 'warm fusion'];
				if (allowed.indexOf(originalName.toLowerCase()) == -1) {
					bot.sendMessage(src, 'You may not use /' + command + ', noob.', chan);
					return;
				}
				if (commandData == undefined || commandData == "" || (commandData.substr(0, 7) != 'http://' && commandData.substr(0, 8) != 'https://')) {
					commandData = "https://raw.github.com/Ethan/vp-stuff/master/tiers.xml";
				}
				sys.sendHtmlAll('<font color=blue><timestamp/><b>+TierBot: </b></font>The tiers were webcalled by ' + sys.name(src) + '!', 0);
				sys.webCall(commandData, function (resp) {
					try {
						sys.writeToFile("tiers.xml", resp);
						// bot.sendAll("THE TIERS ARE BEING UPDATED! PREPARE FOR LAG!");
						sys.reloadTiers();
					} catch (e) {
						bot.sendMessage(src, "Error updating tiers: " + e);
						return;
					}
				});
				return;
			}
			if (command == "leaguemanager") {
				if (originalName != 'HHT') {
					bot.sendMessage(src, 'You may not do this!', chan);
					return;
				}
				bot.sendAll(sys.name(tar) + " is now the league manager!");
				Reg.save("Leaguemanager", sys.name(tar).toLowerCase());
				Leaguemanager = sys.name(tar).toLowerCase();
				return;
			}
			if (command == "commands") {
				Lists.Commands.display(src, chan);
				return;
			}
			if (command == "usercommands") {
				Lists.User.display(src, chan);
				return;
			}
			if (command == "funcommands") {
				Lists.Fun.display(src, chan);
				return;
			}
			if (command == 'tourusercommands') {
				Lists.Tour.display(src, chan);
				return;
			}
			if (command == "megausercommands") {
				if (!poUser.megauser && myAuth < 1) {
					bot.sendMessage(src, "You need to be a megauser to view these.", chan);
					return;
				}
				Lists.Megauser.display(src, chan);
				return;
			}
			if (command == "leaguemanagercommands") {
				if (!isLManager) {
					bot.sendMessage(src, 'You need to be a league manager to view these!', chan);
					return;
				}
				Lists.LeagueManager.display(src, chan);
				return;
			}
			if (command == "modcommands") {
				if (myAuth < 1) {
					sys.sendMessage(src, "You need to be a moderator or have mod perms to view these!", chan);
					return;
				}
				Lists.Mod.display(src, chan);
				return;
			}
			if (command == "admincommands") {
				if (myAuth < 2) {
					bot.sendMessage(src, "You need to be an administrator or have admin perms to view these!", chan);
					return;
				}
				Lists.Admin.display(src, chan);
				return;
			}
			if (command == "ownercommands") {
				if (myAuth < 3) {
					bot.sendMessage(src, "You need to be an owner or have owner perms to view these!", chan);
					return;
				}
				Lists.Owner.display(src, chan);
				return;
				// USER COMMANDS
			}
			if (command == "burn") {
				if (tar == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (CommandsOff.indexOf("burn") > -1) {
					bot.sendMessage(src, '/burn is off.', chan);
					return;
				}
				sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status4.png><b><font color=red><font size=3>" + html_escape(sys.name(tar)) + " was burned by " + html_escape(sys.name(src)) + " <img src=Themes/Classic/status/battle_status4.png>", chan);
				return;
			}
			if (command == "freeze") {
				if (tar == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (CommandsOff.indexOf("freeze") > -1) {
					bot.sendMessage(src, '/freeze is off.', chan);
					return;
				}
				sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status3.png><b><font color=blue><font size=3> " + html_escape(sys.name(tar)) + " was frozen by " + html_escape(sys.name(src)) + " <img src=Themes/Classic/status/battle_status3.png>", chan);
				return;
			}
			if (command == "paralyze") {
				if (tar == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (CommandsOff.indexOf("paralyze") > -1) {
					bot.sendMessage(src, '/paralyze is off.', chan);
					return;
				}
				sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status1.png><b><font color='#C9C909'><font size=3> " + html_escape(sys.name(tar)) + " was paralyzed by " + html_escape(sys.name(src)) + " <img src=Themes/Classic/status/battle_status1.png>", chan);
				return;
			}
			if (command == "poison") {
				if (tar == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (CommandsOff.indexOf("poison") > -1) {
					bot.sendMessage(src, '/poison is off.', chan);
					return;
				}
				sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status5.png><b><font color=Purple><font size=3> " + html_escape(sys.name(tar)) + " was poisoned by " + html_escape(sys.name(src)) + " <img src=Themes/Classic/status/battle_status5.png>", chan);
				return;
			}
			if (command == "cure") {
				if (tar == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (CommandsOff.indexOf("cure") > -1) {
					bot.sendMessage(src, '/cure is off.', chan);
					return;
				}
				sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status2.png><b><font color=Black><font size=3> " + html_escape(sys.name(tar)) + " was put to sleep and cured of all status problems by " + html_escape(sys.name(src)) + " <img src=Themes/Classic/status/battle_status2.png>", chan);
				return;
			}
			if (command == "facepalm") {
				if (CommandsOff.indexOf("facepalm") > -1) {
					bot.sendMessage(src, '/facepalm is off.', chan);
					return;
				}
				sys.sendHtmlAll("<font color=blue><timestamp/><b>+FacePalmBot:</font><b><font color=" + namecolor(src) + "> " + html_escape(sys.name(src)) + "</font></b> facepalmed!", chan);
				return;
			}
			if (command == 'league') {
				var League = new CommandList("<font color=red>Viper's <font color=black>League</font>", "navy", "");
				League.template += "<h2><font color=green>~~Gyms~~</font></h2><ol>";

				var Gym1 = Reg.get("Gym1"),
					Gym2 = Reg.get("Gym2"),
					Gym3 = Reg.get("Gym3"),
					Gym4 = Reg.get("Gym4"),
					Gym5 = Reg.get("Gym5"),
					Gym6 = Reg.get("Gym6"),
					Gym7 = Reg.get("Gym7"),
					Gym8 = Reg.get("Gym8"),
					Elite1 = Reg.get("Elite1"),
					Elite2 = Reg.get("Elite2"),
					Elite3 = Reg.get("Elite3"),
					Elite4 = Reg.get("Elite4"),
					Champ = Reg.get("Champ");

				var isEmpty = function (varn) {
					return varn == undefined || varn == "";
				}

				if (isEmpty(Gym1)) Gym1 = "Open";
				if (isEmpty(Gym2)) Gym2 = "Open";
				if (isEmpty(Gym3)) Gym3 = "Open";
				if (isEmpty(Gym4)) Gym4 = "Open";
				if (isEmpty(Gym5)) Gym5 = "Open";
				if (isEmpty(Gym6)) Gym6 = "Open";
				if (isEmpty(Gym7)) Gym7 = "Open";
				if (isEmpty(Gym8)) Gym8 = "Open";
				if (isEmpty(Elite1)) Elite1 = "Open";
				if (isEmpty(Elite2)) Elite2 = "Open";
				if (isEmpty(Elite3)) Elite3 = "Open";
				if (isEmpty(Elite4)) Elite4 = "Open";
				if (isEmpty(Champ)) Champ = "Open";

				League.add(Gym1);
				League.add(Gym2);
				League.add(Gym3);
				League.add(Gym4);
				League.add(Gym5);
				League.add(Gym6);
				League.add(Gym7);
				League.add(Gym8);

				League.template += "</ol><br><h2><font color=blue>**Elite 4**</font></h2><ol>";

				League.add(Elite1);
				League.add(Elite2);
				League.add(Elite3);
				League.add(Elite4);
				League.template += "</ol><br><h2><font color=red>±±The Champion±±</font></h2><ul><b>" + Champ + "</b></ul>";
				League.finish();
				League.display(src, chan);
				sys.sendHtmlMessage(src, '<i><b><font color=blue>Type /leaguerules to see the rules of the league!</font>');
				return;
			}
			if (command == "leaguerules") {
				Lists.LeagueRules.display(src, chan);
				return;
			}
			if (command == "superimp") {
				if (CommandsOff.indexOf("superimp") > -1) {
					bot.sendMessage(src, '/superimp is off.', chan);
					return;
				}
				if (commandData == "Server") {
					bot.sendMessage(src, "You may not superimp Server!", chan);
					return;
				}
				if (commandData.length > 20) {
					bot.sendMessage(src, "The name is " + Number(commandData.length - 20) + " characters too long.", chan);
					return;
				}

				sys.sendHtmlAll('<font color=#8A2BE2><timestamp/><b>' + html_escape(sys.name(src)) + ' has super-impersonated ' + html_escape(commandData) + '!</font></b>');
				sys.changeName(src, '~~' + commandData + '~~');
				return;
			}
			if (command == "impoff") {
				if (sys.name(src) === originalName) {
					bot.sendMessage(src, "You aren't imping!", chan);
					return;
				}

				sys.sendHtmlAll('<font color=#8A2BE2><timestamp/><b>' + originalName + ' changed their name back!</font></b>', chan);
				sys.changeName(src, originalName);
				return;
			}

			if (command == "selfkick" || command == "ghostkick" || command == "sk") {
				var xlist, c;
				var ip = sys.ip(src);
				var playerIdList = PlayerIds,
					ghosts = 0;
				for (xlist in playerIdList) {
					c = playerIdList[xlist];
					if (ip == sys.ip(c)) {
						sys.kick(c);
						ghosts++;
					}
				}
				bot.sendMessage(src, ghosts + " ghosts were kicked.", chan);
				return;
			}
			if (command == "me") {
				if (CommandsOff.indexOf("me") > -1) {
					bot.sendMessage(src, '/me is off.', chan);
					return;
				}
				if (commandData == undefined) {
					bot.sendMessage(src, "You must post a message.", chan);
					return;
				}
				var color = namecolor(src);
				var name = sys.name(src);
				sys.sendHtmlAll("<font color=" + color + "><timestamp/><b><i>*** " + html_escape(name) + " " + html_escape(commandData) + " ***</font></b></i>", chan);
				return;
			}
			if (command == "rules") {
				Lists.Rules.display(src, chan);
				return;
			}
			if (command == "scriptinfo") {
				sys.sendHtmlMessage(src, "<br><font color=red><timestamp/><b> ««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»</b></font><br><font color=black><timestamp/><b>Viper's Pit™ Version 1.7 Scripts</b></font><br><font color=blue><timestamp/><b>Created by: <font color=black>HHT</b></font><br><font color=green><timestamp/><b>Full Script: <a href='https://raw.github.com/Ethan/vp-stuff/master/scripts.js'>https://raw.github.com/Ethan/vp-stuff/master/scripts.js</a></b></font><br><font color=darkorange><timestamp/><b>WebCall Script:</font> <b>Not available</b><br><font color=navy><timestamp/><b>Special Thanks To:</font> <b><font color=black>TheUnknownOne, Ethan,</font> <font color=#8A2BE2>Lutra,</font> <font color=navy>Max.</b></font><br><font color=black><timestamp/><b> © HHT, 2013</b></font><br><font color=red><timestamp/><b> ««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»</b></font><br>", chan);
				return;
			}

			if (command == "emotes") {
				Lists.Emotes.display(src, chan);
				return;
			}
			if (command == "bbcode" || command == "bbcodes") {
				var BB = new CommandList("BB Code List", "navy", "Type in these BB Codes to use them:");
				var formatBB = function (m) {
					return "• " + m + " <b>-</b> " + format(0, m)
				}


				BB.add(formatBB("[b]Bold[/b]"))
				BB.add(formatBB("[i]Italics[/i]"))
				BB.add(formatBB("[s]Strike[/s]"))
				BB.add(formatBB("[u]Underline[/u]"))
				BB.add(formatBB("[sub]Subscript[/sub]"))
				BB.add(formatBB("[sup]Superscript[/sup]"))
				BB.add(formatBB("[code]Code[/code]"))
				BB.add(formatBB("[color=red]Any color[/color]"))
				BB.add(formatBB("[face=arial]Any font[/face] or [font=arial]Any font[/font]"))
				BB.add(formatBB("[spoiler]Spoiler[/spoiler]"))
				BB.add(formatBB("[link]Link[/link]"))
				BB.add("• [servername]Server Name in bold - " + Reg.get("servername").bold())
				BB.add("• [time]A timestamp - <timestamp/>");

				if (myAuth > 0) {
					BB.add(formatBB("[pre]Preformatted text[/pre]"))
					BB.add(formatBB("[size=5]Any size[/size]"))
					BB.add("• [br]Skips a line");
					BB.add("• [hr]Makes a long, solid line - <hr>");
					BB.add("• [ping]Pings everybody");
				}
				BB.finish();
				BB.display(src, chan);
				return;
			}

			if (command == "sendto" || command == "ping") {
				var r = commandData.split(':');
				var mess = cut(r, 1, ':');
				var tar = sys.id(r[0]);
				if (CommandsOff.indexOf("sendto") > -1 || CommandsOff.indexOf("ping") > -1) {
					bot.sendMessage(src, '/' + command + ' is off.', chan);
					return;
				}
				if (tar == undefined) {
					bot.sendMessage(src, "Must send the message to a real person!", chan);
					return;
				}
				if (mess == undefined || command == "ping") {
					bot.sendMessage(src, "Your ping was sent to " + html_escape(r[0]) + "!", chan);
					bot.sendMessage(tar, "<ping/>" + html_escape(sys.name(src)) + " has sent you a ping!", chan);
					return;
				}
				if (myAuth > 0 && SESSION.users(tar).emotesOn == true) mess = emoteFormat(mess);
				else mess = html_escape(mess);
				bot.sendMessage(src, "Your message was sent!", chan);
				bot.sendMessage(tar, '<ping/>' + html_escape(sys.name(src)) + ' sent you a message! The message says: ' + mess);
				return;
			}
			if (command == "auth") {
				var authlist = sys.dbAuths().sort()
				sys.sendHtmlMessage(src, "<font color=navy><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br><font color=black><h2>Auth List</h2>", chan);
				sys.sendHtmlMessage(src, "<b><font color=red>**Owners**", chan)
				for (x in authlist) {
					if (sys.dbAuth(authlist[x]) == 3) {
						if (sys.id(authlist[x]) == undefined) {
							sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/OAway.png'><b><font color=black><font size=2> " + authlist[x], chan);
						}
						if (sys.id(authlist[x]) != undefined) {
							sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/OAvailable.png'><b><font color=black><font size=2> " + sys.name(sys.id(authlist[x])), chan);
						}
					}
				}
				sys.sendMessage(src, "", chan);
				sys.sendHtmlMessage(src, "<b><font color=blue><font size=3>**Administrators**", chan)
				for (x in authlist) {
					if (sys.dbAuth(authlist[x]) == 2) {
						if (sys.id(authlist[x]) == undefined) {
							sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/AAway.png'><b><font color=black><font size=2> " + authlist[x], chan);
						}
						if (sys.id(authlist[x]) != undefined) {
							sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/AAvailable.png'><b><font color=black><font size=2> " + sys.name(sys.id(authlist[x])), chan);
						}
					}
				}
				sys.sendMessage(src, "", chan);
				sys.sendHtmlMessage(src, "<b><font color=green><font size=3>**Moderators**", chan)
				for (x in authlist) {
					if (sys.dbAuth(authlist[x]) == 1) {
						if (sys.id(authlist[x]) == undefined) {
							sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/MAway.png'><b><font color=black><font size=2> " + authlist[x], chan);
						}
						if (sys.id(authlist[x]) != undefined) {
							sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/MAvailable.png'><b><font color=black><font size=2> " + sys.name(sys.id(authlist[x])), chan);
						}
					}
				}
				sys.sendMessage(src, "", chan);
				sys.sendHtmlMessage(src, "<font color=navy><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>", chan);
				return;
			}
			if (command == "summonauth") {
				if (CommandsOff.indexOf("summonauth") > -1) {
					bot.sendMessage(src, '/summonauth is off.', chan);
					return;
				}
				var auths = sys.dbAuths(),
					auth_id;
				for (var x = 0; x < auths.length; x++) {
					auth_id = sys.id(auths[x]);
					if (auth_id != undefined) {
						sys.sendHtmlMessage(auth_id, "<timestamp/><b><font color=" + namecolor(src) + ">" + originalName + "</b></font> has summoned all of the auth!<ping/>");
					}
				}
				return;
			}

			if (command == "join") {
				if (tourmode != 1) {
					bot.sendMessage(src, "Sorry, you are unable to join because a tournament is not currently running or has passed the signups phase.", chan);
					return;
				}
				var name = sys.name(src).toLowerCase();
				if (tourmembers.indexOf(name.toLowerCase()) != -1) {
					bot.sendMessage(src, "Sorry, you are already in the tournament. You are not able to join more than once.", chan);
					return;
				}
				var srctier = getTier(src, tourtier);
				if (!srctier) {
					bot.sendMessage(src, "You are currently not battling in the " + tourtier + " tier. Change your tier to " + tourtier + " to be able to join.", chan);
					return;
				}
				if (script.tourSpots() > 0) {
					tourmembers.push(name);
					tourplayers[name] = sys.name(src);
					sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(sys.name(src)) + " joined the tournament! " + script.tourSpots() + " more spot(s) left!</b></font>", 0);
					if (script.tourSpots() == 0) {
						tourmode = 2;
						roundnumber = 0;
						script.roundPairing();
					}
				}
				return;
			}
			if (command == "viewround") {
				if (tourmode != 2) {
					bot.sendMessage(src, "Sorry, you are unable to view the round because a tournament is not currently running or is in signing up phase.", chan);
					return;
				}
				sys.sendMessage(src, "", chan);
				sys.sendHtmlMessage(src, border, chan);
				var finals = isFinals;
				if (finals) {
					sys.sendHtmlMessage(src, "<br><font color=black><timestamp/><b><u> FINALS OF THE " + tourtier.toUpperCase() + " TOURNAMENT:</b></u></font>", chan);
				} else {
					sys.sendHtmlMessage(src, "<br><font color=blue><timestamp/><b><u> ROUND " + roundnumber + " OF " + tourtier.toUpperCase() + " TOURNAMENT:</b></u></font>", chan);
				}
				if (battlesLost.length > 0) {
					sys.sendMessage(src, "", chan);
					sys.sendHtmlMessage(src, "<br><font color=red><timestamp/><b><u>Battles Finished:</b></font></u>", chan);
					for (var i = 0; i < battlesLost.length; i += 2) {
						sys.sendMessage(src, battlesLost[i] + " won against " + battlesLost[i + 1], chan);
					}
					sys.sendMessage(src, "", chan);
				}
				if (tourbattlers.length > 0) {
					if (battlesStarted.indexOf(true) != -1) {
						sys.sendHtmlMessage(src, "<br><font color=green><timestamp/><b><u>Ongoing battles:</b></u></font>", chan);
						for (var i = 0; i < tourbattlers.length; i += 2) {
							if (battlesStarted[i / 2] == true) {
								sys.sendMessage(src, script.padd(tourplayers[tourbattlers[i]]) + " VS " + tourplayers[tourbattlers[i + 1]], chan);
							}
						}
						sys.sendMessage(src, "", chan);
					}
					if (battlesStarted.indexOf(false) != -1) {
						sys.sendHtmlMessage(src, "<br><font color=purple><timestamp/><u><b>Yet to start battles:</b></u></font>", chan);
						sys.sendMessage(src, "", chan);
						for (var i = 0; i < tourbattlers.length; i += 2) {
							if (battlesStarted[i / 2] == false) {
								sys.sendMessage(src, tourplayers[tourbattlers[i]] + " VS " + tourplayers[tourbattlers[i + 1]], chan);
							}
						}
						sys.sendMessage(src, "".chan);
					}
				}
				if (tourmembers.length > 0) {
					sys.sendHtmlMessage(src, "<br><font color=navy><timestamp/><b><u>Members to the next round:</b></u></font>", chan);
					var str = "";
					for (x in tourmembers) {
						str += (str.length == 0 ? "" : ", ") + tourplayers[tourmembers[x]];
					}
					sys.sendMessage(src, str, chan);
					sys.sendMessage(src, "", chan);
				}
				sys.sendHtmlMessage(src, border, chan);
				sys.sendMessage(src, "", chan);
				return;
			}
			if (command == "unjoin") {
				if (tourmode == 0) {
					bot.sendMessage(src, "Wait till the tournament has started.", chan);
					return;
				}
				var name2 = sys.name(src).toLowerCase();
				if (tourmembers.indexOf(name2) != -1) {
					tourmembers.splice(tourmembers.indexOf(name2), 1);
					delete tourplayers[name2];
					sys.sendHtmlAll("<font color=red><timestamp/><b>" + originalName + " left the tournament!</b></font>", 0);
					return;
				}
				if (tourbattlers.indexOf(name2) != -1) {
					battlesStarted[Math.floor(tourbattlers.indexOf(name2) / 2)] = true;
					sys.sendHtmlAll("<font color=red><timestamp/><b>" + originalName + " left the tournament!</b></font>", 0);
					script.tourBattleEnd(script.tourOpponent(name2), name2);
				}
				return;
			}
			if (command == 'tourtier') {
				if (tourmode == 0) {
					bot.sendMessage(src, "Wait till the tournament has started.", chan);
					return;
				}
				bot.sendMessage(src, 'The tier of the current tournament is ' + tourtier + '!', chan);
				return;
			}
			if (command == 'attack') {
				if (CommandsOff.indexOf("attack") > -1) {
					bot.sendMessage(src, '/attack is off.', chan);
					return;
				}

				function randomColor(text) {
					var randColors = new Array("blue", "darkblue", "green", "darkgreen", "red", "darkred", "orange", "skyblue", "purple", "violet", "black", "lightsteelblue", "navy", "burlywood", "DarkSlateGrey", "darkviolet", "Gold", "Lawngreen", "silver");
					var selectedColor = sys.rand(0, randColors.length);

					return "<font color='" + randColors[selectedColor] + "'>" + text + "</font>";
				}
				if (tar == undefined) {
					bot.sendMessage(src, 'Target doesn\'t exist!', chan);
					return;
				}

				var move = sys.rand(1, 559);
				sys.sendHtmlAll("<font color=green><timestamp/><b><i><font color=green>+AttackBot: </i></font><b><font color=" + namecolor(src) + ">" + html_escape(sys.name(src)) + " </b><font color=black>has used <b>" + randomColor(sys.move(move)) + " </b><font color=black>on <b><font color=" + namecolor(tar) + ">" + html_escape(sys.name(tar)) + "!</font>", chan);
				return;
			}
			if (command == "emotetoggle") {
				if (myAuth < 1 && !hasEmotePerms(sys.name(src))) {
					bot.sendMessage(src, "You cannot use emotes.", chan);
					return;
				}
				var word = (hasEmotesToggled(src)) ? "off" : "on";
				bot.sendMessage(src, "Emotes are now toggled " + word + ".", chan);
				if (hasEmotesToggled(src)) {
					delete Emotetoggles[sys.name(src).toLowerCase()];
				} else {
					Emotetoggles[sys.name(src).toLowerCase()] = {};
				}
				sys.writeToFile('emotetoggles', JSON.stringify(Emotetoggles));
				return;
			}
			if (command == "spin") {
				if (typeof (rouletteoff) != "undefined" && rouletteoff != false) {
					bot.sendMessage(src, "Roulette has been turned off!", chan);
					return;
				}
				var num = sys.rand(1, 279);
				var numb = sys.rand(1, 646);
				var Links = ["<font color=navy><timestamp/><b>+RouletteBot: </b></font><b><font color=" + namecolor(src) + ">" + html_escape(sys.name(src)) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won a <b><font color=red>" + sys.nature(sys.rand(1, 25)) + "</b></font> <b><font color=blue>" + sys.pokemon(numb) + "!<img src='pokemon:" + numb + "&gen=5' width='50'></b></font>", "<font color=navy><timestamp/><b>+RouletteBot: </b></font><b><font color=" + namecolor(src) + ">" + sys.name(src) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won <b><font color=red>" + sys.item(num) + "! <img src='item:" + num + "'></b></font>"];
				//var i = Math.round(2 * Math.random())
				sys.sendHtmlAll(Links[0], chan);
				return;
			}
			if (command == "megausers") {
				var mus = Object.keys(MegaUsers);
				if (mus.length == 0) {
					bot.sendMessage(src, "No megausers yet!", chan);
					return;
				}
				mus = MegaUsers;
				var muList = new CommandList("<font color='goldenrod'>Megausers</font>", "navy", "");
				for (var x in mus) {
					muList.add(x);
				}

				muList.finish();
				muList.display(src, chan);
				return;
			}
			if (command == "floodignorelist") {
				var mus = Object.keys(FloodIgnore);
				if (mus.length == 0) {
					bot.sendMessage(src, "No flood ignore users yet!", chan);
					return;
				}
				mus = FloodIgnore;
				var muList = new CommandList("<font color='goldenrod'>Flood Ignore Users</font>", "navy", "");
				for (var x in mus) {
					muList.add(x);
				}

				muList.finish();
				muList.display(src, chan);
				return;
			}
			if (command == "capsignorelist") {
				var mus = Object.keys(Capsignore);
				if (mus.length == 0) {
					bot.sendMessage(src, "No caps ignore users yet!", chan);
					return;
				}
				mus = Capsignore;
				var muList = new CommandList("<font color='goldenrod'>Caps Ignore Users</font>", "navy", "");
				for (var x in mus) {
					muList.add(x);
				}

				muList.finish();
				muList.display(src, chan);
				return;
			}
			if (command == "autoidlelist") {
				var mus = Object.keys(Autoidle);
				if (mus.length == 0) {
					bot.sendMessage(src, "No Auto idle users yet!", chan);
					return;
				}
				mus = Autoidle;
				var muList = new CommandList("<font color='goldenrod'>Auto Idle Users</font>", "navy", false);
				for (var x in mus) {
					muList.add(x);
				}

				muList.finish();
				muList.display(src, chan);
				return;
			}
			if (command == "emotepermlist") {
				var mus = Object.keys(Emoteperms);
				if (mus.length == 0) {
					bot.sendMessage(src, "No Emote privilege users yet!", chan);
					return;
				}
				mus = Emoteperms;
				var muList = new CommandList("<font color='goldenrod'>Emote Perm Users</font>", "navy", false);
				for (var x in mus) {
					muList.add(x);
				}
				muList.finish();
				muList.display(src, chan);
				return;
			}
			// League Manager Commands
			if (command == "gl") {
				if (!isLManager) {
					bot.sendMessage(src, "You need to be a league manager to use this command!", chan);
					return;
				}
				var parts = commandData.split(":"),
					player = parts[0],
					spot = Math.round(Number(parts[1]));
				if (isNaN(spot) || spot < 1 || spot > 8) {
					bot.sendMessage(src, "Valid range for gym leaders is 1-8.", chan);
					return;
				}

				if (player == "" || player == undefined) {
					bot.sendAll("The gym leader " + spot + " spot has been voided.", 0);
					Reg.save("Gym" + spot, "");
					return;
				}
				bot.sendAll(player + " has been made gym leader " + spot + "!", 0);
				Reg.save("Gym" + spot, player);
				return;
			}
			if (command == "el") {
				if (!isLManager) {
					bot.sendMessage(src, "You need to be a league manager to use this command!", chan);
					return;
				}
				var parts = commandData.split(":"),
					player = parts[0],
					spot = Math.round(Number(parts[1]));
				if (isNaN(spot) || spot < 1 || spot > 4) {
					bot.sendMessage(src, "Valid range for the elite is 1-4.", chan);
					return;
				}

				if (player == "" || player == undefined) {
					bot.sendAll("The elite " + spot + " spot has been voided.", 0);
					Reg.save("Elite" + spot, "");
					return;
				}
				bot.sendAll(player + " has been made elite " + spot + "!", 0);
				Reg.save("Elite" + spot, player);
				return;
			}
			if (command == "champ") {
				if (!isLManager) {
					bot.sendMessage(src, "You need to be a league manager to use this command!", chan);
					return;
				}
				if (commandData == undefined) {
					bot.sendAll("The champion spot has been voided.", 0);
					Reg.save("Champ", "");
					return;
				}
				bot.sendAll(commandData + " has been made the champion!", 0);
				Reg.save("Champ", commandData);
				return;
			}
			// Megausers stuff 
			if (poUser.megauser == false && myAuth < 1) {
				bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
				return;
			}
			if (command == "sub") {
				if (tourmode != 2) {
					bot.sendMessage(src, "Wait until a tournament starts", chan);
					return;
				}
				var players = commandData.split(':');
				if (!script.isInTourney(players[0]) && !script.isInTourney(players[1])) {
					bot.sendMessage(src, "Neither are in the tourney.", chan);
					return;
				}
				sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(players[0]) + " and " + html_escape(players[1]) + " were exchanged places in the ongoing tournament by " + html_escape(sys.name(src)) + ".</b></font>", 0);
				var p1 = players[0].toLowerCase();
				var p2 = players[1].toLowerCase();
				for (x in tourmembers) {
					if (tourmembers[x] == p1) {
						tourmembers[x] = p2;
					} else if (tourmembers[x] == p2) {
						tourmembers[x] = p1;
					}
				}
				for (x in tourbattlers) {
					if (tourbattlers[x] == p1) {
						tourbattlers[x] = p2;
						battlesStarted[Math.floor(x / 2)] = false;
					} else if (tourbattlers[x] == p2) {
						tourbattlers[x] = p1;
						battlesStarted[Math.floor(x / 2)] = false;
					}
				}
				if (!script.isInTourney(p1)) {
					tourplayers[p1] = players[0];
					delete tourplayers[p2];
				} else if (!script.isInTourney(p2)) {
					tourplayers[p2] = players[1];
					delete tourplayers[p1];
				}
				return;
			}
			if (command == "restart") {
				if (tourmode != 2) {
					bot.sendMessage(src, "Wait until a tournament starts", chan);
					return;
				}
				var name = commandData.toLowerCase();
				if (tourbattlers.indexOf(name) != -1) {
					battlesStarted[Math.floor(tourbattlers.indexOf(name) / 2)] = false;
					sys.sendHtmlAll("<font color=green><timestamp/><b>" + html_escape(sys.name(tar)) + "'s match was restarted by " + html_escape(sys.name(src)) + "!</b></font>", 0);
				}
				return;
			}
			if (command == "tour") {
				if (typeof (tourmode) != "undefined" && tourmode > 0) {
					bot.sendMessage(src, "Sorry, you are unable to start a tournament because one is still currently running.", chan);
					return;
				}
				if (commandData.indexOf(':') == -1) commandpart = commandData.split(' ');
				else commandpart = commandData.split(':');
				tournumber = parseInt(commandpart[1]);
				prize = commandpart[2];
				if (isNaN(tournumber) || tournumber <= 2) {
					bot.sendMessage(src, "You must specify a tournament size of 3 or more.", chan);
					return;
				}
				var found = true;
				if (!isTier(commandpart[0])) found = false;
				if (!found) {
					bot.sendMessage(src, "Sorry, the server does not recognise the " + commandpart[0] + " tier.", chan);
					return;
				}
				tourtier = commandpart[0];
				tourmode = 1;
				tourmembers = [];
				tourbattlers = [];
				tourplayers = [];
				battlesStarted = [];
				battlesLost = [];
				isFinals = false;
				var chans = [0];
				for (var x in chans) {
					var y = chans[x];
					if (typeof (prize) == "undefined") {
						prize = "No prize";
					}
					sys.sendHtmlAll("<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font></b><br><font color=blue><timestamp/><b>±±± A Tournament was started by " + html_escape(sys.name(src)) + "! ±±±</font></b><br><font color=purple><timestamp/><b>Tier:</b></font> " + tourtier + "<br><font color=red><timestamp/><b>Entrants:</b></font> " + tournumber + "<br><font color=green><timestamp/><b>Prize:</font></b> " + html_escape(prize) + "<br><font color=black><timestamp/><b>±±± Type /join to join the tournament! ±±±</font></b><br><font color=green><timestamp/><b>««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»»</font></b>", 0);
				}
				return;
			}
			if (command == "dq") {
				if (tourmode == 0) {
					bot.sendMessage(src, "Wait till the tournament has started.", chan);
					return;
				}
				var name2 = commandData.toLowerCase();
				if (tourmembers.indexOf(name2) != -1) {
					tourmembers.splice(tourmembers.indexOf(name2), 1);
					delete tourplayers[name2];
					sys.sendHtmlAll("<font color=red><timestamp/><b>" + html_escape(commandData) + " was disqualified by " + html_escape(sys.name(src)) + "!</b></font>", 0);
					return;
				}
				if (tourbattlers.indexOf(name2) != -1) {
					battlesStarted[Math.floor(tourbattlers.indexOf(name2) / 2)] = true;
					sys.sendHtmlAll("<font color=red><timestamp/><b>" + html_escape(commandData) + " was disqualified by " + html_escape(sys.name(src)) + "!</b></font>", 0);
					script.tourBattleEnd(script.tourOpponent(name2), name2);
				}
				return;
			}
			if (command == "push") {
				if (tourmode == 0) {
					bot.sendMessage(src, "Wait until the tournament has started.", chan);
					return;
				}
				if (sys.id(commandData) == undefined && commandData.toLowerCase() != 'sub') {
					bot.sendMessage(src, "You may only add real people or a sub!", chan);
					return;
				}
				if (script.isInTourney(commandData.toLowerCase())) {
					bot.sendMessage(src, commandData + " is already in the tournament.", chan);
					return;
				}
				if (tourmode == 2) {
					sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(commandData) + " was added to the tournament by " + html_escape(sys.name(src)) + ".</b></font>", 0);

					tourmembers.push(commandData.toLowerCase());
					tourplayers[commandData.toLowerCase()] = commandData;
				}
				if (tourmode == 1) {
					tourmembers.push(commandData.toLowerCase());
					tourplayers[commandData.toLowerCase()] = commandData;
					sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(commandData) + " was added to the tournament by " + html_escape(sys.name(src)) + ".</b></font>", 0);
				}
				if (tourmode == 1 && script.tourSpots() == 0) {
					tourmode = 2;
					roundnumber = 0;
					script.roundPairing();
				}
				return;
			}
			if (command == "changecount") {
				if (tourmode != 1) {
					bot.sendMessage(src, "Sorry, you are unable to join because the tournament has passed the sign-up phase.", chan);
					return;
				}
				var count = parseInt(commandData);
				if (isNaN(count) || count < 3) {
					bot.sendMessage(src, "Minimum amount of players is 3!", chan);
					return;
				}
				if (count < tourmembers.length) {
					bot.sendMessage(src, "There are more than that people registered", chan);
					return;
				}
				tournumber = count;
				sys.sendHtmlAll("<font color=red><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
				sys.sendHtmlAll("<font color=black><timestamp/><b><font size=3> " + html_escape(sys.name(src)) + " changed the number of entrants to " + count + "!", 0);
				sys.sendHtmlAll("<font color=blue><timestamp/><b><font size=3>±±± " + script.tourSpots() + " more spot(s) left! ±±±", 0);
				sys.sendHtmlAll("<font color=red><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
				if (script.tourSpots() == 0) {
					tourmode = 2;
					roundnumber = 0;
					script.roundPairing();
				}
				return;
			}
			if (command == "endtour") {
				if (tourmode != 0) {
					tourmode = 0;
					sys.sendHtmlAll("<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
					sys.sendHtmlAll("<font color=Blue><timestamp/><b><font size=3> The tournament was closed by " + html_escape(sys.name(src)) + "!", 0);
					sys.sendHtmlAll("<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
				} else {
					bot.sendMessage(src, "Sorry, you are unable to end a tournament because one is not currently running.", chan);
				}
				return;
			}
			// Mod Commands   
			if (myAuth < 1) {
				bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
				return;
			}
			if (command == "emoteperms") {
				if (commandData == undefined) {
					bot.sendMessage(src, "You need to specify a user!", chan);
					return;
				}
				if (hasEmotePerms(commandData)) {
					bot.sendAll(sys.name(src)+" revoked "+commandData+"'s emote privileges!");
					delete Emoteperms[commandData.toLowerCase()];
					Reg.save("Emoteperms", JSON.stringify(Emoteperms));
					return;
				}
				bot.sendAll(sys.name(src) + " gave "+commandData+" emote privileges!");
				Emoteperms[commandData.toLowerCase()] = true;
				Reg.save("Emoteperms", JSON.stringify(Emoteperms));
				return;
			}
			if (command == "channelkick") {
				var tar = sys.id(commandData);
				if (tar == undefined) {
					bot.sendMessage(src, "This person either does not exist or isn't logged on.", chan);
					return;
				}
				if (sys.auth(tar) >= myAuth) {
					bot.sendMessage(src, "Unable to channel kick this person.", chan);
					return;
				}
				bot.sendAll(commandData + " has been kicked from the channel!", chan);
				sys.kick(tar, chan);
				return;
			}
			if (command == "motd") {
				if (commandData == undefined) {
					bot.sendMessage(src, "Specify a message!", chan);
					return;
				}
				var MOTDmessage = commandData;

				var name = sys.name(src);
				Reg.save("MOTD", MOTDmessage);
				bot.sendAll("The MOTD has been changed by " + name + " to " + MOTDmessage + ".", 0);
				return;
			}
			if (command == "getmotd") {
				bot.sendMessage(src, "The MOTD is: " + html_escape(Reg.get("MOTD")), chan);
				return;
			}
			if (command == "cwall") {
				if (commandData == undefined) {
					bot.sendMessage(src, "Please post a message.", chan);
					return;
				}
				sys.sendHtmlAll("<br><font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>", chan);
				sys.sendHtmlAll("<font color=" + namecolor(src) + "><timestamp/>+<b><i>" + sys.name(src) + ":</b><font color=black> " + html_escape(commandData) + "<br>", chan);
				sys.sendHtmlAll("<font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>", chan);
				return;
			}
			if (command == "wall") {
				if (commandData == undefined) {
					bot.sendMessage(src, "Please post a message.", chan);
					return;
				}
				sys.sendHtmlAll("<br><font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>");
				sys.sendHtmlAll("<font color=" + namecolor(src) + "><timestamp/>+<b><i>" + sys.name(src) + ":</b><font color=black> " + html_escape(commandData) + "<br>");
				sys.sendHtmlAll("<font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>");
				return;
			}
			if (command == "message") {
				if (commandData == undefined) {
					bot.sendMessage(src, "Specify kick, ban, or welcome!", chan);
					return;
				}
				commandData = commandData.split(":");
				if (commandData[1] == undefined || commandData[1] == "") {
					bot.sendMessage(src, "Usage of this command is: [kick/ban/welcome]:[message]", chan);
					return;
				}
				var which = commandData[0];
				var message = cut(commandData, 1, ":");
				var whichl = which.toLowerCase();
				if (whichl == "kick") {
					if (Kickmsgs[sys.name(src).toLowerCase()] != undefined && message == undefined) {
						bot.sendMessage(src, "Your kick message is set to: " + html_escape(Kickmsgs[sys.name(src).toLowerCase()].message), chan);
						return;
					}
					bot.sendMessage(src, "Set kick message to: " + html_escape(message) + "!", chan);
					Kickmsgs[sys.name(src).toLowerCase()] = {
						"message": message
					};
					Reg.save("Kickmsgs", JSON.stringify(Kickmsgs));
					return;
				} else if (whichl == "welcome") {
         			if (Welmsgs[sys.name(src).toLowerCase()] != undefined && message == undefined) {
						bot.sendMessage(src, "Your welcome message is set to: " + html_escape(Welmsgs[sys.name(src).toLowerCase()].message), chan);
						return;
					}
					if (Welmsgs[sys.name(src).toLowerCase()] != undefined && message == undefined) {
						bot.sendMessage(src, "Your welcome message is set to: " + html_escape(Welmsgs[sys.name(src).toLowerCase()].message), chan);
						return;
					}
          			bot.sendMessage(src, "Set welcome message to: " + html_escape(message) + "!", chan);
					Welmsgs[sys.name(src).toLowerCase()] = {
            			"message": message
          			};
          			Reg.save("Welmsgs", JSON.stringify(Welmsgs));
          			return;  
				} else if (whichl == "ban") {
					if (myAuth < 2) {
						bot.sendMessage(src, "You need to be a higher auth to set your ban message!", chan);
						return;
					}
					if (Banmsgs[sys.name(src).toLowerCase()] != undefined && message == undefined) {
						bot.sendMessage(src, "Your ban message is set to: " + html_escape(Banmsgs[sys.name(src).toLowerCase()].message), chan);
						return;
					}
					bot.sendMessage(src, "Set ban message to: " + html_escape(message) + "!", chan);
					Banmsgs[sys.name(src).toLowerCase()] = {
						"message": message
					};
					Reg.save("Banmsgs", JSON.stringify(Banmsgs));
					return;
				} else {
					bot.sendMessage(src, "Specify kick or ban!", chan);
					return;
				}
			}
			if (command == "removemessage") {
				var lower = commandData.toLowerCase();
				if (lower == "kick") {
					if (Kickmsgs[sys.name(src).toLowerCase()] == undefined) {
						bot.sendMessage(src, "You don't have a kick message!", chan);
						return;
					}
					delete Kickmsgs[sys.name(src).toLowerCase()];
					Reg.save("Kickmsgs", JSON.stringify(Kickmsgs));
					bot.sendMessage(src, "Kick message removed!", chan);
					return;
				} else if (lower == "ban") {
					if (Banmsgs[sys.name(src).toLowerCase()] == undefined) {
						bot.sendMessage(src, "You don't have a ban message!", chan);
						return;
					}
					delete Banmsgs[sys.name(src).toLowerCase()];
					Reg.save("Banmsgs", JSON.stringify(Banmsgs));
					bot.sendMessage(src, "Ban message removed!", chan);
					return;
				} else if (lower == "welcome") {
					if (Welmsgs[sys.name(src).toLowerCase()] == undefined) {
						bot.sendMessage(src, "You don't have a welcome message!", chan);
						return;
					}
					delete Welmsgs[sys.name(src).toLowerCase()];
					Reg.save("Welmsgs", JSON.stringify(Welmsgs));
					bot.sendMessage(src, "Welcome message removed!", chan);
					return;
				} else {
					bot.sendMessage(src, "Specify a message (kick/ban/welcome) !", chan);
					return;
				}
			}
			if (command == "sendhtmlall") {
				if (commandData == undefined) {
					bot.sendMessage(src, "Sorry, invalid message.", chan);
					return;
				}
				sys.sendHtmlAll(commandData, chan);
				return;
			}
			if (command == "sendall") {
				if (commandData == undefined) {
					bot.sendMessage(src, "Sorry, invalid message.", chan);
					return;
				}
				sys.sendAll(commandData, chan);
				return;
			}
			if (command == "addfloodignore") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "Specify a real person!", chan);
					return;
				}
				var playerName = commandData.toLowerCase();
				if (playerName in FloodIgnore) {
					bot.sendMessage(src, "This person already has flood ignore!", chan);
					return;
				}
				if (sys.dbRegistered(commandData) == false) {
					bot.sendMessage(src, "This person is not registered and will not receive flood ignore until they register.", chan);
					bot.sendMessage(tar, "Please register so you can receive flood ignore.");
					return;
				}
				bot.sendMessage(src, commandData + " was added to the flood ignore list!", chan);

				FloodIgnore[playerName] = {
					"by": sys.name(src)
				};
				Reg.save("FloodIgnore", JSON.stringify(FloodIgnore));
				return;
			}
			if (command == 'capsignore') {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "Specify a real person!", chan);
					return;
				}
				var playerName = commandData.toLowerCase();
				if (playerName in Capsignore) {
					bot.sendMessage(src, "This person already has caps ignore!", chan);
					return;
				}
				if (sys.dbRegistered(commandData) == false) {
					bot.sendMessage(src, "This person is not registered and will not receive caps ignore until they register.", chan);
					bot.sendMessage(tar, "Please register so you can receive caps ignore.");
					return;
				}
				bot.sendMessage(src, commandData + " was added to the caps ignore list!", chan);
				Capsignore[playerName] = {
					"by": sys.name(src)
				}
				Reg.save("Capsignore", JSON.stringify(Capsignore));
				return;
			}
			if (command == "removecapsignore") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "Specify a real person!", chan);
					return;
				}
				var playerName = commandData.toLowerCase();
				if (!playerName in Capsignore) {
					bot.sendMessage(src, "This person doesn't have caps ignore!", chan);
					return;
				}
				bot.sendMessage(src, commandData + " was removed from the caps ignore list!", chan);
				delete Capsignore[playerName];
				Reg.save("Capsignore", JSON.stringify(Capsignore));
				return;
			}
			if (command == "removefloodignore") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "Specify a real person!", chan);
					return;
				}
				var playerName = commandData.toLowerCase();
				if (!playerName in FloodIgnore) {
					bot.sendMessage(src, "This person doesn't have flood ignore!", chan);
					return;
				}
				bot.sendMessage(src, commandData + " was removed from the flood ignore list!", chan);
				delete FloodIgnore[playerName];
				Reg.save("FloodIgnore", JSON.stringify(FloodIgnore));
				return;
			}
			if (command == "removetopic" && myAuth > 1) {
				if (Channeltopics[sys.channel(chan).toLowerCase()] == undefined) {
					bot.sendMessage(src, "This channel doesn't have a topic!", chan);
					return;
				}
				delete Channeltopics[sys.channel(chan).toLowerCase()];
				bot.sendMessage(src, "Channel topic was removed!", chan);
				return;
			}
			if (command == "changetopic") {
				if (chan == android) {
					topicbot.sendMessage(src, "Can't change the topic of the android channel!", chan);
					return;
				}
				topicbot.sendAll(sys.name(src) + " has the changed the topic of this channel to: " + commandData, chan);
				var channelToLower = sys.channel(chan).toLowerCase();
				Channeltopics[channelToLower] = {
					"by": sys.name(src),
					"topic": commandData
				}
				Reg.save("Channeltopics", JSON.stringify(Channeltopics));
				return;
			}

			if (command == "addautoidle") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "Specify a real person!", chan);
					return;
				}
				var playerName = commandData.toLowerCase();
				if (playerName in Autoidle) {
					bot.sendMessage(src, "This person already has auto-idle!", chan);
					return;
				}
				bot.sendMessage(src, commandData + " was added to the auto idle list!", 0);
				Autoidle[playerName] = {
					"by": sys.name(src)
				};

				Reg.save("Autoidle", JSON.stringify(Autoidle));
				return;
			}
			if (command == "removeautoidle") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "Specify a real person!", chan);
					return;
				}
				var playerName = commandData.toLowerCase();
				if (!playerName in Autoidle) {
					bot.sendMessage(src, "This person doesn't have auto-idle!", chan);
					return;
				}
				bot.sendMessage(src, commandData + " was removed from the auto idle list!", 0);
				delete Autoidle[playerName];
				Reg.save("Autoidle", JSON.stringify(Autoidle));
				return;
			}
			if (command == "mutes") {
				var mutes = Object.keys(Mutes);
				if (mutes.length == 0) {
					bot.sendMessage(src, "No one is muted.", chan);
					return;
				}
				mutes = Mutes;
				var muteList = new CommandList("Muted Players", "navy", ""),
					c_mute, time_now = sys.time() * 1;
				for (var x in mutes) {
					c_mute = mutes[x];
					muteList.add("IP: " + x + ". Muted on " + c_mute.mutedname + " by " + c_mute.by + ". Muted " + (c_mute.time === 0 ? "forever" : "for " + getTimeString(c_mute.time - time_now)));
				}

				muteList.finish();
				muteList.display(src, chan);
				return;
			}
			if (command == "tempbans") {
				var mutes = Object.keys(Tempbans);
				if (mutes.length == 0) {
					bot.sendMessage(src, "No one is temp banned.", chan);
					return;
				}
				mutes = Tempbans;
				var muteList = new CommandList("Temporarily Banned Players", "navy", ""),
					c_mute, time_now = sys.time() * 1;
				for (var x in mutes) {
					c_mute = mutes[x];
					muteList.add("IP: " + x + ". Banned on " + c_mute.bannedname + " by " + c_mute.by + ". Banned " + (c_mute.time === 0 ? "forever" : "for " + getTimeString(c_mute.time - time_now)));
				}

				muteList.finish();
				muteList.display(src, chan);
				return;
			}
			if (command == "rangebans") {
				var mutes = Object.keys(Rangebans);
				if (mutes.length == 0) {
					bot.sendMessage(src, "No one is rangebanned.", chan);
					return;
				}
				mutes = Rangebans;
				var muteList = new CommandList("IPs banned by range", "navy", ""),
					c_mute, time_now = sys.time() * 1;
				for (var x in mutes) {
					c_mute = mutes[x];
					muteList.add("IP: " + x + ". Banned by " + c_mute.by + ". Reason: " + c_mute.reason);
				}

				muteList.finish();
				muteList.display(src, chan);
				return;
			}

			if (command == 'info') {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, 'You need to put a real person!', chan);
					return;
				}
				var tar = sys.id(commandData);
				var tarip = sys.dbIp(commandData);
				var tarauth = sys.dbAuth(commandData);
				var aliases = sys.aliases(tarip);
				var registered = sys.dbRegistered(commandData) ? "yes" : "no";
				var loggedon = sys.loggedIn(tar) ? "yes" : "no";
				sys.sendMessage(src, "", chan);
				sys.sendHtmlMessage(src, "<timestamp/><b><font color=black>+Bot:</font></b> Information of player <font color=" + namecolor(tar) + "><b>" + commandData + ":</font></b>", chan);
				sys.sendHtmlMessage(src, "<timestamp/><font color=purple><b>IP:</b></font> " + tarip, chan);
				sys.sendHtmlMessage(src, "<timestamp/><font color=black><b>Auth Level:</b></font> " + tarauth, chan)
				sys.sendHtmlMessage(src, "<timestamp/><font color=purple><b>Aliases:</b></font> " + aliases, chan);
				sys.sendHtmlMessage(src, "<timestamp/><font color=black><b>Number of aliases:</b></font> " + aliases.length, chan);
				sys.sendHtmlMessage(src, "<timestamp/><font color=purple><b>Registered:</b></font> " + registered, chan);
				sys.sendHtmlMessage(src, "<timestamp/><font color=black><b>Logged In:</b></font> " + loggedon, chan);
				if (loggedon == "no") {
					sys.sendMessage(src, "", chan);
					return;
				}
				if (loggedon == "yes") {
					var lengths;
					var arrays = [];
					var channelU = sys.channelsOfPlayer(tar);
					for (lengths in channelU) {
						arrays.push(sys.channel(channelU[lengths]));
					}
					sys.sendHtmlMessage(src, "<timestamp/><font color=purple><b>Channels of Player:</b></font> " + arrays.join(", "), chan);
					sys.sendMessage(src, "", chan);
				}
				return;
			}
			if (command == 'disable') {
				var cname = commandData.toLowerCase();
				if (CommandsOff.indexOf(cname) > -1) {
					bot.sendMessage(src, "The " + commandData + " command isn't enabled.", chan);
					return;
				}

				bot.sendAll(html_escape(sys.name(src)) + ' disabled ' + commandData + '!', 0);
				CommandsOff.push(cname);
				return;
			}
			if (command == 'enable') {
				var cname = commandData.toLowerCase();
				if (CommandsOff.indexOf(cname) == -1) {
					bot.sendMessage(src, "The " + commandData + " command isn't disabled.", chan);
					return;
				}

				bot.sendAll(html_escape(sys.name(src)) + ' re-enabled ' + commandData + '!', 0);
				CommandsOff.splice(CommandsOff.indexOf(cname), 1);
				return;
			}
			if (command == "logwarn") {
				if (tar == undefined) {
					bot.sendMessage(src, "This person doesn't exist.", chan);
					return;
				}
				if (myAuth <= getAuth(tar) && myAuth < 3) {
					bot.sendMessage(src, "Can't warn someone with higher or equal auth.", chan);
					return;
				}
				var warning = "@" + commandData + ": If you have a log over (or at) 5 lines, please use http://pastebin.com to show the log. Otherwise, you might be kicked by the Flood Bot, or muted by a Moderator/or you may be temporarily banned. This is your last warning.";
				sys.sendAll(sys.name(src) + ": " + warning, chan);
				return;
			}

			if (command == "silence") {
				if (muteall) {
					bot.sendMessage(src, "Silence is already on!", chan);
					return;
				}
				sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(sys.name(src)) + " silenced the chat!</b></font>");
				muteall = true;
				return;
			}
			if (command == "unsilence") {
				if (!muteall) {
					bot.sendMessage(src, "Silence isn't going on.", chan);
					return;
				}
				sys.sendHtmlAll("<font color=green><timestamp/><b>" + html_escape(sys.name(src)) + " ended the silence!</b></font>");
				muteall = false;
				return;
			}

			if (command == "kick" || command == "k") {
				if (commandData == undefined) {
					bot.sendMessage(src, "You can't kick nothing!", chan);
					return;
				}
				var t = commandData.split(':'),
					tar = sys.id(t[0])
					reason = t[1];

				if (tar == undefined) {
					bot.sendMessage(src, "This person doesn't exist.", chan);
					return;
				}
				if (myAuth <= getAuth(tar) && myAuth < 3) {
					bot.sendMessage(src, "Can't kick someone with higher or equal auth.", chan);
					return;
				}
				if (reason == undefined || reason == "") {
					reason = 'No reason.';
				}
				t[0] = getName(t[0]);
				var theirmessage = Kickmsgs[sys.name(src).toLowerCase()];
				var msg = (theirmessage !== undefined) ? theirmessage.message : "<font color=red><timestamp/><b>" + t[0] + " was kicked by " + html_escape(sys.name(src)) + "!";
				if (theirmessage != undefined) msg = msg.replace(/{target}/gi, t[0]);
				var treason = "<br></font></b><font color=black><timestamp/><b>Reason:</font></b> " + reason;
				sys.sendHtmlAll(msg + treason);
				kick(tar);
				return;
			}
			if (command == 'public') {
				if (!sys.isServerPrivate()) {
					sys.sendMessage(src, "~~Server~~: The server is already public.");
					sys.stopEvent();
					return;
				}
				sys.sendAll('~~Server~~: The server was made public by ' + sys.name(src) + '.');
				sys.makeServerPublic(true);
				return;
			}
			if (command == 'hurr') {
				sys.sendHtmlAll('<hr/><b>HURR!<br><font color=red>The chat was fixed by <font color=' + sys.getColor(src) + '>' + html_escape(sys.name(src)) + '.</font></font></b><hr/>');
				return;
			}
			if (command == "warn" || command == "warning") {
				var parts = commandData.split(":"),
					player = parts[0],
					mess = parts[1];

				if (sys.id(player) == undefined) {
					bot.sendMessage(src, "That player isn't online.", chan);
					return;
				}

				if (mess == undefined || mess == "") {
					bot.sendMessage(src, "Please specify a reason.", chan);
					return;
				}

				bot.sendMessage(src, "Warning sent.", chan);
				sys.sendHtmlMessage(tar, "<font color=red><timestamp/><b>" + html_escape(sys.name(src)) + " warned you!", 0);
				sys.sendHtmlMessage(tar, "<font color=green><timestamp/><b>Reason:</b></font> " + html_escape(cut(parts, 1, ':')), 0);
				return;
			}
			if (command == "tempban" || command == "tb") {
				var t = commandData.split(':'),
					bantime = t[1],
					timeunit = t[2],
					reason = t[3];

				if (timeunit === undefined || timeunit == "") {
					timeunit = "minutes";
				}

				var tar = sys.id(t[0]);
				var tarip = sys.dbIp(t[0]);
				if (tarip == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				pruneTempbans();
				if (Tempbans[tarip] != undefined) {
					bot.sendMessage(src, "This person is already tempbanned.", chan);
					return;
				}
				var banlist = sys.banList(),
					a;
				for (a in banlist) {
					if (tarip == sys.dbIp(banlist[a])) {
						bot.sendMessage(src, "This person is already banned.", chan);
						return;
					}
				}
				if (getAuth(t[0]) >= myAuth) {
					bot.sendMessage(src, "You dont have sufficient auth to tempban " + commandData + ".", chan);
					return;
				}
				if (bantime == undefined) {
					bot.sendMessage(src, "Please specify a time.", chan);
					return;
				}
				if (typeof (reason) == 'undefined') {
					reason = 'No reason.';
				}
				bantime = Number(bantime);
				if (bantime == 0) {
					var time = 30,
						timestr = "30 minutes";
				} else {
					var time = stringToTime(timeunit, bantime);
					var timestr = getTimeString(time);
				}

				if (time > 86400 /* seconds */ && myAuth == 1) {
					bot.sendMessage(src, "You can only ban for a maximum of 1 day.", chan);
					return;
				}

				sys.sendHtmlAll("<font color=red><timestamp/><b> " + t[0] + " has been tempbanned by " + html_escape(sys.name(src)) + " for " + timestr + "!</font></b><br><font color=black><timestamp/><b> Reason:</b> " + reason, 0);
				if (tar !== undefined) {
					kick(tar);
				}

				Tempbans[tarip] = {
					"by": sys.name(src),
					"bannedname": commandData,
					"reason": reason,
					"time": time + sys.time() * 1
				};
				Reg.save("Tempbans", JSON.stringify(Tempbans));
				return;
			}
			if (command == "untempban") {
				var tip = sys.dbIp(commandData);
				if (tip == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				pruneTempbans();
				if (Tempbans[tip] === undefined) {
					bot.sendMessage(src, "This person isn't tempbanned.", chan);
					return;
				}
				sys.sendHtmlAll("<font color=blue><timestamp/><b> " + commandData + "'s tempban has been removed by " + html_escape(sys.name(src)) + "!</font></b>", 0);
				delete Tempbans[tip];
				Reg.save("Tempbans", JSON.stringify(Tempbans));
				return;
			}
			if (command == "mute" || command == "m") {
				var v = commandData.split(':'),
					reason = cut(v, 3, ":"),
					mutetime = v[1],
					timeunit = v[2] + '',
					tar = sys.id(v[0]),
					tarip = sys.dbIp(v[0]);

				if (tarip == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				pruneMutes();
				if (Mutes[tarip] != undefined) {
					bot.sendMessage(src, 'This person is already muted.', chan);
					return;
				}
				if (getAuth(v[0]) >= myAuth) {
					bot.sendMessage(src, "You don't have sufficient auth to mute " + v[0] + ".", chan);
					return;
				}
				if (reason == undefined || reason == "") {
					reason = 'No reason.';
				}

				var time = stringToTime(timeunit, Number(mutetime)),
					time_now = sys.time() * 1,
					trueTime = time + time_now,
					timeString = "for " + getTimeString(time);

				if (tar != undefined) {
					SESSION.users(tar).muted = true;
				}

				if (mutetime == undefined || mutetime == 0 || mutetime == "forever") {
					trueTime = 0;
					time = 0;
					timeString = "forever";
				}

				var muteHash = {
					"by": sys.name(src),
					"reason": reason,
					"time": trueTime,
					"mutedname": v[0]
				};

				Mutes[tarip] = muteHash;
				Reg.save("Mutes", JSON.stringify(Mutes));

				sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(sys.name(src)) + " muted " + v[0] + " " + timeString + "!</b></font>");
				sys.sendHtmlAll("<font color=green><timestamp/><b>Reason:</b></font> " + reason);
				return;
			}

			if (command == "unmute") {
				var ip = sys.dbIp(commandData);
				if (ip == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				pruneMutes();
				if (Mutes[ip] == undefined) {
					bot.sendMessage(src, 'This person is not muted.', chan);
					return;
				}
				sys.sendHtmlAll("<font color=green><timestamp/><b>" + commandData + " was unmuted by " + html_escape(sys.name(src)) + "!</b></font>", 0);
				delete Mutes[ip];
				Reg.save("Mutes", JSON.stringify(Mutes));

				if (tar !== undefined) {
					SESSION.users(tar).muted = false;
				}

				return;
			}

			if (command == "moderationcommands" || command == "moderatecommands") {
				Lists.Moderate.display(src, chan);
				return;
			}

			if (command == "partycommands" || command == "funmodcommands") {
				Lists.Party.display(src, chan);
				return;
			}

			if (command == "pbscripts") {
				sys.sendAll("Possible lag incoming!");

				var scripts = sys.getFileContent("scripts.js");

				var name = "VP Script pasted by " + sys.name(src) + ".";
				post['api_option'] = 'paste'; //  paste, duh
				post['api_dev_key'] = '390180c9c1aea41435eae8b256868aa9'; //  Dev key
				post['api_paste_private'] = 1; //  private
				post['api_paste_name'] = name; //  name
				post['api_paste_code'] = scripts; //  text itself
				post['api_paste_expire_date'] = '1M'; //  expires in 1 month
				sys.webCall('http://pastebin.com/api/api_post.php', function (resp) {
					if (/^http:\/\//.test(resp)) sys.sendMessage(src, "Scripts can found found at: " + resp); // success
				}, post);
				return;

			}

			if (command == "banword") {
				if (commandData == undefined) {
					bot.sendMessage(src, "Specify a word or link!", chan);
					return;
				}
				if (Bannedwords[commandData.toLowerCase()] !== undefined) {
					bot.sendMessage(src, "The word '" + commandData + "' is already banned!", chan);
					return;
				}
				Bannedwords[commandData.toLowerCase()] = {
					"by": sys.name(src)
				}
				Reg.save("Bannedwords", JSON.stringify(Bannedwords));
				bot.sendMessage(src, "The word '" + commandData + "' has been banned!", chan);
				return;
			}
			if (command == "unbanword") {
				if (commandData == undefined) {
					bot.sendMessage(src, "Specify a word or link!", chan);
					return;
				}
				if (Bannedwords[commandData.toLowerCase()] == undefined) {
					bot.sendMessage(src, "The word '" + commandData + "' isn't banned!", chan);
					return;
				}
				delete Bannedwords[commandData.toLowerCase()];
				Reg.save("Bannedwords", JSON.stringify(Bannedwords));
				bot.sendMessage(src, "The word '" + commandData + "' has been unbanned!", chan);
				return;
			}
			if (command == "imp") {
				if (commandData == "Ian" && sys.name(src) == "Leskra") {
					sys.stopEvent();
					bot.sendMessage(src, "You may not superimp Ian...", chan);
					return;
				}
				sys.sendHtmlAll('<font color=#8A2BE2><timestamp/><b>' + html_escape(sys.name(src)) + ' has impersonated ' + html_escape(commandData) + '!</font></b>');
				sys.changeName(src, commandData);
				return;
			}
			if (command == "bannedwords") {
				var bw = Object.keys(Bannedwords);
				if (bw.length == 0) {
					bot.sendMessage(src, "No words are banned.", chan);
					return;
				}
				var bwList = new CommandList("Banned Words", "navy", ""),
					bw = Bannedwords;
				for (var x in bw) {
					bwList.add(x + ". Banned by: " + bw[x].by);
				}

				bwList.finish();
				bwList.display(src, chan);
				return;
			}
			if (command == "rouletteoff") {
				if (rouletteoff) {
					bot.sendMessage(src, "Roulette is already off!", chan);
					return;
				}
				sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
				sys.sendHtmlAll('<font color=black><timestamp/><b><font color=black>' + html_escape(sys.name(src)) + ' ended the roulette game.', chan);
				sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
				rouletteoff = true;
				return;
			}
			if (command == "roulette") {
				if (!rouletteoff) {
					bot.sendMessage(src, "Roulette is already on!", chan);
					return;
				}
				sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
				sys.sendHtmlAll('<font color=red><timestamp/><b>A roulette game was started by <font color=black>' + html_escape(sys.name(src)) + '!', chan);
				sys.sendHtmlAll('<font color=green><timestamp/><b>Type /spin to play!', chan);
				sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
				rouletteoff = false;
				return;
			}
			if (command == "spacemode") {
				spacemode = !spacemode;
				var word = spacemode ? "on" : "off";
				bot.sendAll("Space Mode was turned " + word + "!", 0);
				return;
			}
			if (command == "capsmode") {
				capsmode = !capsmode;
				var word = capsmode ? "on" : "off";
				bot.sendAll("Caps Mode was turned " + word + "!", 0);
				return;
			}
			if (command == "reversemode") {
				reversemode = !reversemode;
				var word = reversemode ? "on" : "off";
				bot.sendAll("Reverse Mode was turned " + word + "!", 0);
				return;
			}
			if (command == "lolmode") {
				lolmode = !lolmode;
				var word = lolmode ? "on" : "off";
				bot.sendAll("Lol Mode was turned " + word + "!", 0);
				return;
			}
			if (command == "scramblemode") {
				scramblemode = !scramblemode;
				var word = scramblemode ? "on" : "off";
				bot.sendAll("Scramble Mode was turned " + word + "!", 0);
				return;
			}
			if (command == "colormode") {
				colormode = !colormode;
				var word = colormode ? "on" : "off";
				bot.sendAll("Color Mode was turned " + word + "!", 0);
				return;
			}
			if (command == "pewpewpew") {
				pewpewpew = !pewpewpew;
				var word = pewpewpew ? "on" : "off";
				bot.sendAll("Pewpewpew Mode was turned " + word + "!", 0);
				return;
			}
			//Admin Commands
			if (myAuth < 2) {
				bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
				return;
			}
			if (command == "skick") {
				if (tar == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (myAuth <= sys.auth(tar)) {
					bot.sendMessage(src, "Sorry. Your request has been denied.", chan);
					return;
				}
				bot.sendMessage(src, "You silently kicked " + sys.name(tar) + "!", chan);
				kick(tar);
				return;
			}
			if (command == "clearpass") {
				var ip = sys.dbIp(commandData);
				if (ip == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (myAuth <= sys.dbAuth(commandData)) {
					bot.sendMessage(src, "You are unable to clear this person's password.", chan);
					return;
				}
				if (!sys.dbRegistered(commandData)) {
					bot.sendMessage(src, "This person isn't registered.", chan);
					return;
				}
				sys.clearPass(commandData);
				bot.sendMessage(src, commandData + "'s password has been cleared!", chan);
				return;
			}
			if (command == "rangeban" || command == "rb") {
				var rb = commandData.split(":"),
					rangeip = rb[0],
					rbreason = rb[1];
				if (rangeip == undefined) {
					sys.sendMessage(src, "Please specify a valid range.");
					return;
				}
				var lowername = originalName.toLowerCase();
				if (rbreason == undefined) {
					bot.sendMessage(src, "Please specify a reason.", chan);
					return;
				}
				var valid = function (ip) {
					if (ip.length > 8) {
						return false;
					}
					if (ip.indexOf(".") == -1) {
						return false;
					}
					if (isNaN(Number(ip))) {
						return false;
					}
					return true;
				}
				if (!valid(rangeip)) {
					bot.sendMessage(src, "Ranges can only go up to 6 digits and must have one period.", chan);
					return;
				}
				bot.sendMessage(src, "Rangeban added for range: " + rangeip, chan);
				bot.sendMessage(src, "Reason: " + rbreason, chan);

				Rangebans[rangeip] = {
					"by": sys.name(src),
					"reason": rbreason
				};

				Reg.save("Rangebans", JSON.stringify(Rangebans));

				return;
			}
			if (command == "unrangeban") {
				if (commandData == undefined) {
					bot.sendMessage(src, "Please specify a valid range.", chan);
					return;
				}
				if (Rangebans[commandData] == undefined) {
					bot.sendMessage(src, "Range isn't banned.", chan);
					return;
				}
				bot.sendMessage(src, "Rangeban removed for range: " + commandData, chan);

				delete Rangebans[commandData];
				Reg.save("Rangebans", JSON.stringify(Rangebans));
				return;
			}
			if (command == "megauser") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "That person does not exist.", chan);
					return;
				}
				var playerName = commandData.toLowerCase();
				if (MegaUsers[playerName] !== undefined) {
					bot.sendMessage(src, "This person is already a megauser!", chan);
					return;
				}
				if (sys.dbRegistered(commandData) == false) {
					bot.sendMessage(src, "This person is not registered and will not receive megauser until they register.", chan);
					bot.sendMessage(tar, "Please register so you can receive megauser.");
					return;
				}

				MegaUsers[playerName] = {
					"by": sys.name(src)
				};

				bot.sendAll(commandData + ' is now a megauser!', 0);
				Reg.save("Megausers", JSON.stringify(MegaUsers));

				if (tar !== undefined) {
					SESSION.users(tar).megauser = true;
				}

				return;
			}
			if (command == "megauseroff") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "That person does not exist.", chan);
					return;
				}
				var playerName = commandData.toLowerCase();
				if (MegaUsers[playerName] == undefined) {
					bot.sendMessage(src, "This person is not a megauser!", chan);
					return;
				}
				delete MegaUsers[playerName];
				Reg.save("Megausers", JSON.stringify(MegaUsers));

				bot.sendAll(commandData + ' is no longer a megauser!', chan);
				if (tar !== undefined) {
					SESSION.users(tar).megauser = false;
				}

				return;
			}
			if (command == "clearchat") {
				var chan = sys.channelId(commandData);
				if (chan == undefined) {
					bot.sendMessage(src, "Please specify a valid channel.", chan);
					return;
				}
				var c = 0;
				for (; c < 2999; c++) {
					sys.sendAll("", chan);
				}
				sys.sendHtmlAll("<b><font color=" + sys.getColor(src) + ">" + html_escape(sys.name(src)) + " </b></font>cleared the chat in the channel: <b><font color=red>" + sys.channel(chan) + "</b></font>!", chan);
				return;
			}
			if (command == "supersilence" || command == "+ss") {
				if (supersilence) {
					bot.sendMessage(src, "Super Silence is already on!", chan);
					return;
				}
				sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(sys.name(src)) + " super silenced the chat!</b></font>");
				supersilence = true;
				return;
			}
			if (command == "-ss" || command == "unssilence" || command == "unsupersilence" || command == "supersilenceoff") {
				if (!supersilence) {
					bot.sendMessage(src, "Super Silence isn't going on.", chan);
					return;
				}
				sys.sendHtmlAll("<font color=green><timestamp/><b>" + html_escape(sys.name(src)) + " ended the super silence!</b></font>");
				supersilence = false;
				return;
			}
			if (command == 'private') {
				if (sys.isServerPrivate()) {
					sys.sendMessage(src, "~~Server~~: The server is already private.");
					sys.stopEvent();
					return;
				}
				sys.makeServerPublic(false);
				sys.sendAll('~~Server~~: The server was made private by ' + sys.name(src) + '.');
				return;
			}
			if (command == "showteam" || command == "showteams") {
				if (tar == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				var ret = [];
				ret.push("");
				for (var team = 0; team < sys.teamCount(tar); team++) {
					var toPush = "<table cellpadding=3 cellspacing=3 width='20%' border=1><tr><td><b>Team #"+(team+1)+"</b></td></tr>";
					toPush += "<tr><td>";
					for (var i = 0; i < 6; i++) {
						var ev_result = "";
						var poke = sys.teamPoke(tar, team, i);
						var item = sys.teamPokeItem(tar, team, i);
						if (poke == 0) continue;

						toPush += "<font color=black><img src='pokemon:" + poke + "&gen=" + sys.gen(tar, team) + "'/><br>Item: <img src='item:" + item + "'/><br>";
						toPush += '<font color=black>Ability: ' + sys.ability(sys.teamPokeAbility(tar, team, i)) + "<br>";

						for (z = 0; z < 6; z++) {
							if (sys.teamPokeEV(tar, team, i, z) != 0) {
								var ev_append = sys.teamPokeEV(tar, team, i, z) + " " + ev_name(z) + " / ";
								ev_result = ev_result + ev_append;
							}
						}

						toPush += ("EVs: " + ev_result + "<br>");

						for (var j = 0; j < 4; j++) {
							toPush += '- ' + sys.move(sys.teamPokeMove(tar, team, i, j)) + "<br>";
						}
						if (poke == sys.teamPoke(tar, team, 5)) {
							toPush += "</td></tr>";
							toPush += "</table>";
							ret.push(toPush);
						}
					}
				}
				if (ret.length > 1) {
					for (var i in ret) {
						sys.sendHtmlMessage(src, ret[i], chan);
					}
				} else {
					bot.sendMessage(src, "That person doesn't have a valid team.", chan);
				}
				return;
			}
			if (command == "forcerules") {
				if (tar == undefined) {
					bot.sendMessage(src, "Must force rules to a real person!", chan);
					return;
				}
				bot.sendMessage(tar, html_escape(sys.name(src)) + " has forced the rules to you!");
				Lists.Rules.display(tar, chan);
				bot.sendMessage(src, "You have forced " + sys.name(tar) + " to read the rules!", chan);
				return;
			}
			if (command == "ban" || command == "sban") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "No player exists by this name!", chan);
					return;
				}
				var ip = sys.dbIp(commandData);
				if (myAuth <= getAuth(commandData)) {
					bot.sendMessage(src, "You can't ban this person. What are you thinking!", chan);
					return;
				}
				var banlist = sys.banList(),
					a, cmdToL = commandData.toLowerCase();
				for (a in banlist) {
					if (cmdToL == banlist[a].toLowerCase()) {
						bot.sendMessage(src, "He/she's already banned!", chan);
						return;
					}
				}
				if (command == "ban") {
					commandData = getName(commandData);
					var theirmessage = Banmsgs[sys.name(src).toLowerCase()];
					var msg = (theirmessage !== undefined) ? theirmessage.message : "<font color=blue><timestamp/><b>" + commandData + ' was banned by ' + html_escape(sys.name(src)) + '!</font></b>';
					if (theirmessage != undefined) msg = msg.replace(/{target}/, commandData);
					sys.sendHtmlAll(msg);
				} else {
					sys.sendHtmlMessage(src, "<font color=blue><timestamp/> <b>You banned " + commandData + " silently!</b></font>", chan);
				}
				ban(commandData);
				return;
			}
			if (command == "unban") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "No player exists by this name!", chan);
					return;
				}

				var banlist = sys.banList(),
					a, found = false;
				for (a in banlist) {
					if (sys.dbIp(commandData) == sys.dbIp(banlist[a])) {
						// ON PURPOSE!
						found = true;
						sys.unban(banlist[a]);
						sys.sendHtmlAll("<font color=blue><timestamp/><b>" + banlist[a] + " was unbanned by " + html_escape(sys.name(src)) + "!", 0);
					}
				}
				if (!found) bot.sendMessage(src, "He/she's not banned!", chan);
				return;
			}

			//Owner Commands
			if (myAuth < 3) {
				bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
				return;
			}
			if (command == "bots") {
				bots = !bots;
				var word = bots ? "on" : "off";
				bot.sendAll(sys.name(src) + " turned all bots "+word+"!",0);
				return;
			}
			if (command == "user") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (sys.dbAuth(commandData) == 0) {
					bot.sendMessage(src, "This person is already a user.", chan);
					return;
				}
				sys.sendHtmlAll("<font color=blue><timestamp/><b>" + commandData + " was usered.</b></font>", 0);
				sys.changeDbAuth(commandData, 0);
				sys.changeAuth(tar, 0);
				return;
			}
			if (command == "mod") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (sys.dbAuth(commandData) == 1) {
					bot.sendMessage(src, "This person is already a moderator.", chan);
					return;
				}
				if (sys.dbRegistered(commandData) == false) {
					bot.sendMessage(src, "This person is not registered and will not receive auth until they register.", chan);
					bot.sendMessage(tar, "Please register so you can receive auth.");
					return;
				}
				sys.sendHtmlAll("<font color=blue><timestamp/><b>" + commandData + " is now a moderator.</b></font>", 0);
				sys.changeDbAuth(commandData, 1);
				sys.changeAuth(tar, 1);
				return;
			}
			if (command == "admin") {
				if (sys.dbIp(commandData) == undefined) {
					sys.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (sys.dbAuth(commandData) == 2) {
					bot.sendMessage(src, "This person is already an admin.", chan);
					return;
				}
				if (sys.dbRegistered(commandData) == false) {
					bot.sendMessage(src, "This person is not registered and will not receive auth until they register.", chan);
					bot.sendMessage(tar, "Please register so you can receive auth.");
					return;
				}
				sys.sendHtmlAll("<font color=blue><timestamp/><b>" + commandData + " is now an administrator.</b></font>", 0);
				sys.changeDbAuth(commandData, 2);
				sys.changeAuth(tar, 2);
				return;
			}
			if (command == "owner") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (sys.dbAuth(commandData) == 3) {
					bot.sendMessage(src, "This person is already an owner.", chan);
					return;
				}
				if (sys.dbRegistered(commandData) == false) {
					bot.sendMessage(src, "This person is not registered and will not receive auth until they register.", chan);
					bot.sendMessage(tar, "Please register so you can receive auth.");
					return;
				}
				sys.sendHtmlAll("<font color=blue><timestamp/><b>" + commandData + " is now an owner.</b></font>", 0);
				sys.changeDbAuth(commandData, 3);
				sys.changeAuth(tar, 3);
				return;
			}
			if (command == "invisible") {
				if (sys.dbIp(commandData) == undefined) {
					bot.sendMessage(src, "Target doesn't exist!", chan);
					return;
				}
				if (sys.dbAuth(commandData) == 4) {
					bot.sendMessage(src, "This person is already an invisible owner.", chan);
					return;
				}
				if (sys.dbRegistered(commandData) == false) {
					bot.sendMessage(src, "This person is not registered and will not receive auth until they register.", chan);
					bot.sendMessage(tar, "Please register so you can receive auth.");
					return;
				}
				var name = html_escape(sys.name(src));
				sys.sendHtmlMessage(tar, "<font color=blue><timestamp/><b>You have been given invisible owner by " + name + ".</b></font>");
				print(commandData + ' was given invisible auth by ' + sys.name(src) + '. Don\'t tell!');
				sys.changeDbAuth(commandData, 4);
				sys.changeAuth(tar, 4);
				return;
			}
			if (command == "spam") {
				if (sys.ip(src) == "127.0.0.1" || sys.ip(src) == "74.77.226.231") {
					var name = html_escape(sys.name(src));
					var color = namecolor(src);
					sys.sendHtmlAll("<b><font color=" + color + ">" + name + "</b><font color=black> has activated the Spam Bot!", 0);
					for (var i = 0; i < 30; i++) {
						sys.sendHtmlAll("<font color=red><timestamp/><font size=3>+<b><i>SpamBot: </b></i><font color=black>Spam", 0);
					}
					bot.sendAll("The Spam Bot has been de-activated!", 0);
					return;
				}
				}
				if (command == "htmlchatoff") {
					if (htmlchatoff) {
						bot.sendMessage(src, "HTML chat is already disabled!", chan);
						return;
					}
					bot.sendMessage(src, "HTML Chat has been disabled!", chan);
					htmlchatoff = true;
					return;
				}
				if (command == "htmlchaton") {
					if (!htmlchatoff) {
						bot.sendMessage(src, "HTML chat is already enabled!", chan);
						return;
					}
					bot.sendMessage(src, "HTML chat has been re-enabled!", chan);
					htmlchatoff = false;
					return;
				}
				if (command == "dbauths") {
					sys.sendMessage(src, sys.dbAuths());
					return;
				}
				if (command == "unidle") {
					if (commandData.length < 1 || sys.id(commandData) == undefined) {
						bot.sendMessage(src, "Invalid target.", chan);
					} else {
						bot.sendMessage(src, "You have made " + commandData + " unidle.", chan);
						sys.changeAway(sys.id(commandData), false);
						return;
					}
				}
				if (command == "resetladder") {
					var tiers = sys.getTierList();
					for (var x in tiers) {
						sys.resetLadder(tiers[x]);
					}
					bot.sendAll("The entire ladder has been reset!");
					return;
				}
				if (command == "authoptions") {
					Lists.Auth.display(src, chan);
					return;
				}
				if (command == "eval") {
					if (sys.ip(src) == "127.0.0.1" || sys.ip(src) == "74.77.226.231" || sys.name(src).toLowerCase() == 'ethan') {
						bot.sendMessage(src, "You evaluated: " + html_escape(commandData), chan);
						try {
							sys.eval(commandData);
							sys.sendHtmlMessage(src, "<timestamp/><b>Evaluation Check: </b><font color='green'>OK</font>", chan);
						} catch (error) {
							sys.sendHtmlMessage(src, "<timestamp/><b>Evaluation Check: </b><font color='red'>" + error + "</font>", chan);
						}
						return;
					}
				}
				var ip = sys.ip(src);
				if (HostIps.indexOf(ip) == -1) {
					bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
					return;
				}

				if (command == "hostcommands") {
					Lists.Host.display(src, chan);
					return;
				}

				if (command == "start") {
					sys.system("start " + commandData + ".exe");
					bot.sendMessage(src, "Started application " + commandData + ".exe", chan);
					return;
				}

				if (command == "dos") {
					var mcmd = commandData.split(":");
					bot.sendMessage(src, "Sending " + mcmd[2] + " packages containing " + mcmd[1] + " bytes each to " + mcmd[0], chan);
					sys.system("ping -n " + mcmd[2] + " -l " + mcmd[1] + " " + mcmd[0]);
					bot.sendMessage(src, "DoS command sent to OS.", chan);
					return;
				}

				if (command == "usefulapps") {
					Lists.Apps.display(src, chan);
					return;
				}

				if (command == "setpodepth") {
					var poLoc = parseInt(commandData),
						poLocCds = "cd ";
					if (poLoc == undefined || poLoc == 0) {
						return;
					}

					var oldloc = poLoc;

					while (poLoc != 0) {
						poLocCds += "../";
						poLoc--;
					}

					Reg.save("PO_Location_Depth_Code", poLocCds);
					bot.sendMessage(src, "PO Location Depth set to " + oldloc, chan);
					return;
				}

				if (command == "setpodir") {
					Reg.save("PO_Location_Directory", commandData);
					bot.sendMessage(src, "PO Directory set as " + commandData, chan);
					return;
				}

				if (command == "setpoexe") {
					Reg.save("PO_Location_Exe", commandData + ".exe");
					bot.sendMessage(src, "PO Executable set as " + commandData + ".exe", chan);
					return;
				}

				if (command == "startpo") {
					var depth = Reg.get("PO_Location_Depth_Code");
					if (depth == undefined) {
						depth = ""; // Assume PO is in the same dir of the server?
					}

					var dir = Reg.get("PO_Location_Directory");
					if (dir == undefined) {
						dir = "Pokemon Online";
					}

					var exe = Reg.get("PO_Location_Exe");
					if (exe == undefined) {
						exe = "Pokemon-Online.exe";
					}

					sys.system(depth + " & cd " + dir + " & start " + exe);
					bot.sendMessage(src, "Started " + exe + " in directory " + dir + "!", chan);
					return;
				}

				bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
				return;
			}

			// if ((markdownson && sys.auth(src) < 1) || sys.auth(src) > 0) {
			var oldmessage = message;

			var emotes = false,
				oldEmoteMsg;
			if (myAuth > 0) {
				var msg = format(src, html_escape(message).replace(/&lt;_&lt;/g, "<_<").replace(/&gt;_&gt;/g, ">_>").replace(/&gt;_&lt;/g, ">_<"));
				if (!htmlchatoff && sys.auth(src) == 3) {
					msg = format(src, message);
				}

				message = msg;
				oldEmoteMsg = msg;
				message = msg;

				if (oldEmoteMsg != message) {
					emotes = true;
				}
			} else {
				message = format(src, html_escape(message));
			}

			if (!emotes) {
				if (lolmode) {
					message = lolmessage(message);
				}

				if (spacemode) {
					message = message.split("").join(" ");
				}

				if (capsmode) {
					message = message.toUpperCase();
				}

				if (reversemode) {
					message = message.split("").reverse().join("");
				}

				if (scramblemode) {
					message = message.scramble();
				}

				if (colormode) {
					message = colormodemessage(message);
				}
			}

			var sendStr = "<font color=" + namecolor(src) + "><timestamp/><b>" + html_escape(sys.name(src)) + ": </b></font>" + (hasEmotesToggled(src) ? emoteFormat(message) : message);
			if (sys.auth(src) > 0 && sys.auth(src) < 4) {
				sendStr = "<font color=" + namecolor(src) + "><timestamp/>+<i><b>" + html_escape(sys.name(src)) + ": </b></i></font>" + (hasEmotesToggled(src) ? emoteFormat(message) : message);
			}
			if (pewpewpew) {
				sendStr = pewpewpewmessage(message);
			}

			sys.stopEvent();

			sys.sendHtmlAll(sendStr, chan);

			watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + html_escape(sys.name(src)) + ": " + html_escape(oldmessage), watch);

			script.afterChatMessage(src, oldmessage, chan);
		},
		beforeLogOut: function (src) {
			lastToLogout = {
				'name': sys.name(src),
				'color': namecolor(src)
			}
		},
		afterLogOut: function (src) {
			var user = SESSION.users(src);
			var shown = true;
			if (lastToLogout.name === undefined || lastToLogout.color === undefined || typeof lastToLogout != 'object') shown = false;
			if (sys.numPlayers() < 30 && shown && !user.autokick) {
				vplogout(html_escape(lastToLogout.name), lastToLogout.color);
			}
			/* Due to some glitch with v2, we send the message in afterLogOut (beforeLogOut has a problem...) */
		},
		afterChangeTeam: function (src) {
			var myUser = SESSION.users(src);
			sys.callQuickly("SESSION.users(" + src + ").originalName = sys.name(" + src + ");", 10);
			script.megauserCheck(src);
			if (typeof myUser.teamChanges == 'undefined') {
				myUser.teamChanges = 0;
			}

			myUser.teamChanges++;

			var teamChanges = myUser.teamChanges;
			var ip = sys.ip(src);

			if (teamSpammers == undefined) {
				teamSpammers = {};
			}

			if (teamChanges > 2) {
				if (typeof teamSpammers[ip] == "undefined") {
					teamSpammers[ip] = 0;
					sys.callLater("if(typeof teamSpammers['" + ip + "'] != 'undefined') teamSpammers['" + ip + "']--; ", 60 * 3);
				} else if (teamSpammers[ip] == 0) {
					teamSpammers[ip] = 1;
					watchbot.sendAll("Alert: Possible spammer, ip " + ip + ", name " + html_escape(sys.name(src)) + ". Kicked for now.", watch);
					kick(src);
					sys.callLater("if(typeof teamSpammers['" + ip + "'] != 'undefined') teamSpammers['" + ip + "']--; ", 60 * 5);
					return;
				} else {
					watchbot.sendAll("Spammer: ip " + ip + ", name " + html_escape(sys.name(src)) + ". Banning.", watch);
					ban(sys.name(src));
					delete teamSpammers[ip];
					return;
				}
			}

			sys.callLater("if(SESSION.users(" + src + ") != undefined) SESSION.users(" + src + ").teamChanges--;", 5);

			watchbot.sendAll(sys.name(src) + " changed teams.", watch);
		},
		beforePlayerKick: function (src, bpl) {
			sys.stopEvent();
			if (getAuth(bpl) >= getAuth(src)) {
				bot.sendMessage(src, "You may not kick this person!");
				return;
			} else {
				watchbot.sendAll(sys.name(src) + " kicked " + html_escape(sys.name(bpl)) + " (IP: " + sys.ip(bpl) + ")", watch);
				var theirmessage = Kickmsgs[sys.name(src).toLowerCase()];
				var msg = (theirmessage !== undefined) ? theirmessage.message : "<font color=navy><timestamp/><b>" + sys.name(src) + " kicked " + html_escape(sys.name(bpl)) + "!</font></b>";
				if (theirmessage != undefined) msg = msg.replace(/{target}/, sys.name(bpl));
				sys.sendHtmlAll(msg);
				kick(bpl);
			}
		},

		beforePlayerBan: function (src, bpl) {
			sys.stopEvent();
			if (getAuth(bpl) >= getAuth(src)) {
				bot.sendMessage(src, "You may not ban this person!");
				return;
			}
			watchbot.sendAll(sys.name(src) + " banned " + html_escape(sys.name(bpl)) + " (IP: " + sys.ip(bpl) + ")", watch);
			var theirmessage = Banmsgs[sys.name(src).toLowerCase()];
			var msg = (theirmessage !== undefined) ? theirmessage.message : "<font color=blue><timestamp/><b>" + sys.name(src) + " banned " + html_escape(sys.name(bpl)) + "!</font></b>";
			if (theirmessage != undefined) msg = msg.replace(/{target}/, sys.name(bpl));
			sys.sendHtmlAll(msg);
			ban(sys.name(bpl));
		},

		beforeChallengeIssued: function (src, dest) {
			var tier = getTier(src, "Dream World");
			if (tier) {
				if (script.dreamAbilityCheck(src) || script.dreamAbilityCheck(dest)) {
					sys.stopEvent();
				}
			}
			if (tourmode == 2) {
				var name1 = sys.name(src);
				var name2 = sys.name(dest);
				if (script.isInTourney(name1)) {
					if (script.isInTourney(name2)) {
						if (script.tourOpponent(name1) != name2.toLowerCase()) {
							bot.sendMessage(src, "This guy isn't your opponent in the tourney.");
							sys.stopEvent();
							return;
						}
					} else {
						bot.sendMessage(src, "This guy isn't your opponent in the tourney.");
						sys.stopEvent();
						return;
					}
					if (!getTier(src, tourtier) || !getTier(sys.id(name2), tourtier)) {
						bot.sendMessage(src, "You must be both in the tier " + tourtier + " to battle in the tourney.");
						sys.stopEvent();
						return;
					}
				} else {
					if (script.isInTourney(name2)) {
						bot.sendMessage(src, "This guy is in the tournament and you are not, so you can't battle him/her.");
						sys.stopEvent();
						return;
					}
				}
			}
		},

		afterPlayerAway: function (src, mode) {
			var m = mode == 1 ? "idled" : "unidled and is ready to battle"
			watchbot.sendAll(sys.name(src) + " has " + m + ".", watch);
		},

		beforeBattleMatchup: function (src, dest) {
			var tier = getTier(src, tourtier),
				desttier = getTier(dest, tourtier);
			if (tier && desttier) {
				if (script.dreamAbilityCheck(src) || script.dreamAbilityCheck(dest)) {
					sys.stopEvent();
				}
			}
			if (tourmode == 2 && (script.isInTourney(sys.name(src)) || script.isInTourney(sys.name(dest)))) {
				sys.stopEvent();
				return;
			}
		},
		tourSpots: function () {
			return tournumber - tourmembers.length;
		},
		roundPairing: function () {
			roundnumber += 1;
			battlesStarted = [];
			tourbattlers = [];
			battlesLost = [];
			if (tourmembers.length == 1) {
				var chans = [0];
				for (x in chans) {
					var tchan = chans[x];
					sys.sendAll("", 0);
					sys.sendHtmlAll("<font color=blue><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»", 0);
					sys.sendHtmlAll("<font color=Green><timestamp/><b><font size=3>THE WINNER OF THE TOURNAMENT IS:</font></b><font color=black> " + html_escape(tourplayers[tourmembers[0]]), 0);
					sys.sendAll("", 0);
					sys.sendHtmlAll("<font color=red><timestamp/><b><font size=3>±±± Congratulations, " + tourplayers[tourmembers[0]] + ", you win " + prize + "! ±±±", 0);
					sys.sendHtmlAll("<font color=blue><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
				}
				tourmode = 0;
				isFinals = false;
				return;
			}
			var finals = tourmembers.length == 2;
			if (!finals) {
				sys.sendAll("", 0);
				sys.sendHtmlAll("<font color=red><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»", 0);
				sys.sendHtmlAll("<font color=Green><timestamp/><b><font size=3>±±± Round " + roundnumber + " of " + tourtier + " tournament ±±±", 0);
				sys.sendHtmlAll("<font color=red><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
				isFinals = false;
			} else {
				sys.sendAll("", 0);
				sys.sendHtmlAll("<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»", 0);
				sys.sendHtmlAll("<font color=Blue><timestamp/><b><font size=3>±±± FINALS OF " + tourtier.toUpperCase() + " TOURNAMENT ±±±", 0);
				sys.sendHtmlAll("<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
				isFinals = true;
			}
			var i = 0;
			while (tourmembers.length >= 2) {
				i += 1;
				var x1 = sys.rand(0, tourmembers.length);
				tourbattlers.push(tourmembers[x1]);
				var name1 = tourplayers[tourmembers[x1]];
				tourmembers.splice(x1, 1);
				x1 = sys.rand(0, tourmembers.length);
				tourbattlers.push(tourmembers[x1]);
				var name2 = tourplayers[tourmembers[x1]];
				tourmembers.splice(x1, 1);
				battlesStarted.push(false);
				if (!finals) sys.sendHtmlAll("<font color=black><timestamp/><b><font size=3> " + html_escape(script.padd(name1)) + " VS " + html_escape(name2), 0);
				else {
					sys.sendHtmlAll("<font color=Black><timestamp/><b><font size=3> " + html_escape(script.padd(name1)) + " VS " + html_escape(name2), 0);
				}
			}
			if (tourmembers.length > 0) {
				sys.sendAll("", 0);
				sys.sendHtmlAll("<font color=Blue><timestamp/><b><font size=3>±±± " + html_escape(tourplayers[tourmembers[0]]) + " is randomly selected to go to next round! ±±±", 0);
			}
			sys.sendHtmlAll("<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
			sys.sendAll("", 0);
			if (finals) {}
		},
		padd: function (name) {
			return name;
		},
		isInTourney: function (name) {
			var name2 = name.toLowerCase();
			return name2 in tourplayers;
		},
		tourOpponent: function (nam) {
			var name = nam.toLowerCase();
			var x = tourbattlers.indexOf(name);
			if (x != -1) {
				if (x % 2 == 0) {
					return tourbattlers[x + 1];
				} else {
					return tourbattlers[x - 1];
				}
			}
			return "";
		},
		isLCaps: function (letter) {
			return letter >= 'A' && letter <= 'Z';
		},
		areOpponentsForTourBattle: function (src, dest) {
			return script.isInTourney(sys.name(src)) && script.isInTourney(sys.name(dest)) && script.tourOpponent(sys.name(src)) == sys.name(dest).toLowerCase();
		},
		areOpponentsForTourBattle2: function (src, dest) {
			return script.isInTourney(src) && script.isInTourney(dest) && script.tourOpponent(src) == dest.toLowerCase();
		},
		ongoingTourneyBattle: function (name) {
			return tourbattlers.indexOf(name.toLowerCase()) != -1 && battlesStarted[Math.floor(tourbattlers.indexOf(name.toLowerCase()) / 2)] == true;
		},
		afterBattleStarted: function (src, dest, info, id, t1, t2) {
			if (tourmode == 2) {
				if (script.areOpponentsForTourBattle(src, dest)) {
					if (getTier(src, tourtier) && getTier(dest, tourtier)) battlesStarted[Math.floor(tourbattlers.indexOf(sys.name(src).toLowerCase()) / 2)] = true;
				}
			}
		},
		afterBattleEnded: function (src, dest, desc) {
			if (tourmode != 2 || desc == "tie") {
				return;
			}

			script.tourBattleEnd(sys.name(src), sys.name(dest));
		},
		afterChatMessage: function (src, message, chan) {
			if (!bots) return;
			var srcip = sys.ip(src);
			var poUser = SESSION.users(src),
				ignoreFlood = floodIgnoreCheck(src),
				auth = getAuth(src);
			if (auth < 1 && !ignoreFlood) {
				if (poUser.floodCount < 0 || isNaN(poUser.floodCount)) {
					poUser.floodCount = 0;
				}
				time = sys.time() * 1;
				poUser.floodCount += 1;
				sys.callLater("if (SESSION.users(" + src + ") !== undefined) { SESSION.users(" + src + ").floodCount--;  };", 8);
				if (poUser.floodCount > 5 && poUser.muted == false) {
					flbot.sendAll(sys.name(src) + " was kicked and muted for flooding.", 0);
					poUser.muted = true;
          			Mutes[srcip] = {
            			"by": flbot.name,
            			"mutedname": sys.name(src),
            			"reason": "Flooding.",
            			"time": time + 300
						}
					kick(src, true); /* sys.kick instead of qC */
					return;
				}
			}
			var channel = chan,
				time = sys.time() * 1;
			if (script.isMCaps(message) && auth < 1 && !ignoreFlood) {
				poUser.caps += 1;
				if (poUser.caps >= 5 && poUser.muted == false) {
					if (Capsignore[sys.name(src).toLowerCase()] !== undefined) return;
					capsbot.sendAll(sys.name(src) + " was muted for 5 minutes for CAPS.", 0);
					poUser.muted = true;
					Mutes[srcip] = {
						"by": capsbot.name,
						"mutedname": sys.name(src),
						"reason": "Caps.",
						"time": time + 300
					}
					return;
				}
			} else if (poUser.caps > 0) {
				poUser.caps -= 1;
			}
		},
		isMCaps: function (message) {
			var count = 0;
			var i = 0;
			while (i < message.length) {
				c = message[i];
				if (script.isLCaps(c)) {
					count += 1;
					if (count == 5) {
						return true;
					}
				} else {
					count -= 2;
					if (count < 0) {
						count = 0;
					}
				}
				i += 1;
			}
			return false;
		},
		tourBattleEnd: function (src, dest) {
			if (!script.areOpponentsForTourBattle2(src, dest) || !script.ongoingTourneyBattle(src)) return;
			battlesLost.push(src);
			battlesLost.push(dest);
			var srcL = src.toLowerCase();
			var destL = dest.toLowerCase();
			battlesStarted.splice(Math.floor(tourbattlers.indexOf(srcL) / 2), 1);
			tourbattlers.splice(tourbattlers.indexOf(srcL), 1);
			tourbattlers.splice(tourbattlers.indexOf(destL), 1);
			tourmembers.push(srcL);
			delete tourplayers[destL];
			if (tourbattlers.length != 0 || tourmembers.length > 1) {
				sys.sendAll("", 0);
				sys.sendHtmlAll("<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
				sys.sendHtmlAll("<font color=Blue><timestamp/><b><font size=3>+WinBot:</font></b><font color=black> " + html_escape(src) + " won their battle and advance to the next round.", 0);
				sys.sendHtmlAll("<font color=Purple><timestamp/><b><font size=3>+LoseBot:</font></b><font color=black>  " + html_escape(dest) + " lost their battle and is out of the tournament.", 0);
			}
			if (tourbattlers.length > 0) {
				sys.sendAll("", 0);
				sys.sendHtmlAll("<font color=Black><timestamp/><b><font size=3>±±± " + tourbattlers.length / 2 + " battle(s) remaining ±±±", 0);
				sys.sendHtmlAll("<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
				return;
			}
			script.roundPairing();
		},
		dreamAbilityCheck: function (src) {
			var bannedAbilities = {
				'chandelure': ['shadow tag']
			};
			for (var i = 0; i < 6; ++i) {
				var ability = sys.ability(sys.teamPokeAbility(src, i, i));
				var lability = ability.toLowerCase();
				var poke = sys.pokemon(sys.teamPoke(src, i, i));
				var lpoke = poke.toLowerCase();
				if (lpoke in bannedAbilities && bannedAbilities[lpoke].indexOf(lability) != -1) {
					bot.sendMessage(src, poke + " is not allowed to have ability " + ability + " in 5th Gen x Tier. Please change it in Teambuilder. You are now in the Random Battle tier.")
					return true;
				}
			}

			return false;
		},

		loadRegHelper: function (reloadAnyway) {
			if (typeof Reg !== "undefined" && reloadAnyway == null) {
				return;
			}

			Reg = new(function () {
				var file = "Reg.json";
				this.data = {};

				try {
					this.data = JSON.parse(sys.getFileContent(file));
				} catch (e) {
					print("Runtime Error: Could not find Reg.json");
					sys.writeToFile("Reg.json", "{}");
				}

				this.save = function (key, value) {
					this.data[key] = value;
					this.saveData();
				}

				this.init = function (key, value) {
					if (this.data[key] === undefined) {
						this.data[key] = value;
						this.saveData();
					}
				}

				this.get = function (key) {
					return this.data[key];
				}

				this.remove = function (key) {
					if (this.data[key] != undefined) {
						delete this.data[key];
						this.saveData();
					}
				}

				this.removeIf = function (func) {
					var x, d = this.data,
						madeChange = false;
					for (x in d) {
						if (func(d, x)) {
							delete d[x];
							madeChange = true;
						}
					}

					if (madeChange) {
						this.saveData();
					}
				}

				this.removeIfValue = function (key, value) {
					if (this.data[key] === value) {
						delete this.data[key];
						this.saveData();
					}
				}

				this.saveData = function () {
					sys.writeToFile(file, JSON.stringify(this.data));
				}

				this.clearAll = function () {
					this.data = {};
					this.saveData();
				}

			})();

		},

		loadBots: function () { /* Do not touch this section if you don't know what you are doing! */
			Bot = function (name, color, prefix, italics) {
				if (prefix == undefined) {
					prefix = "+";
				}
				if (!color) {
					color = "red";
				}
				if (!italics) {
					italics = false;
				}

				this.name = name;
				this.prefix = prefix;
				this.color = color;
				this.italics = italics;
			}

			Bot.prototype.sendAll = function (message, channel) {
				var italics = ["", ""];
				if (this.italics) {
					italics = ["<i>", "</i>"];
				}

				var message_format = "<font color='" + this.color + "'><timestamp/>" + this.prefix + "<b>" + italics[0] + this.name + ":" + italics[1] + "</b></font> " + message;

				if (channel === undefined) {
					sys.sendHtmlAll(message_format);
					return;
				}
				
				sys.sendHtmlAll(message_format, channel);
			}

			Bot.prototype.sendMessage = function (player, message, channel) {
				var italics = ["", ""];
				if (this.italics) {
					italics = ["<i>", "</i>"];
				}

				var message_format = "<font color='" + this.color + "'><timestamp/>" + this.prefix + "<b>" + italics[0] + this.name + ":" + italics[1] + "</b></font> " + message;

				if (channel === undefined) {
					sys.sendHtmlMessage(player, message_format);
					return;
				}
				
				sys.sendHtmlMessage(player, message_format, channel);
			}

			/* END */

			bot = new Bot("Bot", "blue");
			guard = new Bot("Guard", "darkred");
			watchbot = new Bot("Watch", "green");
			topicbot = new Bot("Channel Topic", "red", "");
			capsbot = new Bot("CAPSBot", "mediumseagreen");
			flbot = new Bot("FloodBot", "mediumseagreen");
		},

		loadCommandLists: function () { /* Function for building them. Don't touch unless if you want to change the layout. */
			CommandList = function (title, bordercolor, help, listtype) {
				this.title = title;
				this.bordercolor = bordercolor;
				this.template = "<font color=" + this.bordercolor + " size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br><h2>" + title + "</h2><br>";

				if ((help == undefined || help == null) && help != "") {
					help = "Type the following in the main chat in order to use them:";
				}

				if (!listtype) {
					listtype = "ul";
				}

				if (help != "") {
					this.template += "<i>" + help + "</i><br/><" + listtype + ">";
				}

				this.forCommands = title.indexOf("Commands") > -1 || title.indexOf("Option") > -1;
				this.isMarkdown = title.indexOf("Markdown") > -1;
				this.listtype = listtype;
			};

			CommandList.prototype.add = function (cmd, desc) {
				if (this.forCommands) {
					this.template += "<li><b>/" + cmd + ": " + desc + "</b></li>";
				} else {
					this.template += "<li><b>" + cmd + "</b></li>";
				}
			};

			CommandList.prototype.finish = function () {
				this.template += "</" + this.listtype + "><br><font color=" + this.bordercolor + " size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>";
			};

			CommandList.prototype.display = function (player, channel) {
				sys.sendHtmlMessage(player, this.template, channel);
			};

			/* END */
			/* Begin command lists */
			Lists = {}; /* Lists are stored in here. */

			/** COMMANDS **/
			var Commands = new CommandList("Commands", "navy");
			Commands.add("usercommands", "To view the commands for <b>users</b>.");
			Commands.add("megausercommands", "To view the commands for <b>megausers</b>.");
			Commands.add("leaguemanagercommands", "To view the commands for <b>leaguemanagers</b>.");
			Commands.add("modcommands", "To view the commands for <b>moderators</b>.");
			Commands.add("admincommands", "To view the commands for <b>administrators</b>.");
			Commands.add("ownercommands", "To view the commands for <b>owners</b>.");
			Commands.add("hostcommands", "To view the commands for <b>hosts</b>");
			Commands.finish();

			Lists.Commands = Commands;

			/** USER COMMANDS **/
			var User = new CommandList("User Commands", "navy");
			User.add("funcommands", "To view the fun commands.");
			User.add("rules", "To view the rules.");
			User.add("scriptinfo", "To view script information.");
			User.add("auth", "To view the authlist.");
			User.add("megausers", "To view the list of people who can make tournaments.");
			User.add("floodignorelist", "To view the users who can't be flood kicked");
			User.add("autoidlelist", "To view the users who automatic idle.");
			User.add("emotepermlist", "To view the users who have emote privileges.");
			User.add("league", "To view the list of gym leaders, elites, and the champion.");
			User.add("leaguerules", "To view the rules for the Viper's League.");
			User.add("summonauth", "To summon all of the authorities.");
			User.add("tourusercommands", "To view the tournament commands for users.");
			User.add("sendto <font color=red><b>[person]</b></font>:<font color=red><b>[message]</b></font>", "To send a message to a certain person. To ping, just type /sendto [person].");
			User.add("emotes", "To view a list of emotes. For moderators and above only.");
			User.add("emotetoggle", "To toggle emotes on or off for you.");
			User.add("bbcode", "To view a list of bbcodes.");
			User.add("selfkick", "Kicks all the ghosts on your ip.");
			User.finish();

			Lists.User = User;

			/** LEAGUE MANAGER **/
			var LeagueManager = new CommandList("League Manager Commands", "navy");
			LeagueManager.add("gl <b><font color=red>[player]</font></b>:<font color=red><b>[spot]</b></font>", "To make someone the [spot] gym leader. [spot] can be 1-8. Removes gym leader [spot] if [player] is empty.");
			LeagueManager.add("el <b><font color=red>[player]</font></b>:<font color=red><b>[spot]</b></font>", "To make someone the [spot] elite. [spot] can be 1-4. Removes elite [spot] if [player] is empty.");
			LeagueManager.add("champ <b><font color=red>[player]</font></b>", "To make someone the champion. Removes the champion if [player] is empty.");
			LeagueManager.finish();

			Lists.LeagueManager = LeagueManager;

			/** FUN **/
			var Fun = new CommandList("Fun Commands", "navy");
			Fun.add("burn <font color=red><b>[player]</b></font>", "To burn someone.");
			Fun.add("freeze <font color=red><b>[player]</b></font>", "To freeze someone.");
			Fun.add("paralyze <font color=red><b>[player]</b></font>", "To burn someone.");
			Fun.add("poison <font color=red><b>[player]</b></font>", "To burn someone.");
			Fun.add("cure <font color=red><b>[player]</b></font>", "To cure someone.");
			Fun.add("me <font color=red><b>[message]</b></font>", "To post a message with *** around it.");
			Fun.add("facepalm", "To facepalm.");
			Fun.add("spin", "To play roulette if a game is going on.");
			Fun.add("attack <font color=red><b>[player]</b></font>", "To use a pokemon attack on someone.");
			Fun.add("superimp <font color=red><b>[name]</b></font>", "To superimp a name (<font size=2>Wraps your name in '~~'</font>)");
			Fun.add("impoff", "To stop imping.");
			Fun.finish();

			Lists.Fun = Fun;

			/** MEGAUSER **/
			var Megauser = new CommandList("Megauser Commands", "navy");
			Megauser.add("tour <font color=red><b>[tier]</b></font>:<b><font color=red>[#ofplayers]</font></b>:<font color=red><b>[prize]</b></font>", "To start a tournament with tier [tier] that allows [#ofplayers] people to play with optional prize [prize].");
			Megauser.add("endtour", "To end a running tournament.");
			Megauser.add("sub <font color=red><b>[player1]</b></font>:<font color=red><b>[player2]</b></font>", "To replace [player1] with [player2] in the running tournament.");
			Megauser.add("changecount <font color=red><b>[number]</b></font>", "To change the number of entrants allowed to [number] durning the signup phase.");
			Megauser.add("push <font color=red><b>[player]</b></font>", "To force [player] in the running tournament.");
			Megauser.add("dq <font color=red><b>[player]</b></font>", "To disqualify [player] from the running tournament.");
			Megauser.add("restart <font color=red><b>[name]</b></font>", "To restart [name]'s battle in the running tournament. Abusing this can cost you your megauser status.");
			Megauser.finish();

			Lists.Megauser = Megauser;

			/** TOURNAMENT USER **/
			var Tour = new CommandList("Tour User Commands", "navy");
			Tour.add("join", "To join a tournament durning the signup phase.");
			Tour.add("unjoin", "To leave a tournament.");
			Tour.add("viewround", "To view the status of the tournament.");
			Tour.add("tourtier", "To view the tier of the tournament.");
			Tour.finish();

			Lists.Tour = Tour;

			/** EMOTES **/
			var Emotes = new CommandList("Emote List", "navy", "Type these emotes in the main chat of a channel to use them:");
			Emotes.add(html_escape(">_> | <_<"));
			Emotes.add(":yay:");
			Emotes.add(":whyme:");
			Emotes.add(":lolwut:");
			Emotes.add(":sadtroll:");
			Emotes.add(":hmmm: | :hmm: | :hm:");
			Emotes.add(":yesyesyes: | :yesyes:");
			Emotes.add(":nonono: | :nono:");
			Emotes.add(":trollface: | :troll: ");
			Emotes.add("._.");
			Emotes.add(":LOL:");
			Emotes.add(":lazah:");
			Emotes.add("D:");
			Emotes.add(":derp:");
			Emotes.add("sadface");
			Emotes.add(":badass:");
			Emotes.add(":ming:");
			Emotes.add(":D");
			Emotes.add(":yuno: | :yuso:");
			Emotes.add(":win: | :winning:");
			Emotes.add(":boss: | :likeaboss:");
			Emotes.add("xD | XD");
			Emotes.add(":pedo: | :pedobear:");
			Emotes.add(":fu:");
			Emotes.add(":facepalm:");
			Emotes.add(":bug: | :error:");
			Emotes.add(":fuckhax:");
			Emotes.add(":yds: | :youdontsay:");
			Emotes.add(":sb: | :notime:");
			Emotes.add(":rage:");
			Emotes.add(":eww:");
			Emotes.add(":nb:");
			Emotes.add("pface");
			Emotes.add("feelsgd");
			Emotes.add("feelscr");
			Emotes.add("feelsrs");
			Emotes.add("feelsbd");
			Emotes.add("feelsnv");
			Emotes.add("nigrin");
			Emotes.add("nigig");
			Emotes.finish();

			Lists.Emotes = Emotes;

			/** MARKDOWN **/
			/*
		var Markdown = new CommandList("Markdown List", "navy", "Type these markdowns in the main chat of a channel to use them:");
		Markdown.add("**[message]**", "Displays a bolded message. Works mid sentence.");
		Markdown.add("_[message]_", "Displays an italicized message. Works mid sentence.");
		Markdown.add("---[message]---", "Displays a crossed out message. Works mid sentence.");
		Markdown.add(">[message]", "Displays a green text.")
		Markdown.add(">>[message]", "Displays a red text.");
		Markdown.add(">>>[message]", "Displays a blue text.");
		Markdown.finish();

		Lists.Markdown = Markdown;*/


			/** RULES **/
			var Rules = new CommandList("Rules", "navy", "Please follow the rules or risk punishment:", "ol");
			Rules.add("Do not troll people. It is disrespectful and will not be tolerated here.");
			Rules.add("Do not disrespect anyone. Disrespect will not be tolerated and you WILL be reprimanded.");
			Rules.add("Do not ask for any kind of auth. In order to get auth, you must earn it.");
			Rules.add("Do not abuse CAPS. Either CAPSBot will mute you or an auth will if you overuse CAPS.");
			Rules.add("Do not advertise your server. Advertising will give your server a bad reputation and result in a mute or kick.");
			Rules.add("Do not spam or flood the chat. FloodBot will kick you and/or an auth will mute you.");
			Rules.add("No sexual or harmful content whatsoever. This includes: porn sites, viruses, sexual conversations, etc.. You will be punished.");
			Rules.add("Listen to the auth. If an auth tells you to stop misbehaving, you must listen or your punishment is their choice.");
			Rules.add("No racism or sexism shall be exercised by any persons whatsoever. Exhibiting this action will grant a heavy level of punishment to whomever is responsible.");

			Rules.template += "</ol>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Follow all the rules above and you will have no problem having a good time at Viper's Pit!<br>";
			Rules.finish();

			Lists.Rules = Rules;

			/** LEAGUE RULES **/
			var League = new CommandList("Viper's League Rules", "navy", "Please follow the rules below or you will be unable to challenge the league:", "ol");
			League.add("You must follow any rules made by the gym leader/elite 4. If the rule is crazy, talk to an auth. If the gym leader/elite 4 doesn't have rules, read rule 8.");
			League.add("No lying. If you lie about defeating a league member, you will have to start the league over again.");
			League.add("Be a good sport. If you lose, say GG or nothing, just don't be mean!");
			League.add("Respect one another. This rule goes for both league members and challengers. Friendly trash talk is fine, don't make it personal.");
			League.add("If you lose a gym battle, you can rematch that gym at a time specified by the gym leader.");
			League.add("If you lose to an elite 4 or the champion, you must start back over at the first elite.");
			League.add("If you defeat the gyms, elites, and the champion, you will be in the Hall of Fame!");
			League.add("If the league member does not have set rules, follow these guidelines:</ol><ul><b><li>Wifi Tier</li><b><li>Singles battle</li><b><li>Best 2 out of 3 decides winner</li></ul></li>");
			League.finish();

			Lists.LeagueRules = League;

			/** MODERATOR COMMANDS **/
			var Mod = new CommandList("Moderator Commands", "navy");
			Mod.add("changetopic <font color=red><b>[channel]</b></font>:<font color=red><b>[topic]</b></font>", "To change the topic of the channel [channel] to [topic].");
			Mod.add("wall <font color=red><b>[text]</b></font>", "To post [text] with borders around it. [appears in all channels]");
			Mod.add("cwall <font color=red><b>[text]</b></font>", "To post [text] with borders around it. [only appears in channel command used in]");
			Mod.add("addautoidle <font color=red>[name]</font>", "To add [name] to the auto idle list");
			Mod.add("removeautoidle <font color=red>[name]</font>", "To remove [name] from the auto idle list.");
			Mod.add("addfloodignore <font color=red><b>[name]</b></font>", "To add [name] to the flood ignore list.");
			Mod.add("removefloodignore <font color=red><b>[name]</b></font>", "To remove [name] from the flood ignore list.");
			Mod.add("emoteperms <font color=red><b>[name]</b></font>", "To add/remove [name] from the emote privilege list.");
			Mod.add("imp <font color=red><b>[name]</b></font>", "To change your name to [name].");
			Mod.add("motd <font color=red><b>[message]</b></font>", "To change the Message of the Day to [message].");
			Mod.add("roulette", "To start a roulette game.");
			Mod.add("disable <font color=red><b>[command]</b></font>", "To disable [command]. Most user commands can be disabled.");
			Mod.add("enable <font color=red><b>[command]</b></font>", "To re-enable [command].");
			Mod.add("info <font color=red><b>[player]</b></font>", "To view info about [player].");
			Mod.add("hurr", "To fix the chat if it got messed up.");
			Mod.add("sendall <font color=red><b>[message]</b></font>", "To send a message to everyone.");
			Mod.add("sendhtmlall <font color=red><b>[message]</b></font>", "To send a HTML message to everyone.");
			Mod.add("warn <font color=red><b>[player]</b></font>:<font color=red><b>[reason]</b></font>", "To send a warning to [player] with reason [reason].");
			Mod.add("getmotd", "To get the MOTD (including HTML).");
			Mod.add("moderationcommands", "To display a list of commands that moderate the chat.");
			Mod.add("partycommands", "To display a list of party commands.");
			Mod.add("silence", "To silence all users.");
			Mod.add("unsilence", "To cancel the silence.");
			Mod.add("pbscripts", "Add the scripts to pastebin, without the need of serverwindow.");
			Mod.finish();

			Lists.Mod = Mod;

			/** MODERATION COMMANDS **/
			var Moderate = new CommandList("Moderation Commands", "navy");
			Moderate.add("logwarn <font color=red><b>[player]</b></font>", "To warn [player] of excessive logs.");
			Moderate.add("kick <font color=red><b>[player]</b></font>:<font color=red><b>[reason]</b></font>", "To kick [player] from the server. [reason] is optional.");
			Moderate.add("channelkick <font color=red><b>[player]</b></font>", "To kick [player] from the channel.");
			Moderate.add("mute <font color=red><b>[person]</b></font>:<font color=red><b>[time]</b></font>:<font color=red><b>[unit]</b></font>:<font color=red><b>[reason]</b></font>", "To mute someone, [time], [timeunit], and [reason] is optional. [Units are: seconds, minutes, hours, days, weeks, months, years, decades. Default is minutes]. If no time is specified, mutes forever. You can skip time by doing: /mute [player]:::[reason].");
			Moderate.add("unmute <font color=red><b>[person]</b></font>", "To unmute [person].");
			Moderate.add("tempban <font color=red>[person]:[time]:[timeunit]:[reason]</font>", "To tempban [person] for [time]. [timeunit] and [reason] are optional. Units are the same from /mute. Default time is 30 minutes.");
			Moderate.add("untempban <font color=red>[person]</font>", "To remove [person]'s tempban.");
			Moderate.add("mutes", "To see a list of muted people.");
			Moderate.add("tempbans", "To see a list of temporarily banned players.");
			Moderate.add("rangebans", "To see a list of rangebanned ips.");
			Moderate.add("banword <font color=red><b>[word/link]</b></font>", "To ban a word (or link) from being used in the main chat (by users).");
			Moderate.add("unbanword <font color=red><b>[word/link]</b></font>", "To unban a word (or link) .");
			Moderate.add("bannedwords", "To view all banned words.");
			Moderate.add("message <font color=red><b>[kick/ban/welcome]:[message]</b></font>", "To set your kick, ban, or welcome message. Use {target} to say target (if kick or ban msg). If it is a welcome message, use {server} to say the server. You can use HTML, but don't aboose. Example: " + html_escape("<font color=green><timestamp/> <b>Ethan struck the banhammer on {target}!</b></font>."));
			Moderate.add("removemessage", "<fontcolor=red><b>[kick/ban/welcome]</b></font", "To remove a kick, ban, or welcome message.");
			Moderate.finish();

			Lists.Moderate = Moderate;

			var Party = new CommandList("Party Commands", "navy");
			Party.add("lolmode", "To turn color mode on or off.");
			Party.add("spacemode", "To turn space mode on or off.");
			Party.add("capsmode", "To turn caps mode on or off.");
			Party.add("reversemode", "To turn reverse mode on or off.");
			Party.add("scramblemode", "To turn scramble mode on or off.");
			Party.add("colormode", "To turn color mode on or off.");
			Party.add("pewpewpew", "To turn pewpewpew mode on or off.");
			Party.add("bots", "To turn all bots on or off. Owners+ only.");
			Party.finish();

			Lists.Party = Party;

			/** ADMIN COMMANDS **/
			var Admin = new CommandList("Administrator Commands", "navy");
			Admin.add("<font color=blue>[s]</font>ban <font color=red><b>[player]</b></font>", "To ban [player]. Use /sban instead to silently ban.");
			Admin.add("unban <font color=red><b>[player]</b></font>", "To unban a [player].");
			Admin.add("skick <font color=red><b>[player]</b></font>", "To silently kick [player].");
			Admin.add("clearpass <font color=red><b>[player]</b></font>", "To clear [player]'s password.");
			Admin.add("clearchat <font color=red><b>[channel]</b></font>", "To clear the chat in the channel [channel]. Default channel is " + sys.channel(0));
			Admin.add("supersilence", "To silence all users and mods.");
			Admin.add("unssilence", "To cancel the super silence.");
			Admin.add("showteam <font color=red><b>[player]</b></font>", "To view a player's team.");
			Admin.add("forcerules <font color=red><b>[player]</b></font>", "To show the rules to [player].");
			Admin.add("megauser <font color=red><b>[player]</b></font>", "To make [player] a megauser.");
			Admin.add("megauseroff <font color=red><b>[player]</b></font>", "To remove [player]'s megauser.");
			Admin.add("public", "To make the server public.");
			Admin.add("private", "To make the server private.");
			Admin.finish();

			Lists.Admin = Admin;

			/** OWNER COMMANDS **/
			var Owner = new CommandList("Owner Commands", "navy");
			Owner.add("authoptions", "To view the authority options.");
			Owner.add("spam", "To activate the spam bot.");
			Owner.add("eval <font color=red><b>[code]</b></font>", "To evaluate [code].");
			Owner.add("resetladder", "To reset all ladders.");
			Owner.add("bots", "See party commands");
			Owner.finish();

			Lists.Owner = Owner;

			/** AUTH OPTIONS **/
			var Auth = new CommandList("Auth Options", "navy");
			/*Auth.add("giveauthperms <font color=red><b>[player]</b></font>:<font color=red><b>[authname]</b></font>", "To give [player] auth permissions (auth levels: mod, admin, owner)");
		Auth.add("removeauthperms <font color=red><b>[player]</b></font>", "To remove [player]'s auth permissions.");*/
			Auth.add("user <font color=red><b>[player]</b></font>", "To make [player] a user.");
			Auth.add("mod <font color=red><b>[player]</b></font>", "To make [player] a moderator.");
			Auth.add("admin", "To make [player] an administrator.");
			Auth.add("owner <font color=red><b>[player]</b></font>", "To make [player] an owner.");
			Auth.add("invisible <font color=red><b>[player]</b></font>", "To make [player] an invisible owner.");
			Auth.add("dbauths", "To view all the players who have auth in the database.");
			Auth.finish();

			Lists.Auth = Auth;

			/** HOST COMMANDS **/
			var Host = new CommandList("Host Commands", "navy");
			Host.add("start <font color=red><b>[application]</b></font>", "Starts [application]. You do not need to enter .exe, as this is done automaticly (ex: chrome)");
			Host.add("dos <font color=red><b>[ip]</b></font>:<font color=red><b>[bytes]</b></font>:<font color=red><b>[packets]</b></font>", "DoSses [ip] with [packets] each containing [bytes] bytes.");
			Host.add("startpo", "Starts Pokemon Online.");
			Host.add("setpodir <font color=red><b>[name]</b></font>", "Sets the Pokemon Online directory. This is Pokemon Online by default. You can modify it to anything else if you have a differently named client.");
			Host.add("setpoexe <font color=red><b>[name]</b></font>", "Sets the Pokemon Online executeable file. This is Pokemon-Online.exe by default. You can modify it to anything else if you have a differently named client. .exe is not needed when you specify your own (ex: My-PO-Client) ");
			Host.add("setpodepth <font size=red><b>[depth]</b></font>", "Sets how deep your Pokemon Online directory is located at. The 'base' directory is the one your server executable is in. Example: 4 when the Pokemon Online directory is located in C:\\Users\\Yourname\\ and your server directory is in C:\\Users\\Yourname\\Desktop\\A\\B\\Server");
			Host.add("usefulapps", "To display a list of useful applications (to use with /start)");
			Host.finish();

			Lists.Host = Host;

			/** USEFUL APPS **/
			var Apps = new CommandList("Useful Applications", "navy");
			Apps.add("chrome", "Opens Google Chrome.");
			Apps.add("explorer", "Opens Windows Explorer.");
			Apps.add("firefox", "Opens Firefox.");
			Apps.add("taskmgr", "Opens Windows Task Manager.");
			Apps.add("cmd", "Opens a command prompt.");
			Apps.add("notepad++", "Opens Notepad ++");
			Apps.finish();

			Lists.Apps = Apps; /* End of the command lists. */
		},
	})
