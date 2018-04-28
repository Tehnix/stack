const blessed = require('blessed');
const keyBindings = {};

module.exports = {
  init() {
    const screen = blessed.screen({
      autopadding: true,
      smartCSR: true,
      title: 'Stack',
      fullUnicode: true,
    });

    const container = blessed.box({
      width: '100%',
      height: '100%',
    });

    const sideBar = blessed.box({
      width: '20%',
      height: '100%',
    });

    const mainWindow = blessed.box({
      width: '80%',
      height: '100%',
      left: '20%',
      name: 'Main'
    });

    const mainWindowTitle = blessed.text({
      width: '100%-8',
      height: 1,
      top: 1,
      tags: true,
    });

    const focusIndicator = blessed.text({
      width: 8,
      height: 1,
      top: 1,
      right: 0,
      tags: true,
      style: {
        fg: 'red'
      }
    })

    const chatWindow = blessed.box({
      width: '100%',
      height: '100%-10',
      top: 3,
      keys: true,
      vi: true,
      mouse: true,
      scrollable: true,
      alwaysScroll: true,
      tags: true,
      name: 'Chat'
    });

    const messageInputBorder = blessed.line({
      width: '100%',
      bottom: 7,
      orientation: 'horizontal',
      ch: '-',
    });

    const messageInput = blessed.textbox({
      width: '100%',
      height: 7,
      bottom: 0,
      keys: true,
      vi: true,
      mouse: true,
      inputOnFocus: true,
      name: 'Input'
    });

    function searchChannels(searchCallback) {
      const searchBoxTitle = blessed.text({
        width: '100%-8',
        height: 1,
        top: 1,
        content: '{bold}Search{/bold}',
        tags: true,
      });

      const searchBox = blessed.textbox({
        width: '100%',
        height: 'shrink',
        top: 2,
        keys: true,
        vi: true,
        inputOnFocus: true,
        border: {
          fg: 'red',
          type: 'line',
        },
      });

      const removeSearchBox = _ => {
        mainWindow.remove(searchBox);
        mainWindow.remove(searchBoxTitle);
        mainWindow.append(mainWindowTitle);
        mainWindow.append(chatWindow);
        mainWindow.append(messageInputBorder);
        mainWindow.append(messageInput);
        screen.render();
      }

      searchBox.on('keypress', (ch, key) => {
        if (Object.keys(keyBindings).includes(key.full)) {
          searchBox.cancel();
          removeSearchBox();
          const fn = keyBindings[key.full];
          if (fn) fn();
        }
      });

      searchBox.on('submit', (text) => {
        removeSearchBox();
        searchCallback(text);
      });

      mainWindow.remove(mainWindowTitle);
      mainWindow.remove(chatWindow);
      mainWindow.remove(messageInputBorder);
      mainWindow.remove(messageInput);
      mainWindow.append(searchBoxTitle);
      mainWindow.append(searchBox);

      searchBox.focus();
      screen.render();
    }

    const channelsBox = blessed.box({
      width: '100%',
      height: '50%',
      scrollable: true,
      name: 'Channels'
    });

    const channelsTitle = blessed.text({
      width: '100%-4',
      height: 1,
      top: 1,
      left: 2,
      content: '{bold}Channels{/bold}',
      tags: true,
    });

    const channelList = blessed.list({
      width: '100%-4',
      height: '100%-3',
      left: 2,
      top: 3,
      keys: true,
      vi: true,
      mouse: true,
      scrollable: true,
      search: searchChannels,
      style: {
        selected: {
          bg: 'red',
          fg: 'white',
        },
      },
      tags: true,
    });

    const usersBox = blessed.box({
      width: '100%',
      height: '50%',
      top: '50%',
      name: 'Users'
    });

    const usersTitle = blessed.text({
      width: '100%-4',
      height: 1,
      top: 1,
      left: 2,
      content: '{bold}Users{/bold}',
      tags: true,
    });

    const userList = blessed.list({
      width: '100%-4',
      height: '100%-4',
      left: 2,
      top: 3,
      keys: true,
      vi: true,
      mouse: true,
      scrollable: true,
      search: searchChannels,
      style: {
        selected: {
          bg: 'red',
          fg: 'white',
        },
      },
      tags: true,
    });

    channelsBox.append(channelsTitle);
    channelsBox.append(channelList);
    usersBox.append(usersTitle);
    usersBox.append(userList);
    sideBar.append(channelsBox);
    sideBar.append(usersBox);
    mainWindow.append(mainWindowTitle);
    mainWindow.append(focusIndicator);
    mainWindow.append(chatWindow);
    mainWindow.append(messageInputBorder);
    mainWindow.append(messageInput);
    container.append(sideBar);
    container.append(mainWindow);
    screen.append(container);

    keyBindings['C-q'] = process.exit.bind(null, 0);
    keyBindings['C-c'] = channelList.focus.bind(channelList);
    keyBindings['C-u'] = userList.focus.bind(userList);
    keyBindings['C-w'] = messageInput.focus.bind(messageInput);
    keyBindings['C-l'] = chatWindow.focus.bind(chatWindow);

    keyBindings.escape = chatWindow.focus.bind(chatWindow);

    const callKeyBindings = (ch, key) => {
      const fn = keyBindings[key.full];
      if (fn) fn();
    }

    userList.on('keypress', callKeyBindings);
    channelList.on('keypress', callKeyBindings);
    chatWindow.on('keypress', callKeyBindings);
    messageInput.on('keypress', (ch, key) => {
      if (Object.keys(keyBindings).includes(key.full)) {
        messageInput.cancel();
        callKeyBindings(ch, key);
      }
    });

    const onFocus = (component) => {
      focusIndicator.content = `{bold}${component.name}{/bold}`;
      screen.render();
    };

    userList.on('focus', onFocus.bind(null, usersBox));
    channelList.on('focus', onFocus.bind(null, channelsBox));
    messageInput.on('focus', onFocus.bind(null, messageInput));
    chatWindow.on('focus', onFocus.bind(null, mainWindow));

    return {
      screen,
      usersBox,
      channelsBox,
      usersTitle,
      userList,
      channelsTitle,
      channelList,
      mainWindow,
      mainWindowTitle,
      focusIndicator,
      chatWindow,
      messageInputBorder,
      messageInput,
    };
  },
};
