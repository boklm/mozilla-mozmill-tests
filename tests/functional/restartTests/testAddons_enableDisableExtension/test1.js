/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Include required modules
var addons = require("../../../../lib/addons");
var modalDialog = require("../../../../lib/modal-dialog");
var tabs = require("../../../../lib/tabs");

const LOCAL_TEST_FOLDER = collector.addHttpResource("../../../../data/");
const TIMEOUT_DOWNLOAD = 25000;

const ADDON = {
  url: LOCAL_TEST_FOLDER + "addons/extensions/icons.xpi",
  id: "test-icons@quality.mozilla.org"
};

function setupModule() {
  controller = mozmill.getBrowserController();
  addonsManager = new addons.AddonsManager(controller);

  // Store the addon in the persisted object
  persisted.addon = ADDON;

  tabs.closeAllTabs(controller);
}

/*
 * Install the add-on from data/ folder
 */
function testInstallAddon() {
  var md = new modalDialog.modalDialog(addonsManager.controller.window);

  // Install the add-on
  md.start(addons.handleInstallAddonDialog);
  controller.open(persisted.addon.url);
  md.waitForDialog(TIMEOUT_DOWNLOAD);
}
