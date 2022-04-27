const exec = require('child_process').execSync

const CLI_BIN = '/Users/soramitsumacbook/cpp-filecoin/cmake-build-debug/bin/fuhon-node-cli'

const REPO = ' --repo /Users/soramitsumacbook/Downloads/fc-js-scripts/tmp-deal/repo-fuhon1'

function print(a) {
    console.log(a.toString("utf-8"))
}

console.log('list: ')
// exec(CLI_BIN + REPO + ' wallet add-balance --from t0100 ' + 't3wnsgz3ussu7erbcl2dxlmqbqd43zok3afuty2xdtafvz3uq5kwc35m7or5gzudmhiqvuqkwkb5vjplaljwca' + ' 100')
// print(exec(CLI_BIN + REPO + ' wallet list'))
// //print(exec(CLI_BIN + REPO + ' wallet import '))
// //const address = exec(CLI_BIN + REPO + ' wallet new').toString('utf-8')
// // print(exec(CLI_BIN + REPO + ' wallet balance t0100'))
// // print(exec(CLI_BIN + REPO + ' wallet add-balance --from t0100 t3q26n77athdzuuekxnk5lzhgepgcf7hittir453wzrdgbkzhoblqszflctw6gsanhcsie6py3liaeo2wsmnrr 200'))
print(exec(CLI_BIN + REPO + ' wallet list -m'))
// console.log('Default: ')
// print(exec(CLI_BIN + REPO + ' wallet default'))
//
//const address = exec(CLI_BIN + REPO + ' wallet new').toString('utf-8')
// console.log('New address: ' + address)
// print(exec(CLI_BIN + REPO + ' wallet set-default ' + address))
//
// console.log('list: ')
// print(exec(CLI_BIN + REPO + ' wallet list'))
// exec(CLI_BIN + REPO + ' wallet market add --from t3sr3knb6caivnmyo22l3whzrdoj3qk4f3eebzoureox2qhnyfunm6qrb7wx3yrk3knfciq2hkwnvcnotkm3eq --address t1sqgydre3z776gu3pvt2faag72efp72yrtixlm2q 1')
// print(exec(CLI_BIN + REPO + ' wallet list'))
// console.log('New default: ')
// print(exec(CLI_BIN + REPO + ' wallet default'))
//print(exec(CLI_BIN + REPO + ' wallet delete ' + address))
// print(exec(CLI_BIN + REPO + ' wallet market add --from t3rfbqmnbabjr2yacv7w7e75gbgkkdd7hvodd62zlxsphqwt2a2dlmv7kkykztrvumzco7jmorg2pdzweimcpq --address t1s6rvqsro3zjhk3ajqrc6qna2urxv4pdz24q6ccq 1'))
// print(exec(CLI_BIN + REPO + ' wallet balance'))
//
// console.log('Default: ')
// print(exec(CLI_BIN + REPO + ' wallet default'))
//
// console.log('List: ')
// print(exec(CLI_BIN + REPO + ' wallet list '))