hlr.player.initStorage();

module.exports = hlr;
exports.serverShutDown = function () {
    var len, i;
    for (i = 0, len = hlr.persistence.stores.length; i < len; i += 1) {
        hlr.persistence.stores[i].saveAll();
    }

    sys.writeToFile(hlr._uniqItemId.file, hlr._uniqItemId.id);
};

var stepTimer = 0;
exports.step = function () {
    var store, len, i;

    stepTimer += 1;

    if (hlr._uniqItemId.dirty) {
        sys.writeToFile(hlr._uniqItemId.file, hlr._uniqItemId.id);
    }

    for (i = 0, len = hlr.persistence.stores.length; i < len; i += 1) {
        store = hlr.persistence.stores[i];
        if (stepTimer % store.saverate === 0) {
            store.saveAll();
        }
    }
};

module.reload = function () {
    // Update commands inside events
    require.reload('events.js');
    return true;
};
