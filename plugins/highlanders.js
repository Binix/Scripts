var hlr = {
    version: '0.0.1',

    maintainers: ['TheUnknownOne'],

    isMaintainer: function (id) {
        return hlr.maintainers.indexOf(hlr.nameOf(id)) > -1;
    },

    channame: "Highlanders",
    chan: -1,

    // Constants
    VERBOSE: false,
    SILENT: true
};

hlr.chan = sys.createChannel(hlr.channame) || sys.channelId(hlr.channame);
hlr._uniqItemId = {id: 0, dirty: false, file: ".hlruniqitemid"};

if (!sys.fileExists(hlr._uniqItemId.file)) {
    sys.writeToFile(hlr._uniqItemId.file, "0");
}

hlr._uniqItemId.id = parseInt(sys.getFileContent(hlr._uniqItemId.file));

hlr.uniqItemId = function () {
    var id = hlr._uniqItemId.id;
    hlr._uniqItemId.id += 1;
    hlr._uniqItemId.dirty = true;
    return id;
};
// Generated by CoffeeScript 1.7.1
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

hlr.commands = {};

hlr.canUseCommand = function(src, command, chan) {
  if (command === 'hlrcommands') {
    return true;
  }
  if (chan !== hlr.chan) {
    return false;
  }
  if (!hlr.commands.hasOwnProperty(command)) {
    return false;
  }
  command = hlr.commands[command];
  if (command.auth === 'registered') {
    if (hlr.player.registered(src)) {
      return true;
    } else {
      throw "In order to use this command, you must first <a href='po:send//register'>Create a Highlanders account</a>, or change to an existing account.";
    }
  }
  if (command.auth === 'maintainer') {
    return hlr.isMaintainer(src);
  }
  return true;
};

hlr.handleCommand = function(src, message, command, commandData, tar, chan) {
  return hlr.commands[command].handler.call({
    src: src,
    command: command,
    commandData: commandData,
    tar: tar,
    chan: chan,
    message: message
  });
};

hlr.addCommand = function(name, handler, auth) {
  var n, _i, _len, _results;
  if (auth == null) {
    auth = '';
  }
  if (!Array.isArray(name)) {
    name = name.split(" ");
  }
  _results = [];
  for (_i = 0, _len = name.length; _i < _len; _i++) {
    n = name[_i];
    _results.push(hlr.commands[n] = {
      name: name,
      handler: handler,
      auth: auth
    });
  }
  return _results;
};

hlr.authRegistered = 'registered';

hlr.authMaintainer = 'maintainer';

hlr.addCommands = function() {
  var addCommand, maintainer, registered;
  addCommand = hlr.addCommand, maintainer = hlr.authMaintainer, registered = hlr.authRegistered;
  addCommand('hlrcommands', function() {
    return hlr.commandList("Highlanders Commands").add([["register", "Registers a Highlanders account for this name. The account is bound to your name, not your IP."], ["unregister", "Deletes your Highlanders account. This command will be removed in the future."], ["location", "Shows your current location. Aliases: l, loc"], ["inventory", "Shows your inventory and your balance. Aliases: inv, i"], ["go", "Go to that location. Aliases: g, goto", ["location"]], ["fish", "Fish in locations that allow it. Also used to choose your rod toss direction. Aliases: fi", ["direction"]]]).finish().display(this.src, this.chan);
  });
  addCommand('register', function() {
    if (hlr.player.registered(this.src)) {
      hlr.sendErrorTo(this.src, "Your account is already registered.");
      return;
    }
    if (!sys.dbRegistered(sys.name(this.src))) {
      hlr.sendErrorTo(this.src, "Your PO username must be registered before you make a Highlanders account.");
      return;
    }
    hlr.player.register(this.src);
    hlr.sendTo(this.src, "Account registered!");
    hlr.player.giveMoney(this.src, 100);
    return hlr.player.goto(this.src, 'market');
  });
  addCommand('unregister', function() {
    if (!hlr.player.registered(this.src)) {
      hlr.sendErrorTo(this.src, "You don't have an account registered.");
      return;
    }
    hlr.player.unregister(this.src);
    return hlr.sendTo(this.src, "Account unregistered!");
  });
  addCommand(['inventory', 'inv', 'i'], function() {
    return hlr.player.showInventory(this.src);
  }, registered);
  addCommand(['location', 'loc', 'l'], function() {
    return hlr.player.sendLocationInfo(this.src);
  }, registered);
  addCommand(['go', 'g', 'goto'], function() {
    var loc, maygo, player, ploc;
    loc = this.commandData.toLowerCase().trim();
    player = hlr.player.player(this.src);
    ploc = player.location;
    if (loc === ploc) {
      hlr.sendErrorTo(this.src, "You are already there!");
      return;
    }
    maygo = hlr.location(ploc).to;
    if (!(__indexOf.call(maygo, loc) >= 0)) {
      hlr.sendErrorTo(this.src, "You can't go there, sorry.");
      return;
    }
    return hlr.player.goto(this.src, loc);
  }, registered);
  addCommand(['fish', 'fi'], function() {
    var direction, fdir, id, lobj, player, sess, setCooldown, src, token;
    src = this.src;
    player = hlr.player.player(src);
    sess = hlr.player.session(src);
    lobj = hlr.location(player.location);
    if (lobj.type !== hlr.Location.FishArea) {
      hlr.sendErrorTo(src, "You can't fish here!");
      return;
    }
    if (sess.fishing == null) {
      sess.fishing = {};
    }
    if (!sess.fishing.fishing && sess.fishing.cooldown > sys.time()) {
      hlr.sendErrorTo(this.src, "Slow down, cowboy.");
      return;
    }
    direction = this.commandData.toLowerCase().trim();
    if (sess.fishing.fishing && !direction) {
      hlr.sendErrorTo(src, "You're already fishing!");
      return;
    } else if (!sess.fishing.fishing && direction) {
      hlr.sendErrorTo(src, "To what fish?");
      return;
    }
    if (sess.fishing.fishing && !(direction === 'left' || direction === 'center' || direction === 'right')) {
      hlr.sendErrorTo(src, "You can only go throw your fishing rod to the left, center, or right.");
      return;
    }
    token = Math.random().toString() + Math.random().toString();
    setCooldown = function(ses) {
      if (ses == null) {
        ses = sess;
      }
      return ses.fishing.cooldown = sys.time() + 2;
    };
    if (sess.fishing.fishing) {
      if (direction === sess.fishing.direction) {
        hlr.sendTo(src, "You caught the " + (hlr.item(sess.fishing.fish).name) + "!");
        id = hlr.player.giveItem(src, sess.fishing.fish)[0];
        hlr.player.sendQuicksellInfo(src, id);
      } else {
        fdir = sess.fishing.direction;
        hlr.sendTo(src, "The " + (hlr.item(sess.fishing.fish).name) + " " + (fdir === 'center' ? 'stayed put' : 'went ' + fdir) + ", it didn't " + (direction === 'center' ? 'stay put' : 'go ' + direction) + "! Better luck <a href='po:send//fish'>next time</a>...");
      }
      sess.fishing.fishing = false;
      sess.fishing.token = '';
      return setCooldown();
    } else {
      if (Math.random() < lobj.fishFailChance) {
        hlr.sendTo(src, "You didn't find anything.");
        setCooldown();
        return;
      }
      sess.fishing.fishing = true;
      sess.fishing.token = token;
      sess.fishing.fish = Utils.randomSample(lobj.fish);
      sess.fishing.direction = Utils.randomSample({
        left: 1 / 3,
        center: 1 / 3,
        right: 1 / 3
      });
      hlr.sendTo(src, "You found " + (hlr.an(hlr.item(sess.fishing.fish).name)) + "! Catch it quickly! Throw your rod in one of these directions:");
      hlr.sendTo(src, "<a href='po:send//fish left'>[Left]</a> <a href='po:send//fish center'>[Center]</a> <a href='po:send//fish right'>[Right]</a>");
      return sys.setTimer(function() {
        var session;
        if (!sys.loggedIn(src)) {
          return;
        }
        session = hlr.player.session(src);
        if (!session.fishing) {
          return;
        }
        if (session.fishing.token === token) {
          hlr.sendTo(src, "Too slow! The " + (hlr.item(sess.fishing.fish).name) + " escaped!");
          session.fishing.fishing = false;
          return setCooldown(session);
        }
      }, 7 * 1000, false);
    }
  }, registered);
  addCommand('sell', function() {
    var iobj, item, itemid, player, price, sess, src;
    src = this.src;
    player = hlr.player.player(src);
    sess = hlr.player.session(src);
    itemid = parseInt(this.commandData, 10);
    if (!(itemid in player.inventory)) {
      return;
    }
    if (hlr.location(player.location).type !== hlr.Location.SellArea) {
      hlr.sendErrorTo(src, "You cannot sell items in " + (hlr.location(player.location).name) + " for full price, instead, go to a marketplace.");
      return;
    }
    item = player.inventory[itemid];
    iobj = hlr.item(item);
    price = iobj.sell;
    if (!price) {
      hlr.sendErrorTo(src, "Your " + iobj.name + " cannot be sold.");
      return;
    }
    if (sess.sell == null) {
      sess.sell = {};
    }
    if (sess.sell.selling) {
      hlr.sendErrorTo(src, "You haven't sold your item yet!");
      return;
    }
    sess.sell.selling = true;
    hlr.sendTo(src, "Selling your " + iobj.name + " (3)...");
    return sys.setTimer(function() {
      hlr.player.takeItem(src, itemid, hlr.SILENT);
      hlr.player.giveMoney(src, price, hlr.SILENT);
      hlr.sendTo(src, "You sold your " + iobj.name + " for " + (hlr.currencyFormat(price)) + "!");
      return sess.sell.selling = false;
    }, 3 * 1000, false);
  }, registered);
  addCommand('quicksell', function() {
    var iobj, item, itemid, player, price;
    player = hlr.player.player(this.src);
    itemid = parseInt(this.commandData, 10);
    if (!(itemid in player.inventory)) {
      return;
    }
    item = player.inventory[itemid];
    iobj = hlr.item(item);
    price = hlr.quicksellPrice(item);
    if (!price) {
      hlr.sendErrorTo(this.src, "Your " + iobj.name + " cannot be sold.");
      return;
    }
    hlr.player.takeItem(this.src, itemid, hlr.SILENT);
    hlr.player.giveMoney(this.src, price, hlr.SILENT);
    return hlr.sendTo(this.src, "You sold your " + iobj.name + " for " + (hlr.currencyFormat(price)) + "!");
  }, registered);
  return addCommand('iteminfo', function() {
    var iobj, item, itemid, player, qsprice, sprice;
    player = hlr.player.player(this.src);
    itemid = parseInt(this.commandData, 10);
    if (!(itemid in player.inventory)) {
      return;
    }
    item = player.inventory[itemid];
    iobj = hlr.item(item);
    sprice = iobj.sell;
    qsprice = hlr.quicksellPrice(item);
    hlr.sendTo(this.src, "<b title='Item id " + itemid + "'>" + iobj.name + "</b>: " + (iobj.description ? iobj.description : ''));
    if (sprice) {
      if (hlr.location(player.location).type !== hlr.Location.SellArea) {
        hlr.sendTo(this.src, "You cannot sell items in " + (hlr.location(player.location)) + " at full price, instead, go to a marketplace.");
      } else {
        hlr.sendTo(this.src, "<a href='po:send//sell " + itemid + "'>Sell " + iobj.name + " for " + (hlr.currencyFormat(sprice)) + "</a>.");
      }
      return hlr.sendTo(this.src, "<a href='po:send//quicksell " + itemid + "'>Quicksell " + iobj.name + " for " + (hlr.currencyFormat(qsprice)) + "</a>.");
    } else {
      return hlr.sendTo(this.src, "This item cannot be sold.");
    }
  }, registered);
};

hlr.items = {};

hlr.item = function(e, obj) {
  if (obj) {
    return hlr.items[e] = obj;
  } else {
    return hlr.items[e];
  }
};

hlr.item.gun = function(e, obj) {
  if (obj) {
    obj.type = hlr.Item.Gun;
  }
  return hlr.item(e, obj);
};

hlr.item.fish = function(e, obj) {
  if (obj) {
    obj.type = hlr.Item.Fish;
  }
  return hlr.item(e, obj);
};

hlr.Item = {
  Gun: 0x0,
  Fish: 0x1
};

hlr.quicksellPrice = function(price) {
  if (price == null) {
    price = 0;
  }
  if (typeof price === 'object') {
    price = price.sell;
  } else if (typeof price === 'string') {
    price = hlr.item(price).sell;
  }
  if (price) {
    return Math.ceil(price / 2);
  } else {
    return 0;
  }
};

hlr.currencyFormat = function(a) {
  return "£" + a;
};

hlr.item.gun('pistol', {
  name: "Pistol"
});

hlr.item.fish('tuna', {
  name: "Tuna",
  sell: 3
});

hlr.item.fish('sardine', {
  name: "Sardine",
  sell: 3
});

hlr.item.fish('mackerel', {
  name: "Mackerel",
  sell: 4
});

hlr.item.fish('salmon', {
  name: 'Salmon',
  sell: 4
});

hlr.item.fish('barb', {
  name: 'Barb',
  sell: 5
});

hlr.item.fish('bass', {
  name: 'Bass',
  sell: 5
});

hlr.item.fish('catfish', {
  name: 'Catfish',
  sell: 6
});

hlr.item.fish('clownfish', {
  name: "Clownfish",
  sell: 9
});

hlr.item.fish('swordfish', {
  name: "Swordfish",
  sell: 10
});

hlr.JsonStore = (function() {
  function JsonStore(file, saverate) {
    this.file = file;
    this.saverate = saverate != null ? saverate : 30;
    this.hash = {};
    this.dirty = false;
    this.load();
    this.initDefaults();
  }

  JsonStore.prototype.markDirty = function() {
    this.dirty = true;
    return this;
  };

  JsonStore.prototype.load = function() {
    if (sys.fileExists(this.file)) {
      this.hash = JSON.parse(sys.getFileContent(this.file));
    }
    return this;
  };

  JsonStore.prototype.saveAll = function() {
    if (this.dirty) {
      sys.writeToFile(this.file, JSON.stringify(this.hash));
    }
    return this;
  };

  JsonStore.prototype.initDefaults = function() {};

  return JsonStore;

})();

hlr.locations = {};

hlr.location = function(e, obj) {
  if (obj) {
    return hlr.locations[e] = obj;
  } else {
    return hlr.locations[e];
  }
};

hlr.Location = {
  SellArea: 0x0,
  FishArea: 0x1,
  DuelGunArea: 0x2
};

hlr.location('market', {
  name: "Market",
  to: ['river'],
  type: hlr.Location.SellArea,
  welcome: 'Welcome to the Market! Here you can sell your fish for full price.'
});

hlr.location('river', {
  name: "River",
  to: ['market'],
  type: hlr.Location.FishArea,
  fish: {
    tuna: 1 / 7,
    sardine: 1 / 7,
    mackerel: 1 / 9,
    salmon: 1 / 9,
    barb: 1 / 10,
    bass: 1 / 10,
    catfish: 1 / 13,
    clownfish: 1 / 16,
    swordfish: 1 / 18
  },
  fishFailChance: 0.1,
  welcome: 'Welcome to the River! Here you can fish and quicksell it for a cheaper price.'
});

hlr.location('saloon', {
  name: "Saloon",
  to: ['market'],
  type: hlr.Location.DuelGunArea
});

hlr.locationTypeName = function(type) {
  return ["Marketplace", "Fishing", "Gun Dueling"][type];
};

hlr.sendMsg = function(message) {
  return Bot.hlr.sendAll(message, hlr.chan);
};

hlr.sendPlayer = function(src, message) {
  return Bot.hlr.sendMessage(src, message, hlr.chan);
};

hlr.lineTo = function(src) {
  return Bot.hlr.line(src, hlr.chan);
};

hlr.lineAll = function(src) {
  return Bot.hlr.lineAll(hlr.chan);
};

hlr.sendErrorTo = function(src, message) {
  return sys.sendHtmlMessage(src, "<timestamp/><i>" + message + "</i>", hlr.chan);
};

hlr.sendTo = hlr.sendPlayer;

hlr.commandList = function(title, help, listtype) {
  var lists;
  lists = require('lists');
  return new lists.CommandList(title, help, listtype);
};

hlr.player = {};

hlr.player.sessions = {};

hlr.player.markDirty = function() {
  return hlr.player.jsonstore.markDirty();
};

hlr.player.player = function(id) {
  return hlr.players[hlr.namelOf(id)];
};

hlr.player.session = function(id) {
  var _base;
  return (_base = hlr.player.sessions)[id] || (_base[id] = {});
};

hlr.player.registered = function(id) {
  return hlr.namelOf(id) in hlr.players;
};

hlr.player.register = function(id) {
  hlr.assert(!hlr.player.registered(id), "can't register already registered players");
  hlr.players[hlr.namelOf(id)] = {
    name: id,
    balance: 0,
    inventory: {}
  };
  return hlr.player.markDirty();
};

hlr.player.unregister = function(id) {
  hlr.assert(hlr.player.registered(id), "can't unregister non-registered players");
  delete hlr.players[hlr.namelOf(id)];
  return hlr.player.markDirty();
};

hlr.player.giveItem = function(id, item, qty, notify) {
  var amount, ids, player;
  if (qty == null) {
    qty = 1;
  }
  if (notify == null) {
    notify = hlr.VERBOSE;
  }
  player = hlr.player.player(id);
  amount = qty;
  ids = [];
  while (amount) {
    id = hlr.uniqItemId();
    ids.push(id);
    player.inventory[id] = item;
    amount -= 1;
  }
  hlr.player.markDirty();
  if (notify === hlr.VERBOSE && sys.loggedIn(id)) {
    hlr.sendTo(id, "You have obtained " + qty + " " + (hlr.item(item).name) + "!");
  }
  return ids;
};

hlr.player.takeItem = function(id, itemid, notify) {
  var item, player;
  if (notify == null) {
    notify = hlr.VERBOSE;
  }
  player = hlr.player.player(id);
  hlr.assert(itemid in player.inventory, "player doesn't have itemid in inventory");
  item = player.inventory[itemid];
  delete player.inventory[itemid];
  hlr.player.markDirty();
  if (notify === hlr.VERBOSE && sys.loggedIn(id)) {
    hlr.sendTo(id, "You lost your " + (hlr.item(item).name) + "!");
  }
  return item;
};

hlr.player.sendQuicksellInfo = function(id, itemid) {
  var item, player;
  player = hlr.player.player(id);
  hlr.assert(itemid in player.inventory, "player doesn't have itemid in inventory");
  item = hlr.item(player.inventory[itemid]);
  return hlr.sendTo(id, "<a href='po:send//quicksell " + itemid + "'><b>Quicksell " + item.name + " for " + (hlr.currencyFormat(hlr.quicksellPrice(item.sell))) + "</b></a>.");
};

hlr.player.showInventory = function(id) {
  var count, html, icount, inv, itemid, page, player, uniqid;
  player = hlr.player.player(id);
  inv = player.inventory;
  icount = Object.keys(inv).length;
  hlr.sendTo(id, "You have " + (hlr.currencyFormat(player.balance)));
  if (icount === 0) {
    hlr.sendTo(id, "Your inventory is empty.");
    return;
  }
  hlr.lineTo(id);
  hlr.sendTo(id, "Your inventory:");
  html = "<table cellpadding='1' cellspacing='3'>";
  page = 0;
  count = 0;
  for (uniqid in inv) {
    itemid = inv[uniqid];
    if (count % 50 === 0) {
      page += 1;
      if (count !== 0) {
        html += "</tr>";
      }
      html += "<tr><th colspan=10><font color=red>Page " + page + "</font></th></tr><tr><th>Item</th><th>Item</th><th>Item</th><th>Item</th><th>Item</th><th>Item</th><th>Item</th><th>Item</th><th>Item</th></tr><tr>";
    } else if (count % 10 === 0) {
      html += "</tr><tr>";
    }
    html += "<td><a href='po:send//iteminfo " + uniqid + "'>" + (hlr.item(itemid).name) + "</a></td>";
    count += 1;
  }
  html += "</tr></table>";
  hlr.sendTo(id, html);
  hlr.sendTo(id, "To see more information about an item, as well as be able to sell it, click on its name.");
  return hlr.lineTo(id);
};

hlr.player.giveMoney = function(id, money, notify) {
  var player;
  if (notify == null) {
    notify = hlr.VERBOSE;
  }
  player = hlr.player.player(id);
  player.balance += money;
  hlr.player.markDirty();
  if (notify === hlr.VERBOSE && sys.loggedIn(id)) {
    return hlr.sendTo(id, "You have obtained " + (hlr.currencyFormat(money)) + "!");
  }
};

hlr.player.goto = function(id, loc, notify) {
  var player;
  if (notify == null) {
    notify = hlr.VERBOSE;
  }
  player = hlr.player.player(id);
  player.location = loc;
  hlr.player.markDirty();
  if (notify === hlr.VERBOSE && sys.loggedIn(id)) {
    return hlr.player.sendLocationInfo(id, loc);
  }
};

hlr.player.sendLocationInfo = function(id, loc) {
  var lobj, locs, place;
  if (loc == null) {
    loc = hlr.player.player(id).location;
  }
  lobj = hlr.location(loc);
  hlr.lineTo(id);
  hlr.sendTo(id, "You are now in <a href='po:send//location'><b>" + lobj.name + "</b> (" + (hlr.locationTypeName(lobj.type)) + ")</a>!");
  if (lobj.welcome) {
    hlr.sendTo(id, lobj.welcome);
  }
  locs = (function() {
    var _i, _len, _ref, _results;
    _ref = lobj.to;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      place = _ref[_i];
      _results.push("<a href='po:send//go " + place + "'><b>" + (hlr.location(place).name) + "</b></a>");
    }
    return _results;
  })();
  hlr.sendTo(id, "From here, you can go to " + (hlr.fancyJoin(locs)) + ".");
  switch (lobj.type) {
    case hlr.Location.SellArea:
      hlr.sendTo(id, "You can <a href='po:send//inventory'>sell items from your inventory</a> here.");
      break;
    case hlr.Location.FishArea:
      hlr.sendTo(id, "You can <a href='po:send//fish'>fish</a> here.");
  }
  return hlr.lineTo(id);
};

hlr.player.initStorage = function() {
  var players;
  players = new hlr.JsonStore("hlr-players.json", 30);
  hlr.player.jsonstore = players;
  return hlr.players = players.hash;
};

hlr.nameOf = function(id) {
  var _ref, _ref1;
  if (typeof id === 'number') {
    return (_ref = (_ref1 = SESSION.users(id)) != null ? _ref1.originalName : void 0) != null ? _ref : sys.name(id);
  } else {
    return id;
  }
};

hlr.namelOf = function(id) {
  return hlr.nameOf(id).toLowerCase();
};

hlr.error = function(str) {
  throw new Error(str);
};

hlr.assert = function(condition, str) {
  if (!condition) {
    return hlr.error(str);
  }
};

hlr.an = Utils.an;

hlr.fancyJoin = Utils.fancyJoin;
hlr.player.initStorage();
hlr.addCommands();

module.exports = hlr;
module.exports.serverShutDown = module.onUnload = function () {
    hlr.player.jsonstore.saveAll();

    sys.writeToFile(hlr._uniqItemId.file, hlr._uniqItemId.id);
};

var stepTimer = 0;
module.exports.step = function () {
    var store, len, i;

    stepTimer += 1;

    if (hlr._uniqItemId.dirty) {
        sys.writeToFile(hlr._uniqItemId.file, hlr._uniqItemId.id);
    }

    if (stepTimer % hlr.player.jsonstore.saverate === 0) {
        hlr.player.jsonstore.saveAll();
    }
};

module.reload = function () {
    return true;
};
