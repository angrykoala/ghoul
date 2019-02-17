"use strict";

const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Assert Element", function() {
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


    it("Elements", async() => {
        await browser.assert.elements("p", 2);
        await browser.assert.elements("p", {equal: 2});
        await browser.assert.elements("p.not-exists", 0);
        await browser.assert.elements("p", {atLeast: 1});
        await browser.assert.elements("p", {atLeast: 2});
        await browser.assert.elements("p", {atMost: 3});
        await browser.assert.elements("p", {atMost: 2});
        await browser.assert.elements("p", {atLeast: 1,
            atMost: 3});
        await browser.assert.elements("p", {atLeast: 1,
            equal: 2,
            atMost: 3});
    });

    it("Elements Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.elements("p", 3);
        }, `[assert.elements] Expected selector "p" to find exactly 3 elements, 2 found`, "2", "3");
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.elements("p", {atLeast: 3});
        }, `[assert.elements] Expected selector "p" to find at least 3 elements, 2 found`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.elements("p", {atMost: 1});
        }, `[assert.elements] Expected selector "p" to find up to 1 elements, 2 found`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.elements("p", {atMost: 4,
                atLeast: 3});
        }, `[assert.elements] Expected selector "p" to find between 3 and 4 elements, 2 found`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.elements("p", {atMost: 1,
                atLeast: 0});
        }, `[assert.elements] Expected selector "p" to find between 0 and 1 elements, 2 found`);
    });

    it("Elements Throws With Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.elements("p", 3, "elements failed");
        }, `[assert.elements] elements failed`);
    });

    it("Element", async() => {
        await browser.assert.element("h1");
    });

    it("Element Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.element("p.not-exist");
        }, `[assert.element] Expected selector "p.not-exist" to find exactly 1 elements, 0 found`, "0", "1");
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.element("p");
        }, `[assert.element] Expected selector "p" to find exactly 1 elements, 2 found`, "2", "1");
    });

    it("Element Throws With Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.element("p", "element failed");
        }, `[assert.element] element failed`);
    });

    it("Not Element", async() => {
        await browser.assert.not.element("h2");
    });

    it("Not Element Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.element("h1");
        }, `[assert.not.element] Expected selector "h1" not to find any elements.`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.element("p");
        }, `[assert.not.element] Expected selector "p" not to find any elements.`);
    });

    it("Not Element Throws With Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.element("h1", "not element failed");
        }, `[assert.not.element] not element failed`);
    });
});
