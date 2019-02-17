"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Assert Local Storage", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.storage);
    });

    afterEach(async() => {
        await browser.localStorage.clear();
    });

    after(async() => {
        await browser.close();
    });

    it("Item Exists", async() => {
        await browser.assert.localStorage.exist("arthur");
        await browser.localStorage.setItem("item2", "val2");
        await browser.assert.localStorage.exist("item2");
    });

    it("Multiple Item Exists", async() => {
        await browser.localStorage.setItem("item2", "val2");
        await browser.assert.localStorage.exist(["arthur", "item2"]);
    });

    it("Item Exists Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.exist("item2");
        }, `[assert.localStorage.exist] Expected item "item2" to exist in localStorage.`);
        await browser.localStorage.clear();
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.exist("arthur");
        }, `[assert.localStorage.exist] Expected item "arthur" to exist in localStorage.`);
    });

    it("Multiple Items Exists Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.exist(["arthur", "item2"]);
        }, `[assert.localStorage.exist] Expected items "arthur item2" to exist in localStorage.`);
    });

    it("Item Exists Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.exist("item2", "exists error");
        }, `[assert.localStorage.exist] exists error`);
    });

    it("Item Value", async() => {
        await browser.assert.localStorage.value("arthur", "dontpanic");
        await browser.localStorage.setItem("item2", "val2");
        await browser.assert.localStorage.value("item2", "val2");
    });

    it("Item Value Null", async() => {
        await browser.assert.localStorage.value("notSetVal", null);
    });

    it("Item Value Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.value("arthur", "panic");
        }, `[assert.localStorage.value] Expected item "arthur" to have value "panic" in localStorage, "dontpanic" found.`);
    });

    it("Item Value Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.value("arthur", "panic", "value fail");
        }, `[assert.localStorage.value] value fail`);
    });

    it("Item Value Throws Not Element", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.value("item2", "panic");
        }, `[assert.localStorage.value] Expected item "item2" to have value "panic" in localStorage, "null" found.`);
    });

    it("Multiple Items Value", async() => {
        await browser.localStorage.setItem("item2", "val2");
        await browser.assert.localStorage.value({arthur: "dontpanic",
            item2: "val2"});
    });

    it("Multiple Items Value Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.value({arthur: "dontpanic",
                item2: "val2"});
        }, `[assert.localStorage.value] Expected items "arthur item2" to have values "dontpanic val2" in localStorage, "dontpanic null" found.`);
    });

    it("Multiple Items Value Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.value({arthur: "dontpanic",
                item2: "val2"}, "multiple fails");
        }, `[assert.localStorage.value] multiple fails`);
    });

    it("Storage Length", async() => {
        await browser.assert.localStorage.length(1);
        await browser.localStorage.setItem("test", "val");
        await browser.assert.localStorage.length(2);
        await browser.localStorage.setItem("test", "val2");
        await browser.assert.localStorage.length(2);
        await browser.localStorage.clear();
        await browser.assert.localStorage.length(0);
    });

    it("Storage Length Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.length(4);
        }, `[assert.localStorage.length] Expected localStorage to have 4 items, 1 found.`, "1", "4");
    });

    it("Storage Length Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.length(4, "length fails");
        }, "[assert.localStorage.length] length fails", "1", "4");
    });

    it("Storage Empty", async() => {
        await browser.localStorage.clear();
        await browser.assert.localStorage.empty();
    });

    it("Storage Empty Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.empty();
        }, `[assert.localStorage.empty] Expected localStorage to be empty, 1 item found.`);
    });

    it("Storage Empty Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.localStorage.empty("empty fails");
        }, `[assert.localStorage.empty] empty fails`);
    });
});
