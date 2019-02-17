"use strict";

const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Assert Global", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });
    beforeEach(async() => {
        await browser.open(configUrls.index);
    });

    after(async() => {
        await browser.close();
    });

    it("Global Assertion", async() => {
        await browser.assert.global("dummyQuery");
    });

    it("Global Assertion", async() => {
        await browser.assert.global("dummyQuery", "dummy");
    });

    it("Global Assertion Default Value", async() => {
        await browser.assert.global("localStorage");
    });

    it("Global Assert Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.global("dummyQuery", "not-dummy");
        }, `[assert.global] Expected "dummyQuery" to be defined as global variable with value "not-dummy", "dummy" found.`, "dummy", "not-dummy");
    });

    it("Global Assert Throws Not Defined", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.global("notDefinedElement");
        }, `[assert.global] Expected "notDefinedElement" to be defined as global variable.`);
    });

    it("Global Assert Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.global("notDefinedElement", null, "global fails");
        }, `[assert.global] global fails`);
    });

    it("Not Global Assertion", async() => {
        await browser.assert.not.global("notDefinedElement");
    });

    it("Not Global Assert Throws Not Defined", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.global("dummyQuery");
        }, `[assert.not.global] Expected "dummyQuery" not to be defined as global variable.`);
    });

    it("Not Global Assert Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.global("dummyQuery", "dummy");
        }, `[assert.not.global] Expected "dummyQuery" not to be defined as global variable with value "dummy".`);
    });

    it("Not Global Assert Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.global("dummyQuery", undefined, "not global fails");
        }, `[assert.not.global] not global fails`);
    });
});
