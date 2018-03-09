#!/usr/bin/env node

const path = require('path');
const jsonfile = require('jsonfile');
const program = require('commander');
const dateformat = require('dateformat');
const inquirer = require('inquirer');
const WiseQuotes = require('../index.js');
const pkg = require('../package.json');

const wq = new WiseQuotes();

/************************************************************
  Definitions.
*************************************************************/

program
  .version(pkg.version)
  .option('-s, --status', 'display status');

program
  .command('backup')
  .description('generate backup.json file.')
  .action(generateBackupJSON);

program
  .command('make')
  .description('generate quotes.json file.')
  .option('-o, --output <path>', 'Output path.')
  .action(generateQuotesJSON);

program
  .command('feed')
  .description('feed to database.')
  .action(feedProcess);

program
  .command('match <query>')
  .description('Search from quote table.')
  .action(matchQuotes);

program
  .command('tag <name>')
  .description('Retrieve quotes by tag name.')
  .action(retrieveByTagName);

program
  .command('db:refresh')
  .description('Refreshing database.')
  .option('-f, --feed <file>', 'Set feed file.')
  .action(databaseRefresh);

program.parse(process.argv);

/************************************************************
  Actions
*************************************************************/

if (process.argv.length < 3) {
  // no arg -> help
  program.outputHelp();
}

if (program.status) {
  displayStatus();
}

async function displayStatus() {
  let count = await wq.count;

  console.log(`Total rows: ${count}`);
  console.log(await wq.random);
}

async function generateQuotesJSON({ output }) {
  const rows = await wq.all();
  const defaultFileName = 'quotes.json';
  const file = output
    ? path.extname(output) ? path.resolve(output) : path. resolve(output, defaultFileName)
    : path.resolve(__dirname, '../db/', defaultFileName);

  jsonfile.writeFile(file, rows, { spaces: 0 }, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log(`Generate File: ${file}`);
    }
  });
}

async function generateBackupJSON() {
  let rows = await wq.all();
  let file = path.resolve(
    __dirname,
    '../db/backup/' + dateformat(new Date(), 'yyyymmdd') + '_quotes.json'
  );

  jsonfile.writeFile(file, rows, { spaces: 2 }, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log(`Backup to: ${file}`);
    }
  });
}

async function feedProcess() {
  let result = await wq.feed();

  console.log(result);
}

async function matchQuotes(query) {
  let rows = await wq.match(query);
  console.log(`Hits: ${rows.length}`);
  rows.forEach(row => {
    console.log(`${row.author} - ${row.content}`);
  });
}

async function retrieveByTagName(name) {
  let rows = await wq.retrieveByTagName(name);
  console.log(`Hits: ${rows.length}`);
  rows.forEach(row => {
    console.log(`${row.author} - ${row.content}`);
  });
}

async function databaseRefresh(cmd) {
  const question = {
    type: 'confirm',
    name: 'confirmed',
    message: 'Are you sure?',
    default: false,
  };
  const refreshProcess = async () => {
    console.log(await wq.migration());
    if (cmd.feed) {
      console.log(`Feed from feeds/${cmd.feed}`);
      wq.feed(cmd.feed);
    }

    return 'Database refresh complete.';
  };

  inquirer.prompt(question)
    .then(async res => {
      if (res.confirmed) {
        console.log(await refreshProcess());
      } else {
        console.log('Command is canceled.');
      }
    });
}
