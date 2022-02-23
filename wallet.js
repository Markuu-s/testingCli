const exec = require('child_process').execSync

const CPP_FILECOIN = '/Users/soramitsumacbook/cpp-filecoin/'

const CLI_BIN = CPP_FILECOIN + 'cmake-build-debug/core/cli/example/cli_example'

const REPO = ' --repo /Users/soramitsumacbook/Downloads/fc-js-scripts/tmp-deal/repo-fuhon1'

function print(a) {
    console.log(a.toString("utf-8"))
}

const new_ddr = exec(CLI_BIN + REPO + ' wallet new bls').toString('utf-8')
console.log(new_ddr)
exec(CLI_BIN + REPO + ' set-default ' + new_ddr)
print(exec(CLI_BIN + REPO + ' wallet default'))