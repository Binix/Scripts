hlr.commands = {}
hlr.canUseCommand = (src, command, chan) ->
    if chan isnt hlr.chan and command isnt 'hlrcommands'
        return no

    unless hlr.commands.hasOwnProperty(command)
        return no

    command = hlr.commands[command]
    if hlr.isMaintainer(src)
        return yes

    if command.auth is 'maintainer'
        return no

    if command.auth is 'registered'
        if hlr.player.registered(src)
            return yes
        else
            throw "In order to use this command, you must first <a href='po:send//register'>Create a Highlanders account</a>, or change to an existing account."

    return yes

hlr.handleCommand = (src, message, command, commandData, tar, chan) ->
    hlr.commands[command].handler.call({src, command, commandData, tar, chan, message})

hlr.addCommand = (name, handler, auth='') ->
    if !Array.isArray(name)
        name = name.split(" ")

    for n in name
        hlr.commands[n] = {name, handler, auth}

hlr.authRegistered = 'registered'
hlr.authMaintainer = 'maintainer'
