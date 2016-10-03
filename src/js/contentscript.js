'use strict';

let muteRoomIds = [];
let unreadRoomsName = [];
let timer = 0;

function getMentionCounts() {
  return document.querySelectorAll('#_roomListArea .mention').length;
}

function getUnreadRoomsName() {
  let unreadRoomsName = document.querySelectorAll('#_roomListItems .roomUnread .chatListTitleArea');
  unreadRoomsName = Array.apply(null, unreadRoomsName).map((room) => { return room.textContent; });

  if (unreadRoomsName.length === 0) {
    unreadRoomsName = ['No message!'];
  }

  return unreadRoomsName;
}

function setCustomTitle() {
  document.title = `[${unreadRoomsName.length}](${getMentionCounts()}) - ${unreadRoomsName.join('|')}`;
}

function handleDOM() {
  if (timer) {
    return;
  }

  timer = setTimeout(() => {
    unreadRoomsName = getUnreadRoomsName();
    muteRoomIds.forEach((roomId, _) => {
      let selector = `#_roomListItems li[data-rid="${roomId}"].roomUnread`;
      let domObj = document.querySelector(selector);
      if (domObj !== null) {
        unreadRoomsName.splice(unreadRoomsName.indexOf(domObj.querySelector('.chatListTitleArea').textContent), 1);
        domObj.classList.remove('roomUnread');
        let badgeDomObj = domObj.querySelector('.chatListMeta ul.incomplete .unread');
        if (badgeDomObj !== null) {
          badgeDomObj.remove();
        }
      }
    });
    setCustomTitle();
    timer = 0;
  }, 5);
}

chrome.runtime.sendMessage({ mode: 'initialize' }, response => {
  if (response.status === 'success') {
    if (response.options.muteRoomIds === undefined) {
      return;
    }

    muteRoomIds = response.options.muteRoomIds;
    unreadRoomsName = getUnreadRoomsName();
    setCustomTitle();
    handleDOM();

    document.querySelector('#_roomListArea').addEventListener('DOMNodeInserted', () => {
      handleDOM();
    });
    document.querySelector('title').addEventListener('DOMSubtreeModified', () => {
      handleDOM();
    });
  }
});
