import chalkAnimation from "chalk-animation";
import chalk from "chalk";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";
// import figlet from "figlet";
// import gradient from "gradient-string";

// const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

type CityCode = "CGY" | "CI" | "K" | "M" | "NYC" | "P" | "RI" | "RO" | "TO";

type City = {
  code: CityCode;
  name: string;
};

type Route = [CityCode, CityCode];

const welcome = async (cities: City[], routes: Route[]) => {
  const rainbowTitle = chalkAnimation.rainbow(
    "Welcome to Earth in a parallel universe\n"
  );

  //   await sleep();
  rainbowTitle.stop();

  console.log(`
${chalk.bgBlue("INSTRUCTIONS")}
As of today, these are the available ports:
${cities.map((c) => `city: # ${c.code}:${c.name}`).join("\n")}
And these are the available routes:
${routes.map((r) => `route: # ${r[0]}>${r[1]}`).join("\n")}
  `);
};

const getCityCode = async (cities: string[], message: string) => {
  const answer = await inquirer.prompt({
    name: "city",
    type: "list",
    message,
    choices: cities,
  });

  return answer.city;
};

const timeLimitQuestion = async () => {
  const answer = await inquirer.prompt({
    name: "limit",
    type: "number",
    message: "How many hours can it take?",
    // show error message if not a number
    validate: (input) => !(isNaN(input) || input < 1),
  });

  return answer.limit;
};

// const completion = (isCorrect: boolean) => {
//   if (isCorrect) {
//     // console.clear();
//     figlet("Enjoy your travel!", (_err, data) => {
//       console.log(gradient.pastel.multiline(data));
//     });
//   } else {
//     process.exit(1);
//   }
// };

// export const calculateTimeTravelled = (
//   currentLocation: CityCode,
//   origin: CityCode,
//   destination: CityCode,
//   homeCity: CityCode,
//   routes: Route[]
// ): number => {
//   let commuteTime = 0;

//   // if point is same as origin return
//   if (origin === destination) return commuteTime;

//   // if point on route is NOT homeCity then plus 1 hour of commute
//   if (routes.find((r) => r[1] !== homeCity)) commuteTime += 1;

//   // if point is destination then return
//   if (currentLocation === destination) return commuteTime;
//   else {
//     // if point is not destination then plus 1 hours to commute
//     commuteTime += 1;

//     // call self with each points on available destinations
//     return calculateTimeTravelled(
//       currentLocation,
//       origin,
//       destination,
//       homeCity,
//       routes.filter((r) => r[0] === currentLocation)
//     );
//   }
// };

interface INodeNeighborCost {
  [key: string]: number;
}

// Each key has an object for its value, which represents the immediate neighbors and the cost of reaching that neighbor.
const getCostOfReachingDestination = (
  routes: Route[],
  origin: CityCode,
  homeCity: CityCode
): INodeNeighborCost => {
  return Object.assign(
    routes
      .filter((r) => r[0] === origin)
      .map((r) => ({ [r[1]]: homeCity === r[1] ? 1 : 2 }))
  ); // 2 hours if not home city
};

const createGraph = (
  origin: CityCode,
  homeCity: CityCode,
  destination: CityCode,
  routes: Route[]
) => {
  // get cost of start node
  const start: INodeNeighborCost = getCostOfReachingDestination(
    routes,
    origin,
    homeCity
  );

  let test = [];
  // get cost of intermediate nodes
  for (const route of routes) {
    if (route[0] === origin) continue; // skip start
    if (route[0] === destination) continue; // skip finish
    const x = getCostOfReachingDestination(routes, route[0], homeCity);
    test.push({
      [route[0]]: x,
    });
  }

  // set graph

  console.log("TBDT", start, destination, JSON.stringify(test));
};

const handleAnswer = async (
  homeCity: CityCode,
  origin: CityCode,
  destination: CityCode,
  _timeLimit: number,
  routes: Route[]
) => {
  const spinner = createSpinner("Checking answer...").start();

  //   await sleep();

  spinner.stop();

  createGraph(origin, homeCity, destination, routes);
  // iterate through routes and add time to travel through
  //   const timeTravelled = calculateTimeTravelled(
  //     origin,
  //     origin,
  //     destination,
  //     homeCity,
  //     routes
  //   );

  //   console.log("TIME TRAVELLED", timeTravelled);

  // If route time is less than time limit then route found within time limit
  //   if (timeTravelled <= timeLimit) await completion(true);
  //   // No route found within time limit
  //   else await completion(false);
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

  const routes: Route[] = [
    ["CGY", "CI"],
    ["CGY", "K"],
    ["CGY", "TO"],
    ["RI", "NYC"],
    ["RI", "CI"],
    ["RI", "TO"],
    ["P", "TO"],
    ["P", "RO"],
    ["P", "M"],
    ["NYC", "CGY"],
    ["NYC", "K"],
    ["CI", "RI"],
    ["K", "M"],
    ["K", "RO"],
    ["K", "P"],
    ["M", "RO"],
    ["M", "TO"],
    ["RO", "M"],
    ["RO", "CGY"],
    ["TO", "NYC"],
  ];

  // display welcome message
  await welcome(cities, routes);
  const homeCity = await getCityCode(
    cities.map((c) => c.code),
    "Your home city?"
  );
  const origin = await getCityCode(
    cities.map((c) => c.code),
    "Leaving from?"
  );

  // TODO: validate that you cannot travel to departure city
  const destination = await getCityCode(
    cities.map((c) => c.code),
    "Arrive in?"
  );
  const timeLimit = await timeLimitQuestion();
  console.log("TBDT", homeCity, origin, destination, timeLimit);
  await handleAnswer(homeCity, origin, destination, timeLimit, routes);
};

main();

// (async () => {
//     try {
//         const text = await main();
//         console.log(text);
//     } catch (e) {
//         // Deal with the fact the chain failed
//     }
//     // `text` is not available here
// })();
