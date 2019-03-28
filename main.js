"use strict";

const process = require('process');
const BrowserFactory = require('./lib/browser_factory');
const puppeteer = require('puppeteer');
const Errors = require('./lib/errors');

const defaultSettings = {
    log: false,
    headless: true,
    args: [],
    slowMo: 0,
    incognito: false,
    noSandbox: false,
    bypassCSP: true,
    proxyServer: null
};


const defaultPlugins = [{
    name: "cookies",
    plugin: require('./lib/modules/cookies/browser_cookies'),
    assertions: require('./lib/modules/cookies/cookies_assertion')
}, {
    name: "localStorage",
    plugin: require('./lib/modules/local_storage/browser_local_storage'),
    assertions: require('./lib/modules/local_storage/local_storage_assertions')
}, {
    name: "requests",
    plugin: require('./lib/modules/requests/browser_requests') // Assertion plugin separate
}, {
    name: "console",
    plugin: require('./lib/modules/console/browser_console'),
    assertions: require('./lib/modules/console/console_assertion')
}, {
    name: "webworkers",
    plugin: require('./lib/modules/webworkers/browser_webworkers'),
    assertions: require('./lib/modules/webworkers/webworkers_assertions')
}, {
    name: "dialog",
    plugin: require('./lib/modules/dialog/browser_dialog')
}];

class Wendigo {
    constructor() {
        this.customPlugins = [];
        this._browsers = [];
    }

    createBrowser(settings = {}) {
        settings = this._processSettings(settings);
        return this._createInstance(settings).then((instance) => {
            const plugins = defaultPlugins.concat(this.customPlugins);
            return instance.newPage().then((page) => {
                const b = BrowserFactory.createBrowser(page, settings, plugins);
                this._browsers.push(b); // TODO: remove closed browser when closed with browser.close
                return b;
            });
        });
    }

    stop() {
        this.clearPlugins();
        return Promise.all(this._browsers.map((b) => {
            return b.close();
        })).then(() => {
            this._browsers = [];
        }); // reset browsers before returning promise.
    }

    registerPlugin(name, plugin, assertions) {
        if (!plugin && !assertions && typeof name === 'object') {
            const config = name;
            name = config.name;
            plugin = config.plugin;
            assertions = config.assertions;
        }

        this._validatePlugin(name, plugin, assertions);

        BrowserFactory.clearCache();
        this.customPlugins.push({
            name: name,
            plugin: plugin,
            assertions: assertions
        });
    }

    clearPlugins() {
        this.customPlugins = [];
        BrowserFactory.clearCache();
    }

    get Errors() {
        return Errors;
    }

    _validatePlugin(name, plugin, assertions) {
        this._validatePluginName(name);
        if (plugin && typeof plugin !== 'function') throw new Errors.FatalError("registerPlugin", `Invalid plugin module "${name}".`);
        this._validatePluginAssertion(name, assertions);
        if (!plugin && !assertions) throw new Errors.FatalError("registerPlugin", `Invalid plugin module "${name}".`);
    }

    _validatePluginName(name) {
        if (!name || typeof name !== 'string') throw new Errors.FatalError("registerPlugin", `Plugin requires a name.`);
        let invalidNames = ["assert", "page", "not"];
        const plugins = defaultPlugins.concat(this.customPlugins);
        invalidNames = invalidNames.concat(plugins.map(p => p.name));
        const valid = !invalidNames.includes(name);
        if (!valid) throw new Errors.FatalError("registerPlugin", `Invalid plugin name "${name}".`);
    }

    _validatePluginAssertion(name, assertions) {
        if (assertions) {
            const isValidObject = assertions.assert || assertions.not;
            if (typeof assertions !== 'function' && !isValidObject) throw new Errors.FatalError("registerPlugin", `Invalid assertion module for plugin "${name}".`);
        }
    }

    _createInstance(settings) {
        return puppeteer.launch(settings).then((instance) => {
            if (settings.incognito) {
                return instance.createIncognitoBrowserContext();
            } else return instance;
        });
    }

    _removeBrowser(browser) {
        const idx = this._browsers.indexOf(browser);
        if (idx === -1) {
            throw new Errors.FatalError("browser not found on closing.");
        }
        this._browsers.splice(idx, 1);
    }

    _processSettings(settings) {
        settings = Object.assign({}, defaultSettings, settings);
        settings.__onClose = this._removeBrowser.bind(this);
        if (process.env.NO_SANDBOX || settings.noSandbox) {
            settings.args = settings.args.concat(['--no-sandbox', '--disable-setuid-sandbox']); // Required to run on some systems
        }

        if (settings.proxyServer) {
            settings.args.push(`--proxy-server=${settings.proxyServer}`);
        }

        if (settings.timezone) {
            if (!settings.env) settings.env = {};
            settings.env.TZ = settings.timezone;
        }
        return settings;
    }
}

module.exports = new Wendigo();
