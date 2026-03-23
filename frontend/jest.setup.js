// Silence les logs pendant les tests
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
};
