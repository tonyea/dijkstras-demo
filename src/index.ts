import chalkAnimation from "chalk-animation";
import chalk from "chalk";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";
import figlet from "figlet";
import gradient from "gradient-string";

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

type CityCode = "CGY" | "CI" | "K" | "M" | "NYC" | "P" | "RI" | "RO" | "TO"  

type City = {
  code: CityCode;
  name: string;
};

const welcome = async (cities: City[]) => {
  const rainbowTitle = chalkAnimation.rainbow(
    "Welcome to Earth in a parallel universe\n"
  );

  await sleep();
  rainbowTitle.stop();

  console.log(`
${chalk.bgBlue("INSTRUCTIONS")}
As of today, this is the list of available ports:
${cities.map((c) => `city: # ${c.code}:${c.name}`).join("\n")}
  `);
};

const askName = async () => {
  const answers = await inquirer.prompt({
    name: "player_name",
    type: "input",
    message: "What is your name?",
    default() {
      return "Player";
    },
  });

  const playerName = answers.player_name;
  console.log("TBDT 100", playerName);
};

const question1 = async () => {
  const answers = await inquirer.prompt({
    name: "question_1",
    type: "list",
    message: "What is your name?",
    choices: [
      "May 23rd, 1995",
      "Nov 23rd, 1995",
      "June 23rd, 1995",
      "July 23rd, 1995",
    ],
  });

  return handleAnswer(answers.question_1 === "May 23rd, 1995");
};

const handleAnswer = async (isCorrect: boolean) => {
  const spinner = createSpinner("Checking answer...").start();

  await sleep();

  if (isCorrect) {
    spinner.success({ text: `Nice work bud` });
  } else {
    spinner.error({ text: "game over" });
    process.exit(1);
  }
};

const winner = async () => {
  console.clear();
  const msg = `Congrats bud!`;

  figlet(msg, (_err, data) => {
    console.log(gradient.pastel.multiline(data));
  });
};

const main = async () => {
  const cities: City[] = [
    { code: "CGY", name: "Calgary" },
    { code: "CI", name: "Chichen Itza" },
    { code: "K", name: "Kuala Lumpur" },
    { code: "M", name: "Moscow" },
    { code: "NYC", name: "New York City" },
    { code: "P", name: "Paris" },
    { code: "RI", name: "Rio de Janeiro" },
    { code: "RO", name: "Rome" },
    { code: "TO", name: "Toronto" },
  ];


  // display welcome message
  await welcome(cities);
  await askName();
  await question1();
  await winner();
};

await main();
