"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;

describe("Console", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.console);
    });

    afterEach(() => {
        browser.console.clear();
    });

    after(async() => {
        await browser.close();
    });

    it("Logs List", async() => {
        const logList = browser.console.all();
        assert.strictEqual(logList.length, 1);
        assert.strictEqual(logList[0].text, 'Normal Log {"msg":"Object Log"}');
        assert.strictEqual(logList[0].type, browser.console.LogType.log);
    });

    it("Logs List Different Types", async() => {
        await browser.click(".log");
        await browser.click(".error");
        await browser.wait(1);
        const logList = browser.console.all();
        assert.strictEqual(logList.length, 3);
        assert.strictEqual(logList[1].text, "Info Log");
        assert.strictEqual(logList[1].type, browser.console.LogType.info);
        assert.strictEqual(logList[2].text, "Error Log extra arg");
        assert.strictEqual(logList[2].type, browser.console.LogType.error);
    });

    it("Log Clear", () => {
        assert.strictEqual(browser.console.all().length, 1);
        browser.console.clear();
        assert.strictEqual(browser.console.all().length, 0);
    });

    it("Log Types", () => {
        assert(browser.console.LogType.log);
        assert(browser.console.LogType.debug);
        assert(browser.console.LogType.info);
        assert(browser.console.LogType.error);
        assert(browser.console.LogType.warning);
        assert(browser.console.LogType.trace);
    });

    it("Find Log By Type", async() => {
        await browser.click(".log");
        await browser.click(".error");
        await browser.wait(1);
        const logs = browser.console.filter({type: browser.console.LogType.error});
        assert.strictEqual(logs.length, 1);
        assert.strictEqual(logs[0].text, "Error Log extra arg");
        assert.strictEqual(logs[0].type, browser.console.LogType.error);
    });

    it("Find Log By Text", async() => {
        await browser.click(".log");
        await browser.click(".error");
        const logs = browser.console.filter({text: "Info Log"});
        assert.strictEqual(logs.length, 1);
        assert.strictEqual(logs[0].text, "Info Log");
        assert.strictEqual(logs[0].type, browser.console.LogType.info);
    });

    it("Find Log By Regex", async() => {
        await browser.click(".log");
        await browser.click(".error");
        const logs = browser.console.filter({text: /Info\sLog/});
        assert.strictEqual(logs.length, 1);
        assert.strictEqual(logs[0].text, "Info Log");
        assert.strictEqual(logs[0].type, browser.console.LogType.info);
    });

    it("Find Log By Text And Type", async() => {
        await browser.click(".error");
        await browser.wait(5);
        const logs = browser.console.filter({type: browser.console.LogType.error,
            text: "Error Log extra arg"});
        assert.strictEqual(logs.length, 1);
        assert.strictEqual(logs[0].text, "Error Log extra arg");
        assert.strictEqual(logs[0].type, browser.console.LogType.error);
    });

    it("Find Log By Text And Type Empty", async() => {
        await browser.click(".error");
        const logs = browser.console.filter({type: browser.console.LogType.error,
            text: "Info Log"});
        assert.strictEqual(logs.length, 0);
    });

    it("Find Log By Empty Filter", async() => {
        const logs = browser.console.filter({});
        assert.strictEqual(logs.length, 1);
    });

    it("Find Log By Undefined Filter", async() => {
        const logs = browser.console.filter();
        assert.strictEqual(logs.length, 1);
    });
});
