const { exec, execSync } = require('child_process');
const colors = require('colors');
const { log, clear } = require('console');
const readlineSync = require('readline-sync');

const prompt = require('prompt-sync')();

let message = '';
const choices = [
  {
    name: 'build: Changes that affect the build system or external dependencies',
    value: 'build',
  },
  {
    name: 'ci: Changes to our CI configuration files and scripts',
    value: 'ci',
  },
  {
    name: 'chore: Update tasks that do not cause code changes',
    value: 'chore',
  },
  { name: 'docs: Documentation only changes', value: 'docs' },
  { name: 'feat: A new feature', value: 'feat' },
  { name: 'fix: A bug fix', value: 'fix' },
  {
    name: 'improvement: Improves a current implementation without adding a new feature or fixing a bug',
    value: 'improvement',
  },
  { name: 'perf: A code change that improves performance', value: 'perf' },
  {
    name: 'refactor: A code change that neither fixes a bug nor adds a feature',
    value: 'refactor',
  },
  { name: 'revert: Reverts a previous commit', value: 'revert' },
  {
    name: 'style: Changes that do not affect the meaning of the code',
    value: 'style',
  },
  {
    name: 'test: Adding missing tests or correcting existing tests',
    value: 'test',
  },
  { name: "other: Doesn't fit any of the suggested types?", value: 'other' },
];

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let selectedIndex = 0;

function displayChoices() {
  console.clear();
  execSync('clear');
  log('Use arrow keys to navigate. Press enter to select.'.green);
  choices.forEach((c, idx) => {
    if (idx === selectedIndex) {
      console.log(
        colors.bgYellow.bold.green(`
      > ${idx + 1}. ${c.name}  `)
      );
    }
  });
}

displayChoices();

const handleUnStagedFiles = (files) => {
  execSync(`git add .`, (error, stdout, stderr) => {
    if (error) {
      return;
    }
  });
  execSync(`git commit -m "${message}"`, (error, stdout, stderr) => {
    if (error) {
      log('Something went wrong. Please try again.'.red);
      return;
    }
    console.log(`Commit successful`.green.bold);
  });
};

rl.input.on('keypress', (_, key) => {
  if (key.name === 'up') {
    selectedIndex = Math.max(selectedIndex - 1, 0);
    displayChoices();
  } else if (key.name === 'down') {
    selectedIndex = Math.min(selectedIndex + 1, choices.length - 1);
    displayChoices();
  } else if (key.name === 'return') {
    const choice = choices[selectedIndex];
    console.log(`You selected: ${choice.name}`);
    message += choice.value;
    const scope = prompt('Enter the scope of the work you done: ');
    message += `(${scope}): `;
    const description = prompt('Enter a description of the work you done: ');
    message += `${description}`;
    console.log(`Your commit message is: ${message}`);

    exec(`git commit -m "${message}"`, (error, stdout, stderr) => {
      if (error) {
        if (error.code === 1) {
          log('You have un staged files.'.red);
          log('Un staged files:'.red);
          log(execSync('git status --porcelain', { encoding: 'utf-8' }));
          log(
            `You have un-staged files. Would you like to add them? (y/n)`.red
          );

          const answer = readlineSync.question('y/n: ', {
            limit: ['y', 'n'],
            limitMessage: 'Please enter y or n',
          });
          if (answer === 'y') {
            handleUnStagedFiles();
          } else {
            log('Exiting...'.red);
            log('Please stage your files and try again.'.red);
            log('use: git add <file-name>'.red);
            process.exit(0);
          }

       
        }
      }

      rl.close();
    });
  }
});

rl.on('close', () => {
  console.log('Exiting...');
});
