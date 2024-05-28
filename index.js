//  Packages
var core = require('@actions/core')
var execSync = require('child_process').execSync
code = execSync('npm install exeq --save')
var exeq = require('exeq')

//  Input variables
var CANARY_DEPLOYMENTS = core.getInput('canary-deployments')
var DOMAIN_MANAGER = core.getInput('domain-manager')

//  Installs Serverless and specified plugins
async function installServerlessAndPlugins() {
  await exeq(
    `echo Installing Serverless and plugins...`,
    `npm i serverless -g`,
    `npm i serverless-plugin-canary-deployments`,
    `npm i serverless-python-requirements`
  )
}

//  Runs Serverless deploy using AWS Credentials if specified, else SERVERLESS ACCESS KEY
async function runServerlessDeploy() {
  await exeq(
    `echo Running sls deploy...`,
    `if [ ${process.env.AWS_ACCESS_KEY_ID} ] && [ ${process.env.AWS_SECRET_ACCESS_KEY} ]; then
      npx sls config credentials --provider aws --key ${process.env.AWS_ACCESS_KEY_ID} --secret ${process.env.AWS_SECRET_ACCESS_KEY} --verbose
    fi`,
    `npx sls deploy --verbose`
  )
}

//  Runs all functions sequentially
async function handler() {
  try {
    await runServerlessDeploy()
  } catch (error) {
    core.setFailed(error.message);
  }
}

//  Main function
if (require.main === module) {
  handler()
}
