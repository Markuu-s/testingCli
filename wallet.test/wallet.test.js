require('dotenv').config();

const child_process = require('child_process')
const exec = require('child_process').execSync

const fs = require('fs')
const json = JSON.parse(fs.readFileSync('path.json', 'utf8'))

const CXX_BIN = json.PATH_TO_CPP_FILECOIN_BIN
const REPO = ` --repo ${json.PATH_TO_WORK_NODE} `

const DEFAULT_CXX = CXX_BIN + REPO

function print(a) {
    console.log(a.toString("utf-8"))
}

const sizeBLS = 86;
const sizeDEFAULT_ADDRESS = 41;

jest.setTimeout(999999999);

const genesis_address = exec(`${DEFAULT_CXX} wallet default`).toString('utf-8')

describe("Wallet", () => {
    describe("New", () => {
        test("Default, without args", (done) => {
            expect(exec(`${DEFAULT_CXX} wallet new`).toString('utf-8'))
                .toHaveLength(sizeDEFAULT_ADDRESS)
            done()
        })

        test("Default with args", (done) => {
            expect(exec(DEFAULT_CXX + 'wallet new secp256k1').toString('utf-8'))
                .toHaveLength(sizeDEFAULT_ADDRESS)
            done()
        })

        test('bls', (done) => {
            expect(exec(DEFAULT_CXX + 'wallet new bls').toString('utf-8'))
                .toHaveLength(sizeBLS)
            done()
        })

        test('not correct type', (done) => {
            expect(exec(DEFAULT_CXX + 'wallet new bEr').toString('utf-8'))
                .toEqual(expect.stringContaining('error:'))
            done()
        })
    })

    describe("default and set-default", () => {
        test('Get default address', (done) => {
            expect([sizeDEFAULT_ADDRESS, sizeBLS])
                .toContainEqual(exec(DEFAULT_CXX + 'wallet default').toString('utf-8').length)

            expect([sizeDEFAULT_ADDRESS, sizeBLS])
                .not.toContainEqual(exec(DEFAULT_CXX + 'wallet defalt').toString('utf-8').length)
            done()
        })

        test('Set default bls address', (done) => {
            const new_address = exec(DEFAULT_CXX + 'wallet new bls').toString('utf-8')
            const old_address = exec(DEFAULT_CXX + 'wallet default').toString('utf-8')

            exec(DEFAULT_CXX + 'wallet set-default ' + new_address)
            const default_address = exec(DEFAULT_CXX + 'wallet default').toString('utf-8')

            expect(default_address)
                .toEqual(new_address)
            expect(default_address)
                .not.toEqual(old_address)

            done()
        })

        test('Set default default-address', (done) => {
            const new_address = exec(DEFAULT_CXX + 'wallet new').toString('utf-8')
            const old_address = exec(DEFAULT_CXX + 'wallet default').toString('utf-8')

            exec(DEFAULT_CXX + 'wallet set-default ' + new_address)
            const default_address = exec(DEFAULT_CXX + 'wallet default').toString('utf-8')

            expect(default_address)
                .toEqual(new_address)
            expect(default_address)
                .not.toEqual(old_address)

            done()
        })
    })

    describe('List', () => {
        test('Check add address and exist this address in list', (done) => {
            const old_addresses = exec(DEFAULT_CXX + 'wallet list -a').toString('utf-8').split('\n')

            const new_address_default = exec(DEFAULT_CXX + 'wallet new').toString('utf-8')
            const new_address_bls = exec(DEFAULT_CXX + 'wallet new bls').toString('utf-8')

            const new_addresses = exec(DEFAULT_CXX + 'wallet list -a').toString('utf-8').split('\n')

            expect(new_addresses)
                .toContainEqual(new_address_default)
            expect(old_addresses)
                .not.toContainEqual(new_address_default)

            expect(new_addresses)
                .toContainEqual(new_address_bls)
            expect(old_addresses)
                .not.toContainEqual(new_address_bls)
            done()
        })
    })

    describe('Delete', () => {
        test('Check delete address', (done) => {
            const address_default = exec(DEFAULT_CXX + 'wallet new').toString('utf-8')
            const address_bls = exec(DEFAULT_CXX + 'wallet new bls').toString('utf-8')

            const old_addresses = exec(DEFAULT_CXX + 'wallet list -a').toString('utf-8').split('\n')

            exec(DEFAULT_CXX + 'wallet delete ' + address_default)
            exec(DEFAULT_CXX + 'wallet delete ' + address_bls)

            const new_addresses = exec(DEFAULT_CXX + 'wallet list -a').toString('utf-8').split('\n')

            expect(old_addresses)
                .toContainEqual(address_default)
            expect(new_addresses)
                .not.toContainEqual(address_default)

            expect(old_addresses)
                .toContainEqual(address_bls)
            expect(new_addresses)
                .not.toContainEqual(address_bls)
            done()
        })

        test('After deleting address balance is saved', (done) => {
            const address_sec = exec(DEFAULT_CXX + 'wallet new').toString('utf-8')
            const address_bls = exec(DEFAULT_CXX + 'wallet new bls').toString('utf-8')

            const amount = '100'
            exec(DEFAULT_CXX + 'wallet add-balance --from t0100 ' + address_sec + ' ' + amount)
            exec(DEFAULT_CXX + 'wallet add-balance --from t0100 ' + address_bls + ' ' + amount)

            const address_sec_balance = exec(DEFAULT_CXX + 'wallet balance ' + address_sec).toString('utf-8')
            const address_bls_balance = exec(DEFAULT_CXX + 'wallet balance ' + address_bls).toString('utf-8')

            exec(DEFAULT_CXX + 'wallet delete ' + address_sec)
            exec(DEFAULT_CXX + 'wallet delete ' + address_bls)

            expect(exec(DEFAULT_CXX + 'wallet balance ' + address_sec).toString('utf-8'))
                .toEqual(address_sec_balance)

            expect(exec(DEFAULT_CXX + 'wallet balance ' + address_bls).toString('utf-8'))
                .toEqual(address_bls_balance)

            done()
        })
    })

    describe('Add-balance and balance', () => {
        test("Add-balance and check balance", (done) => {
            const new_wallet = exec(DEFAULT_CXX + 'wallet new').toString('utf-8')
            const old_balance = exec(DEFAULT_CXX + 'wallet balance ' + new_wallet).toString('utf-8')
            const delta = 100
            exec(DEFAULT_CXX + 'wallet add-balance --from t0100 ' + new_wallet + ' ' + delta)
            const new_balance = exec(DEFAULT_CXX + 'wallet balance ' + new_wallet).toString('utf-8')
            expect(parseInt(new_balance) - parseInt(old_balance))
                .toEqual(delta)
            done()
        })

        test('Add-balance and get balance to non-exist wallet', (done) => {
            const new_wallet = exec(DEFAULT_CXX + 'wallet new').toString('utf-8')
            exec(DEFAULT_CXX + 'wallet delete ' + new_wallet)
            const balance = '100'
            exec(DEFAULT_CXX + 'wallet add-balance --from t0100 ' + new_wallet + ' ' + balance)
            expect(exec(DEFAULT_CXX + 'wallet balance ' + new_wallet).toString('utf-8').split('\n').join(''))
                .toEqual(balance)
            done()
        })

        test('Add-balance from balance which contain less balancd then want to sent to another balance', (done) => {
            const address_1 = exec(DEFAULT_CXX + 'wallet new').toString('utf-8')
            const address_2 = exec(DEFAULT_CXX + 'wallet new').toString('utf-8')

            const balance_1 = '200'
            const balance_2 = '333'

            exec(DEFAULT_CXX + ' wallet add-balance --from t0100 ' + address_1 + ' ' + balance_1)
            exec(DEFAULT_CXX + 'wallet add-balance --from ' + address_1 + ' ' + address_2 + ' ' + balance_2)

            expect(exec(DEFAULT_CXX + 'wallet balance ' + address_1).toString('utf-8').split('\n').join(''))
                .toEqual(balance_1)
            expect(exec(DEFAULT_CXX + 'wallet balance ' + address_2).toString('utf-8'))
                .not.toEqual(balance_2)

            done()
        })
    })

    describe('Verify and sign', () => {
        test('Verify and sign check', (done) => {
            const address = exec(DEFAULT_CXX + 'wallet new').toString('utf-8')
            const not_correct_address = exec(DEFAULT_CXX + 'wallet new').toString('utf-8')
            const valid_message = 'hello'
            const non_valid_message = 'no hello'

            const hex_valid_message = Buffer.from(valid_message, 'utf-8').toString('hex')
            const hex_non_valid_message = Buffer.from(non_valid_message, 'utf-8').toString('hex')

            const signature = exec(`${DEFAULT_CXX} wallet sign ${address} ${hex_valid_message}`).toString('utf-8')

            expect(exec(`${DEFAULT_CXX} wallet verify ${address} ${hex_valid_message} ${signature}`).toString('utf-8').split('\n').join(''))
                .toEqual('valid')
            expect(exec(`${DEFAULT_CXX} wallet verify ${address} ${hex_non_valid_message} ${signature}`).toString('utf-8').split('\n'))
                .toContainEqual('invalid')
            expect(exec(`${DEFAULT_CXX} wallet verify ${not_correct_address} ${hex_valid_message} ${signature}`).toString('utf-8').split('\n'))
                .toContainEqual('invalid')
            done()
        })
    })

    describe('import', () => {
        const hex = '7b2254797065223a22626c73222c22507269766174654b6579223a' +
            '22414e6438397a4d6a47734e61413359525668794e4b553965376776686b324b305047526b39456c426b6a303d227d'
        const json = '{"Type":"bls","PrivateKey":"ANd89zMjGsNaA3YRVhyNKU9e7gvhk2K0PGRk9ElBkj0="}'
        const address = 't3wnsgz3ussu7erbcl2dxlmqbqd43zok3afuty2xdtafvz3uq5kwc35m7or5gzudmhiqvuqkwkb5vjplaljwca'

        const PATH_JSON_LOTUS = `${process.env.PATH_TO_WORK_DIRECTORY_NODEJS}/json-lotus.txt`
        const PATH_HEX_LOTUS = `${process.env.PATH_TO_WORK_DIRECTORY_NODEJS}/hex-json.txt`

        test('import from stdin json-lotus', (done) => {
            exec(`${DEFAULT_CXX} wallet delete ${address}`)

            const answer = child_process.spawnSync(CXX_BIN,
                ['--repo', process.env.PATH_TO_WORK_NODE, 'wallet',
                    'import', '--format', 'json-lotus'],
                {input: json})

            expect(answer.stdout.toString('utf-8').split(' ').pop().split('\n').join(''))
                .toEqual('successfully.')

            exec(`${DEFAULT_CXX} wallet delete ${address}`)

            done()
        })

        test('import from stdin hex-json', (done) => {
            exec(`${DEFAULT_CXX} wallet delete ${address}`)

            const answer = child_process.spawnSync(CXX_BIN,
                ['--repo', process.env.PATH_TO_WORK_NODE, 'wallet', 'import'],
                {input: hex})

            expect(answer.stdout.toString('utf-8').split(' ').pop().split('\n').join(''))
                .toEqual('successfully.')

            exec(`${DEFAULT_CXX} wallet delete ${address}`)

            done()
        })

        test('import from file json-lotus', (done) => {
            exec(`${DEFAULT_CXX} wallet delete ${address}`)

            expect(exec(`${DEFAULT_CXX} wallet import --format json-lotus ${PATH_JSON_LOTUS}`).toString('utf-8').split(' ').pop().split('\n').join(''))
                .toEqual('successfully.')

            exec(`${DEFAULT_CXX} wallet delete ${address}`)
            done()
        })

        test('import from file hex-json', (done) => {
            exec(`${DEFAULT_CXX} wallet delete ${address}`)

            expect(exec(`${DEFAULT_CXX} wallet import ${PATH_HEX_LOTUS}`).toString('utf-8').split(' ').pop().split('\n').join(''))
                .toEqual('successfully.')

            exec(`${DEFAULT_CXX} wallet delete ${address}`)
            done()
        })

        test('import with as-default', (done) => {
            exec(`${DEFAULT_CXX} wallet delete ${address}`)

            expect(exec(`${DEFAULT_CXX} wallet import --as-default ${PATH_HEX_LOTUS}`).toString('utf-8').split(' ').pop().split('\n').join(''))
                .toEqual('successfully.')

            expect(exec(`${DEFAULT_CXX} wallet default`).toString('utf-8').split('\n').join())
                .toEqual(address)

            exec(`${DEFAULT_CXX} wallet delete ${address}`)
            done()
        })
    })

    describe('market-add', () => {
        test('market-add', () => {
            exec(`${DEFAULT_CXX} wallet set-default ${genesis_address}`)
            const amount = 777

            function balance_market_default(addresses) {
                const default_address = exec(`${DEFAULT_CXX} wallet default`).toString('utf-8')
                for (let i = 0; i < addresses.length; ++i) {
                    if (addresses[i].split(' ')[0] == default_address) {
                        const r = addresses[i].split(' ').filter(function(f) {return f !== ''})
                        return r[2]
                    }
                }
                return -1;
            }

            let addresses = exec(`${DEFAULT_CXX} wallet list -m`).toString('utf-8').split('\n')
            const balance_market_old = balance_market_default(addresses)

            exec(`${DEFAULT_CXX} wallet market add --from t0100 ${amount}`)

            addresses = exec(`${DEFAULT_CXX} wallet list -m`).toString('utf-8').split('\n')
            const balance_market_new = balance_market_default(addresses)

            expect(balance_market_new - balance_market_old)
                .toEqual(amount)
        })
    })

    describe("console.log", () => {
        test("console.log(list)", (done) => {
            print(exec(`${DEFAULT_CXX} wallet list -m -i`))
            done()
        })
    })
})