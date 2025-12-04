export default {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(axios)/)', // 👈 allows axios (ESM) to be transpiled
    ],
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};
