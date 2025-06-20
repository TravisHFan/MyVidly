// Unit tests for startup/config.js

describe("startup/config", () => {
  afterEach(() => {
    jest.resetModules();
    /* clears Jest’s module registry before each test – essentially tearing down all 
    previously require()d modules so that subsequent tests load fresh instances */
    jest.dontMock("config");
    /* makes sure Jest uses the real config module unless you explicitly override it */
  });

  it("should throw if jwtPrivateKey is not defined", () => {
    jest.doMock("config", () => ({ get: jest.fn().mockReturnValue("") }));
    const configInit = require("../../../startup/config");
    expect(configInit).toThrow();
  });

  it("should not throw if jwtPrivateKey is defined", () => {
    jest.doMock("config", () => ({ get: jest.fn().mockReturnValue("myKey") }));
    const configInit = require("../../../startup/config");
    expect(() => configInit()).not.toThrow();
  });
});
