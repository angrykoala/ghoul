"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo'); // Load from package.json
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');


describe("Plugins", () => {
    class PluginTest {
        constructor(browser) {
            this.browser = browser;
            this.beforeOpenCalled = false;
            this.beforeCloseCalled = false;
        }

        myMethod() {
            return "test";
        }

        _beforeOpen() {
            this.beforeOpenCalled = true;
        }

        _beforeClose() {
            this.beforeCloseCalled = true;
        }
    }

    class AssertionPluginTest {
        constructor(browser, pluginTest) {
            this.browser = browser;
            this.plugin = pluginTest;
        }

        myAssertion() {
            return "assertionTest";
        }
    }

    afterEach(() => {
        Wendigo.clearPlugins();
    });

    it("Register Plugin", async() => {
        let browser = await Wendigo.createBrowser();
        assert.strictEqual(browser.pluginTest, undefined);
        Wendigo.registerPlugin("pluginTest", PluginTest);
        await browser.close();
        browser = await Wendigo.createBrowser();
        assert.ok(browser.pluginTest);
        assert.strictEqual(browser.pluginTest.myMethod(), "test");
        assert.strictEqual(browser.pluginTest.browser, browser);
        assert.strictEqual(browser.assert.pluginTest, undefined);
        await browser.close();
    });

    it("Register Plugin With Object", async() => {
        let browser = await Wendigo.createBrowser();
        assert.strictEqual(browser.pluginTest, undefined);
        Wendigo.registerPlugin({
            name: "pluginTest",
            plugin: PluginTest,
            assertions: AssertionPluginTest
        });
        await browser.close();
        browser = await Wendigo.createBrowser();
        assert.ok(browser.pluginTest);
        assert.strictEqual(browser.pluginTest.myMethod(), "test");
        assert.strictEqual(browser.pluginTest.browser, browser);
        assert.strictEqual(browser.assert.pluginTest.myAssertion(), "assertionTest");
        await browser.close();
    });

    it("Plugin Hooks Before Open And Before Close", async() => {
        Wendigo.registerPlugin("pluginTest", PluginTest);
        const browser = await Wendigo.createBrowser();
        assert.ok(browser.pluginTest);
        assert.strictEqual(browser.pluginTest.beforeOpenCalled, false);
        assert.strictEqual(browser.pluginTest.beforeCloseCalled, false);
        await browser.open(configUrls.index);
        assert.strictEqual(browser.pluginTest.beforeOpenCalled, true);
        assert.strictEqual(browser.pluginTest.beforeCloseCalled, false);
        await browser.close();
        assert.strictEqual(browser.pluginTest.beforeCloseCalled, true);
        await browser.close();
    });

    it("Clear Plugins", async() => {
        Wendigo.registerPlugin("pluginTest", PluginTest);
        let browser = await Wendigo.createBrowser();
        assert.ok(browser.pluginTest);
        Wendigo.clearPlugins();
        await browser.close();
        browser = await Wendigo.createBrowser();
        assert.strictEqual(browser.pluginTest, undefined);
        assert.ok(browser.requests);
        assert.ok(browser.localStorage);
        await browser.close();
    });

    it("Register Plugin With Assertion", async() => {
        Wendigo.registerPlugin("pluginTest", PluginTest, AssertionPluginTest);
        const browser = await Wendigo.createBrowser();
        assert.ok(browser.pluginTest);
        assert.ok(browser.assert.pluginTest);
        assert.strictEqual(browser.assert.pluginTest.myAssertion(), "assertionTest");
        assert.strictEqual(browser.assert.pluginTest.browser, browser);
        assert.strictEqual(browser.assert.pluginTest.plugin, browser.pluginTest);
        await browser.close();
    });

    it("Register Plugin Only With Assertion", async() => {
        Wendigo.registerPlugin("pluginTest", null, AssertionPluginTest);
        const browser = await Wendigo.createBrowser();
        assert.strictEqual(browser.pluginTest, undefined);
        assert.ok(browser.assert.pluginTest);
        assert.strictEqual(browser.assert.pluginTest.myAssertion(), "assertionTest");
        assert.strictEqual(browser.assert.pluginTest.browser, browser);
        assert.strictEqual(browser.assert.pluginTest.plugin, undefined);
        await browser.close();
    });

    it("Register Plugin Invalid Name", async() => {
        await utils.assertThrowsAsync(() => {
            Wendigo.registerPlugin("requests", PluginTest);
        }, `Error: Invalid plugin name "requests".`);
        Wendigo.registerPlugin("pluginTest", PluginTest);

        await utils.assertThrowsAsync(() => {
            Wendigo.registerPlugin("pluginTest", PluginTest);
        }, `Error: Invalid plugin name "pluginTest".`);

        await utils.assertThrowsAsync(() => {
            Wendigo.registerPlugin("", PluginTest);
        }, `Error: Plugin requires a name.`);
    });

    it("Register Plugin Invalid Parameters", async() => {
        await utils.assertThrowsAsync(() => {
            Wendigo.registerPlugin("pluginTest");
        }, `Error: Invalid plugin module "pluginTest".`);

        await utils.assertThrowsAsync(() => {
            Wendigo.registerPlugin("pluginTest", {});
        }, `Error: Invalid plugin module "pluginTest".`);

        await utils.assertThrowsAsync(() => {
            Wendigo.registerPlugin("pluginTest", PluginTest, {});
        }, `Error: Invalid assertion module for plugin "pluginTest".`);
    });

    it("Register Plugin With Function Assertion", async() => {
        function assertionTest(browser, pluginTest) {
            return `assertionTest${pluginTest.myMethod()}`;
        }

        Wendigo.registerPlugin("pluginTest", PluginTest, assertionTest);
        const browser = await Wendigo.createBrowser();
        assert.ok(browser.pluginTest);
        assert.ok(browser.assert.pluginTest);
        assert.strictEqual(browser.assert.pluginTest(), "assertionTesttest");
        await browser.close();
    });
});
