/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var { assert } = require("../../../lib/assertions");
var utils = require("../../../firefox/lib/utils");
var tabs = require("tabs");

/**
 * Constructor
 *
 * @param {Object} aToolBar
 *        Instance of the ToolBar class
 */
function Downloads(aToolBar) {
  this.toolbar = aToolBar;
  this._controller = aToolBar.controller;
}

/**
 * Prototype definition of the Downloads class
 */
Downloads.prototype = {
  /**
   * Returns the controller of the class instance
   *
   * @returns {MozMillController} Controller of the window
   */
  get controller() {
    return this._controller;
  },

  /**
   * Retrieve an UI element based on the given specification
   *
   * @param {object} aSpec
   *        Information of the UI elements which should be retrieved
   * @param {object} type
   *        Identifier of the element
   * @param {object} [subtype=""]
   *        Attribute of the element to filter
   * @param {object} [value=""]
   *        Value of the attribute to filter
   * @param {object} [parent=document]
   *        Parent of the to find element
   *
   * @returns {Object} Element which has been found
   */
  getElement : function downloads_getElement(aSpec) {
    var elements = this.getElements(aSpec);

    return (elements.length > 0) ? elements[0] : undefined;
  },

  /**
   * Retrieve list of UI elements based on the given specification
   *
   * @param {Object} aSpec
   *        Information of the UI elements which should be retrieved
   * @param {Object} type
   *        General type information
   * @param {Object} subtype
   *        Specific element or property
   * @param {Object} value
   *        Value of the element or property
   *
   * @returns {Object[]} Array of elements which have been found
   */
  getElements : function downloads_getElements(aSpec) {
    var elem = null;

    switch(aSpec.type) {
      case "progressBar":
        elem = new findElement.ID(this._controller.window.document, "download-progress");
        break;
      default:
        throw new Error("Unknown element type - " + aSpec.type);
    }

    return [elem];
  }
};

/**
 * Constructor
 *
 * @param {Object} aToolBar
 *        Instance of the ToolBar class
 */
function FindBar(aToolBar) {
  this.toolbar = aToolBar;
  this._controller = aToolBar.controller;
}

/**
 * Prototype definition of the Find bar class
 */
FindBar.prototype = {
  /**
   * Returns the controller of the class instance
   *
   * @returns {MozMillController} Controller of the window
   */
  get controller() {
    return this._controller;
  },

  /**
   * Returns the state of the find bar (opened/closed)
   */
  get isOpen() {
    var findbar = this.getElement({type: "findbar"});
    return findbar.getNode().isShowing;
  },

  /**
   * Returns the current value in the find bar
   */
  get value() {
    var textbox = this.getElement({type: "textbox"});
    return textbox.getNode().value;
   },

  /**
   * Retrieve an UI element based on the given specification
   *
   * @param {object} aSpec
   *        Information of the UI element which should be retrieved
   * @param {object} type
   *        Identifier of the element
   * @param {object} [subtype=""]
   *        Attribute of the element to filter
   * @param {object} [value=""]
   *        Value of the attribute to filter
   * @param {object} [parent=document]
   *        Parent of the element to find
   *
   * @returns {object} Element which has been found
   */
  getElement : function findbar_getElement(aSpec) {
    var elements = this.getElements(aSpec);

    return (elements.length > 0) ? elements[0] : undefined;
  },

  /**
   * Retrieve list of UI elements based on the given specification
   *
   * @param {Object} aSpec
   *        Information of the UI elements which should be retrieved
   * @param {Object} type
   *        General type information
   * @param {Object} subtype
   *        Specific element or property
   * @param {Object} value
   *        Value of the element or property
   *
   * @returns {Object[]} Array of elements which have been found
   */
  getElements : function findbar_getElements(aSpec) {
    var elem = null;

    switch(aSpec.type) {
      case "findbar":
        elem = new findElement.ID(this._controller.window.document, "findbar");
        break;
      case "closeButton":
        elem = new findElement.ID(this._controller.window.document, "findbar-close-button");
        break;
      case "nextButton":
        elem = new findElement.ID(this._controller.window.document, "findbar-next-button");
        break;
      case "previousButton":
        elem = new findElement.ID(this._controller.window.document, "findbar-previous-button");
        break;
      case "textbox":
        elem = new findElement.ID(this._controller.window.document, "findbar-textbox");
        break;
      default:
        throw new Error("Unknown element type - " + aSpec.type);
    }

    return [elem];
  },

  /**
   * Close the find bar
   *
   * @param {string} aMethod
   *        Specifies a method for closing the find bar
   */
  close: function FindBar_close(aMethod) {
    var method = aMethod || "button";
    var transitioned = false;

    function onTransitionEnd() {
      transitioned = true;
    }

    var findBar = this.getElement({type: "findbar"});
    findBar.getNode().addEventListener("transitionend", onTransitionEnd, false);

    try {
      switch (method) {
        case "button":
          var closeButton = this.getElement({type: "closeButton"});
          closeButton.tap();
          break;
        case "shortcut":
          var win = new findElement.MozMillElement("Elem", this._controller.window);
          win.keypress("VK_ESCAPE", {accelKey: true});
          break;
        default:
          throw new Error("Unknown opening method - " + method);
      }

      assert.waitFor(function () {
        return transitioned;
      }, "Find bar has been closed");
    }
    finally {
      findBar.getNode().removeEventListener("transitionend", onTransitionEnd, false);
    }
  },

  /**
   * Open the find bar
   *
   * @param {string} aMethod
   *        Specifies a method for opening the find bar
   */
  open: function FindBar_open(aMethod) {
    var method = aMethod || "menu";
    var transitioned = false;

    function onTransitionEnd() {
      transitioned = true;
    }

    var findBar = this.getElement({type: "findbar"});
    findBar.getNode().addEventListener("transitionend", onTransitionEnd, false);

    try {
      switch (method) {
        case "menu":
          // In order to tap on the menu button, the toolbar has to be opened
          if (!this.toolbar.isVisible()) {
            this.toolbar.open();
          }

          var menuButton = this.toolbar.getElement({type: "menuButton"});
          menuButton.tap();

          // Bug 966963
          // TODO: Update code to use controller.Menu
          var findInPage = this.toolbar.getElement({type: "findInPage"});
          findInPage.tap();
          break;
        case "shortcut":
          var win = new findElement.MozMillElement("Elem", this._controller.window);
          var cmdKey = utils.getEntity(this.toolbar.dtds, "find.key");
          win.keypress(cmdKey, {accelKey: true});
          break;
        default:
          throw new Error("Unknown opening method - " + method);
      }

      assert.waitFor(function () {
        return transitioned;
      }, "Find bar has been opened");
    }
    finally {
      findBar.getNode().removeEventListener("transitionend", onTransitionEnd, false);
    }
  },

  /**
   * Type a search term into the find bar
   *
   * @param {string} aSearchTerm
   *        String term to search for in the find bar
   */
  type : function FindBar_type(aSearchTerm) {
    var textbox = this.getElement({type: "textbox"});
    textbox.sendKeys(aSearchTerm);
  }
};

/**
 * Constructor
 *
 * @param {Object} aToolBar
 *        Instance of the ToolBar class
 */
function LocationBar(aToolBar) {
  this.toolbar = aToolBar;
  this._controller = aToolBar.controller;
}

/**
 * Location Bar class
 */
LocationBar.prototype = {
  /**
   * Returns the controller of the class instance
   *
   * @returns {MozMillController} Controller of the window
   */
  get controller() {
    return this._controller;
  },

  /**
   * Returns the urlbar element
   *
   * @returns URL bar
   * @type {ElemBase}
   */
  get urlbar() {
    return this.getElement({type: "urlbar"});
  },

  /**
   * Returns the currently shown URL
   *
   * @returns Text inside the location bar
   * @type {String}
   */
  get value() {
    return this.urlbar.getNode().value;
  },

  /**
   * Clear the location bar
   */
  clear : function locationBar_clear() {
    this.focus();
    this.urlbar.keypress("VK_DELETE");
    var self = this;
    assert.waitFor(function () {
      return self.urlbar.getNode().value === "";
    }, "Location bar has been cleared.");
  },

  /**
   * Check if the location bar contains the given text
   *
   * @param {String} text
   *        Text which should be checked against
   */
  contains : function locationBar_contains(aText) {
    return this.value.indexOf(aText) !== -1;
  },

  /**
   * Focus the location bar
   */
  focus : function locationBar_focus() {
    var self = this;
    this.urlbar.tap();
    assert.waitFor(function () {
      return self.urlbar.getNode().getAttribute("focused") === "true";
    }, "Location bar has been focused");
  },

  /**
   * Retrieve an UI element based on the given specification
   *
   * @param {object} aSpec
   *        Information of the UI element which should be retrieved
   * @param {object} type
   *        Identifier of the element
   * @param {object} [subtype=""]
   *        Attribute of the element to filter
   * @param {object} [value=""]
   *        Value of the attribute to filter
   * @param {object} [parent=document]
   *        Parent of the element to find
   *
   * @returns {object} Element which has been found
   */
  getElement : function locationBar_getElement(aSpec) {
    var elements = this.getElements(aSpec);

    return (elements.length > 0) ? elements[0] : undefined;
  },

  /**
   * Retrieve list of UI elements based on the given specification
   *
   * @param {Object} aSpec
   *        Information of the UI elements which should be retrieved
   * @param {Object} type
   *        General type information
   * @param {Object} subtype
   *        Specific element or property
   * @param {Object} value
   *        Value of the element or property
   *
   * @returns {Object[]} Array of elements which have been found
   */
  getElements : function locationBar_getElements(aSpec) {
    var elem = null;

    switch(aSpec.type) {
      case "backButton":
        elem = new findElement.ID(this._controller.window.document, "back-button");
        break;
      case "forwardButton":
        elem = new findElement.ID(this._controller.window.document, "forward-button");
        break;
      case "identityBox":
        elem = new findElement.ID(this._controller.window.document, "identity-box");
        break;
      case "reloadButton":
        elem = new findElement.ID(this._controller.window.document, "reload-button");
        break;
      case "stopButton":
        elem = new findElement.ID(this._controller.window.document, "stop-button");
        break;
      case "urlbar":
        elem = new findElement.ID(this.controller.window.document, "urlbar-edit");
        break;
      default:
        throw new Error("Unknown element type - " + aSpec.type);
    }

    return [elem];
  },

  /**
   * Type the given text into the location bar
   *
   * @param {string} aText
   *        Text to enter into the location bar
   */
  type : function locationBar_type(aText) {
    var location = this.getElement({type: "urlbar"});
    location.sendKeys(aText);
  }

};

/**
 * Constructor
 */
function ToolBar(aController) {
  if (!aController) {
    assert.fail("A valid controller must be specified");
  }

  this._controller = aController;
  this.downloads = new Downloads(this);
  this.findBar = new FindBar(this);
  this.locationBar = new LocationBar(this);
}

/**
 * Prototype definition of the tool bar class
 */
ToolBar.prototype = {
  /**
   * Returns the controller of the class instance
   *
   * @returns {MozMillController} Controller of the window
   */
  get controller() {
    return this._controller;
  },

  /**
   * Gets all the needed external DTD URLs as an array
   *
   * @returns {String[]} URL's of external DTD files
   */
  get dtds() {
    var dtds = ["chrome://browser/locale/browser.dtd"];

    return dtds;
  },

  /**
   * Retrieve an UI element based on the given specification
   *
   * @param {object} aSpec
   *        Information of the UI elements which should be retrieved
   * @param {object} type
   *        Identifier of the element
   * @param {object} [subtype=""]
   *        Attribute of the element to filter
   * @param {object} [value=""]
   *        Value of the attribute to filter
   * @param {object} [parent=document]
   *        Parent of the to find element
   *
   * @returns {object} Element which has been found
   */
  getElement : function toolbar_getElement(aSpec) {
    var elements = this.getElements(aSpec);

    return (elements.length > 0) ? elements[0] : undefined;
  },

  /**
   * Retrieve list of UI elements based on the given specification
   *
   * @param {Object} aSpec
   *        Information of the UI elements which should be retrieved
   * @param {Object} type
   *        General type information
   * @param {Object} subtype
   *        Specific element or property
   * @param {Object} value
   *        Value of the element or property
   *
   * @returns {Object[]} Array of elements which have been found
   */
  getElements : function toolbar_getElements(aSpec) {
    var elem = null;

    switch(aSpec.type) {
      case "closeSuggestionsButton":
        elem = new findElement.ID(this._controller.window.document, "panel-close-button");
        break;
      case "findInPage":
        elem = new findElement.ID(this._controller.window.document, "context-findinpage");
        break;
      case "menuButton":
        elem = new findElement.ID(this._controller.window.document, "menu-button");
        break;
      case "navbar":
        elem = new findElement.ID(this._controller.window.document, "navbar");
        break;
      case "pinButton":
        elem = new findElement.ID(this._controller.window.document, "pin-button");
        break;
      case "starButton":
        elem = new findElement.ID(this._controller.window.document, "star-button");
        break;
      case "suggestionsPanel":
        elem = new findElement.ID(this._controller.window.document, "panel-container");
        break;
      case "toolbar":
        elem = new findElement.ID(this._controller.window.document, "toolbar");
        break;
      case "toolbarClose":
        elem = new findElement.ID(this._controller.window.document, "close-button");
        break;
      default:
        throw new Error("Unknown element type - " + aSpec.type);
    }

    return [elem];
  },

  /**
   * Bookmarks the current page
   */
  bookmarkPage: function toolbar_bookmarkPage() {
    var starButton = this.getElement({type: "starButton"});
    starButton.tap();
    assert.waitFor(function () {
      return starButton.getNode().checked;
    }, "Page has been bookmarked");
  },

  /**
   * Check if the toolbar is visible
   *
   * @returns {Boolean} True if the toolbar is visible
   */
  isVisible: function toolbar_isVisible() {
    var toolbar = this.getElement({type: "navbar"});
    return toolbar.getNode().hasAttribute("visible") ||
           toolbar.getNode().hasAttribute("startpage");
  },

  /**
   * Open the toolbar
   *
   * @param {string} aMethod
   *        Specifies a method for opening the toolbar
   */
  open: function toolbar_open(aMethod) {
    var method = aMethod || "shortcut";
    var transitioned = false;

    function onTransitionEnd() {
      transitioned = true;
    }

    var toolbar = this.getElement({type: "toolbar"});
    toolbar.getNode().addEventListener("transitionend", onTransitionEnd, false);

    try {
      switch (method) {
        case "shortcut":
          var win = new findElement.MozMillElement("Elem", this._controller.window);
          var cmdKey = utils.getEntity(this.dtds, "urlbar.accesskey");
          win.keypress(cmdKey, {accelKey:true});
          break;
        case "touchEvent":
          // Bug 964704
          // TODO: add code for touch event (swipe up)
          break;
        default:
          throw new Error("Unknown opening method - " + method);
      }

      assert.waitFor(function () {
        return transitioned;
      }, "Toolbar has been opened");
    }
    finally {
      toolbar.getNode().removeEventListener("transitionend", onTransitionEnd, false);
    }
  }
};

// Export of classes
exports.ToolBar = ToolBar;
