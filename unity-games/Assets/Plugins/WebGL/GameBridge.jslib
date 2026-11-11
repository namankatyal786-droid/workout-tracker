mergeInto(LibraryManager.library, {
  SendGameOverToBrowser: function (gamePtr, score) {
    var gameName = UTF8ToString(gamePtr);
    var payload = {
      type: 'GAME_OVER',
      game: gameName,
      score: score
    };
    if (window.parent) {
      window.parent.postMessage(payload, '*');
    }
  }
});
