const fs = require('fs')
const json = JSON.parse(fs.readFileSync('path.json', 'utf8'))

const exec = require('child_process').execSync

const CXX_BIN = json.PATH_TO_CPP_FILECOIN_BIN
const REPO = ` --repo ${json.PATH_TO_WORK_NODE} `

const WORK_DIRECTORY = json.PATH_TO_WORK_DIRECTORY_NODEJS
const input_files = `${WORK_DIRECTORY}/client.test/import/input`
const output_files = `${WORK_DIRECTORY}/client.test/import/output`

const DEFAULT_CXX = CXX_BIN + REPO

function print(a) {
    console.log(a.toString("utf-8"))
}

describe("Client", () => {
    describe("Balance", () => {
        const escrowed_avaliable = function (str) {
            str = str.split('\n')

            str[0] = str[0].split(' ')
            str[0] = str[0][3]
            str[0] = str[0].split('\t')
            const escrowed = parseInt(str[0][2])

            str[2] = str[2].split(' ')
            str[2] = str[2][2]
            str[2] = str[2].split('\t')
            const avaliable = parseInt(str[2][3])

            return [escrowed, avaliable]
        }

        test("Balance default", (done) => {
            const delta = 777
            const old_balance = escrowed_avaliable(exec(`${DEFAULT_CXX} client balances`).toString('utf-8'))
            exec(`${DEFAULT_CXX} wallet market add ${delta}`).toString('utf-8')
            const new_balance = escrowed_avaliable(exec(`${DEFAULT_CXX} client balances`).toString('utf-8'))

            expect(new_balance[0] - old_balance[0])
                .toEqual(delta)
            expect(new_balance[1] - old_balance[1])
                .toEqual(delta)

            print(exec(`${DEFAULT_CXX} client balances`))
            done()
        })

        test("Balance client", (done) => {
            const delta = 777
            const old_balance = escrowed_avaliable(exec(`${DEFAULT_CXX} client balances --client t0100`).toString('utf-8'))
            exec(`${DEFAULT_CXX} wallet market add --from t0100 -a t0100 ${delta}`).toString('utf-8')
            const new_balance = escrowed_avaliable(exec(`${DEFAULT_CXX} client balances --client t0100`).toString('utf-8'))

            expect(new_balance[0] - old_balance[0])
                .toEqual(delta)
            expect(new_balance[1] - old_balance[1])
                .toEqual(delta)

            done()
        })

    })

    function get_cid(s) {
        const temp = s.toString('utf-8').split('\n')[0].split(' ')
        return temp[3]
    }

    describe("generate-car", () => {
        function existFile(filePath) {
            try {
                fs.accessSync(filePath);
                return true;
            } catch (err) {
                return false;
            }
        }

        test("generate-car", (done) => {
            const input_path = `${input_files}/generate-car-import.txt`
            const output_path = `${output_files}/generate-car-import.txt`

            exec(`${DEFAULT_CXX} client generate-car ${input_path} ${output_path}`)

            expect(existFile(output_path))
                .toEqual(true)

            expect(existFile(`${input_path}.unixfs-tmp.car`))
                .toEqual(false)

            done()
        })

        test("generate-car non existing input-file", (done) => {
            const input_path = `${input_files}/FALSE-generate-car-import.txt`
            const output_path = `${output_files}/FALSE-generate-car-import.txt`

            const error = exec(`${DEFAULT_CXX} client generate-car ${input_path} ${output_path}`).toString('utf-8')

            expect(existFile(input_path))
                .toEqual(false)

            expect(existFile(`${input_path}.unixfs-tmp.car`))
                .toEqual(false)

            expect(existFile(output_path))
                .toEqual(false)

            expect(error.split(' '))
                .toContainEqual('not')

            done()
        })

    })


    describe("import", () => {
        test("check import equal files but one of this is car file", (done) => {
            const data_cid1 = get_cid(exec(`${DEFAULT_CXX} client import ${input_files}/test-import.txt`)
                .toString('utf-8'))
            const data_cid2 = get_cid(exec(`${DEFAULT_CXX} client import --car ${output_files}/test-import.txt`)
                .toString('utf-8'))

            expect(data_cid1)
                .toEqual(data_cid2)

            expect(data_cid1)
                .not.toEqual('Client')
            done()
        })
    })

    describe("client", () => {
        test("clients", (done) => {
            // const addr = exec(`${DEFAULT_CXX} wallet new`).toString('utf-8')
            // console.log(addr)
            // print(exec(`${DEFAULT_CXX} wallet add-balance --from t0100 ${addr} 9999`))
            print(exec(`${DEFAULT_CXX} filplus list-clients`))

            done()
        })

        test('check-client-datacap', (done) => {
            print(exec(`${DEFAULT_CXX} filplus check-client-datacap t081`))
            done()
        })
    })

    test("local", (done) => {
        const data_cid = get_cid(exec(`${DEFAULT_CXX} client import ${input_files}/check-local.txt`))
        let locals = exec(`${DEFAULT_CXX} client local`).toString('utf-8').split('\n')

        let flag = false
        function checkImport(data_cid_check) {
            for(let i = 0; i < locals.length; ++i) {
                if (locals[i].split(' ')[2] === data_cid_check) {
                    flag = true
                }
            }
        }

        flag = false
        checkImport(data_cid)
        expect(flag)
            .toEqual(true)

        exec(`${DEFAULT_CXX} client generate-car ${input_files}/check-local1.txt ${output_files}/check-local2.car`)
        const data_cid1 = get_cid(exec(`${DEFAULT_CXX} client import --car ${output_files}/check-local2.car`))
        locals = exec(`${DEFAULT_CXX} client local`).toString('utf-8').split('\n')

        flag = false
        checkImport(data_cid1)
        expect(flag)
            .toEqual(true)


        done()
    })

    describe("deal", () => {
        test("deal", (done) => {
            const data_cid = get_cid(exec(`${DEFAULT_CXX}` +
                `client import ${input_files}/deal.txt`))
            console.log(data_cid)

            print(exec(`${DEFAULT_CXX} client deal ${data_cid} t01000 100 518400`))
            // console.log(data_cid)

            done()
        })

        test("deal-stats", (done) => {
            print(exec(`${DEFAULT_CXX} client deal-stats`))

            done()
        })


        test("get-deal", (done) => {
            const data_cid1 = get_cid(exec(`${DEFAULT_CXX}` +
                `client import ${input_files}/get-deal.txt`))
            // console.log(data_cid1)
            // console.log(` client deal ${data_cid1} t01000 100 518400`)
            const data_cid2 = get_cid(exec(`${DEFAULT_CXX} client deal ${data_cid1} t01000 300 518400`))
            // console.log(data_cid2)

            // print(exec(`${DEFAULT_CXX} client find ${data_cid2}`))
            console.log(`${DEFAULT_CXX} client get-deal ${data_cid2}`)
            const json_answer = exec(`${DEFAULT_CXX} client get-deal ${data_cid2}`).toString('utf-8')
            const json_answer_pritty = JSON.parse(json_answer) // spacing level = 2
            console.log(json_answer)
            done()
        })

        test('inspect-deal', (done) => {
            // print(exec(`${DEFAULT_CXX} client inspect-deal --proposal-cid bafyreigtq25w4zjzwrxqe4mbsd5pvkymns3tuiwfaqhvchy5ce36snz2va`))

            const import_cid = get_cid(exec(`${DEFAULT_CXX} client import ${input_files}/get-deal.txt`))
            const deal_cid = get_cid(exec(`${DEFAULT_CXX} client deal ${import_cid} t01000 300 518400`))

            print(exec(`${DEFAULT_CXX} client inspect-deal --proposal-cid ${deal_cid}`))
            done()
        })


        function count_deals() {

        }
        test('list-deals', (done) => {
            print(exec(`${DEFAULT_CXX} client list-deals`))

            done()
        })
    })

    describe("notary", () => {
        test('grant-datacap', (done) => {
            print(exec(`${DEFAULT_CXX} wallet add-balance --from t0100 t3wnsgz3ussu7erbcl2dxlmqbqd43zok3afuty2xdtafvz3uq5kwc35m7or5gzudmhiqvuqkwkb5vjplaljwca 99999999999999999`))
            print(exec(`${DEFAULT_CXX} wallet balance t3wnsgz3ussu7erbcl2dxlmqbqd43zok3afuty2xdtafvz3uq5kwc35m7or5gzudmhiqvuqkwkb5vjplaljwca`))
            print(exec(`${DEFAULT_CXX} wallet import -f json-lotus ${WORK_DIRECTORY}/client.test/gen-key.txt`))
            const new_address = exec(`${DEFAULT_CXX} wallet new`).toString('utf-8')
            console.log(new_address)
            const amount = 256 + 1
            // const default_address = exec(`${DEFAULT_CXX} wallet default`).toString('utf-8')
            // print(exec(`${DEFAULT_CXX} wallet add-balance --from t0100 ${new_address} 999`))
            // print(exec(`${DEFAULT_CXX} wallet add-balance --from t0100 t081 999`))

            console.log(`${DEFAULT_CXX} filplus grant-datacap --from t0100 ${new_address} ${amount}`)

            print(exec(`${DEFAULT_CXX} filplus add-verifier --from t0100`))
            print(exec(`${DEFAULT_CXX} filplus grant-datacap --from t0100 ${new_address} ${amount}`))
            print(exec(`${DEFAULT_CXX} wallet balance`))

            // filplus grant-datacap --from t0100 t13mvwy3jwn724ljsxx6kdxdwxpp5brvpau6wf6gi 257
            done()
        })

        test('list-notaries', (done) => {
            print(exec(`${DEFAULT_CXX} filplus list-notaries`))
            done()
        })

        test('check-notary-datacap', (done) => {
            print(exec(`${DEFAULT_CXX} filplus check-notary-datacap t0100`))
            done()
        })
    })

    describe("find", () => {
        test("find", (done) => {
            const import_cid = get_cid(exec(`${DEFAULT_CXX} client import ${input_files}/input.txt`))
            const deal_cid = get_cid(exec(`${DEFAULT_CXX} client deal ${import_cid} t01000 100 518400`))

            console.log(`${DEFAULT_CXX} client find ${import_cid}`)
            print(exec(`${DEFAULT_CXX} client find ${import_cid}`))
            done()
        })
    })

    describe("retrieve", () => {
        test("retrieve allow-local", (done) => {
            const path = `${input_files}/retrieve.txt`
            const data_cid = get_cid(exec(`${DEFAULT_CXX} client import ${path}`))
            console.log(`${DEFAULT_CXX} client retrieve --allow-local --provider t0100 --maxPrice 99999 ${data_cid} ${path}`)
            print(exec(`${DEFAULT_CXX} client retrieve --allow-local --provider t0100 --maxPrice 99999 ${data_cid} ${path}`))

            done()
        })

        test("list-retrieve", (done) => {
            print(exec(`${DEFAULT_CXX} client list-retrievals --completed --verbose --show-failed`))
            done()
        })

        // test("retrieve", (done) => {
        //     const path_output = `${output_files}/retrieve_output.txt`
        //     const path_input = `${input_files}/retrieve_input.txt`
        //     const import_cid = get_cid(exec(`${DEFAULT_CXX} client import ${path_input}`))
        //     const deal_cid = get_cid(exec(`${DEFAULT_CXX} client deal ${import_cid} t01000 100 518400`))
        //
        //     console.log(`${DEFAULT_CXX} client retrieve --maxPrice 99999 ${deal_cid} ${path_output}`)
        //
        //     setTimeout(() => {
        //         print(exec(`${DEFAULT_CXX} client retrieve --maxPrice 99999 ${deal_cid} ${path_output}`))
        //         done()
        //     }, 90 * 1000)
        // }, 9999 * 1000)
    })
})