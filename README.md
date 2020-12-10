# SFDX Scratch Org Steps:

`sfdx force:project:create -n <PROJECTNAME> -x`   
1. open project via vsc
2. SFDX: Create a Default Scratch Org   
   a. via vsc: click bottom left button & follow prompts,   
   OR   
   b. via command line: `sfdx force:org:create -f config/project-scratch-def.json -a <PROJECTNAME> -d 30 -s`

`npm install --force`

create github repo etc
1. `git init`
2. `git add .`
3. `git commit -m 'init commit'`
4. `git remote add origin https://github.com/mateo-navarrete/<PROJECTNAME>.git`
5. `git push origin master`

to setup custom fields on account object:   
connect to mateodx via vsc:   
click bottom left button (change default org)   
copy paste custom account field package.xml to retrive custom field metadata   
` sfdx force:mdapi:retrieve -r ./tmp -k ./manifest/package.xml -w 10`   
connect back to scratch org via vsc:   
click bottom left button (change default org)   
then open scratch org:   
`sfdx force:org:open`   
`setup > object manager > account > field & relationships > set history tracking > enable account history > [Account Name,Account Owner,Billing Address, Employees, Ownership, Phone, Website] > save `   
then   
`unzip -o ./tmp/unpackaged.zip -d ./tmp`   
then   
`sfdx force:mdapi:deploy -d ./tmp/unpackaged -w 10`   
to pull that data from scratch org:   
`sfdx force:source:pull`   
to push that data to scratch org:   
`sfdx force:source:deploy -p ./force-app/main/default/objects`   
@TODO: setup custom fields on account object via pulling from github repo directly etc iow git clone etc   

# Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
