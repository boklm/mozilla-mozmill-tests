/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Include required modules
var downloads = require("../../../lib/downloads");
var prefs = require("../../../lib/prefs");
var utils = require("../../../lib/utils");

const PREF_DOWNLOAD_USE_TOOLKIT = "browser.download.useToolkitUI";

var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();

  // Get an instance of the Download Manager class
  module.dm = new downloads.downloadManager();

  // Enable the old tookit UI to test the download manager
  prefs.preferences.setPref(PREF_DOWNLOAD_USE_TOOLKIT, true);
}

var teardownModule = function(module) {
  prefs.preferences.clearUserPref(PREF_DOWNLOAD_USE_TOOLKIT);

  // If we failed in closing the Download Manager window do it now
  if (dm.controller.window)
    dm.controller.window.close();
}

/**
 * Test closing the Download Manager
 */
var testCloseDownloadManager = function() {
  // Get the initial window count
  var windowCount = mozmill.utils.getWindows().length;

  // Test ESC
  dm.open(controller, false);
  dm._controller.keypress(null, "VK_ESCAPE", {});
  controller.waitFor(function () {
    return mozmill.utils.getWindows().length === windowCount;
  }, "The Download Manager has been closed");

  // Test ACCEL+W
  // This is tested by dm.close()
  dm.open(controller, false);
  dm.close();

  // Test ACCEL+SHIFT+Y
  // NOTE: This test is only performed on Linux
  if (mozmill.isLinux) {
    var cmdKey = utils.getEntity(dm.getDtds(), "cmd.close2Unix.commandKey");
    dm.open(controller, false);
    dm._controller.keypress(null, cmdKey, {shiftKey:true, accelKey:true});
    controller.waitFor(function () {
      return mozmill.utils.getWindows().length === windowCount;
    }, "The Download Manager has been closed");
  }

  // Test ACCEL+J
  // NOTE: This test is only performed on Windows and Mac
  if (!mozmill.isLinux) {
    var cmdKey = utils.getEntity(dm.getDtds(), "cmd.close2.commandKey");
    dm.open(controller, false);
    dm._controller.keypress(null, cmdKey, {accelKey:true});
    controller.waitFor(function () {
      return mozmill.utils.getWindows().length === windowCount;
    }, "The Download Manager has been closed");
  }
}

/**
 * Map test functions to litmus tests
 */
// testCloseDownloadManager.meta = {litmusids : [7980]};
