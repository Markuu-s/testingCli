const exec = require('child_process').execSync

const CPP_FILECOIN = '/Users/soramitsumacbook/cpp-filecoin/'

const CLI_BIN = CPP_FILECOIN + 'cmake-build-debug/core/cli/example/cli_example'

const REPO = ' --repo /Users/soramitsumacbook/Downloads/fc-js-scripts/tmp-deal/repo-fuhon1 '

const DEFAULT = CLI_BIN + REPO

function print(a) {
    console.log(a.toString("utf-8"))
}

const sizeBLS = 86;
const sizeDEFAULT_ADDRESS = 41;


describe("Wallet", () => {
    describe("New", () => {
        test("Default, without args", (done) => {
            expect(exec(DEFAULT + 'wallet new').toString('utf-8'))
                .toHaveLength(sizeDEFAULT_ADDRESS)
            done()
        })

        test("Default with args", (done) => {
            expect(exec(DEFAULT + 'wallet new secp256k1').toString('utf-8'))
                .toHaveLength(sizeDEFAULT_ADDRESS)
            done()
        })

        test('bls', (done) => {
            expect(exec(DEFAULT + 'wallet new bls').toString('utf-8'))
                .toHaveLength(sizeBLS)
            done()
        })

        test('not correct type', (done) => {
            expect(exec(DEFAULT + 'wallet new bEr').toString('utf-8'))
                .toEqual(expect.stringContaining('error:'))
            done()
        })
    })

    describe("default and set-default", () => {
        test('Get default address', (done) => {
            expect([sizeDEFAULT_ADDRESS, sizeBLS])
                .toContainEqual(exec(DEFAULT + 'wallet default').toString('utf-8').length)

            expect([sizeDEFAULT_ADDRESS, sizeBLS])
                .not.toContainEqual(exec(DEFAULT + 'wallet defalt').toString('utf-8').length)
            done()
        })

        test('Set default bls address', (done) => {
            const new_address = exec(DEFAULT + 'wallet new bls').toString('utf-8')
            const old_address = exec(DEFAULT + 'wallet default').toString('utf-8')

            exec(DEFAULT + 'wallet set-default ' + new_address)
            const default_address = exec(DEFAULT + 'wallet default').toString('utf-8')

            expect(default_address)
                .toEqual(new_address)
            expect(default_address)
                .not.toEqual(old_address)

            done()
        })

        test('Set default default-address', (done) => {
            const new_address = exec(DEFAULT + 'wallet new').toString('utf-8')
            const old_address = exec(DEFAULT + 'wallet default').toString('utf-8')

            exec(DEFAULT + 'wallet set-default ' + new_address)
            const default_address = exec(DEFAULT + 'wallet default').toString('utf-8')

            expect(default_address)
                .toEqual(new_address)
            expect(default_address)
                .not.toEqual(old_address)

            done()
        })
    })
})