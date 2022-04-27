const fs = require('fs')
const json = JSON.parse(fs.readFileSync('../path.json', 'utf8'))

const exec = require('child_process').execSync

const CXX_BIN = json.PATH_TO_CPP_FILECOIN_BIN
const REPO = ` --repo ${json.PATH_TO_WORK_NODE} `

const DEFAULT_CXX = CXX_BIN + REPO

function print(a) {
    console.log(a + ' : ')
    console.log(exec(`${DEFAULT_CXX} ${a}`).toString("utf-8"))
    console.log('\n')
}

console.log(exec(`${DEFAULT_CXX} wallet market add 100`).toString('utf-8'))
print('client balances --client t0100')