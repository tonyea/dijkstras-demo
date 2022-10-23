import chalkAnimation from "chalk-animation";
import chalk from "chalk";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";

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

  rainbowTitle.stop();

  console.log(`
${chalk.bgBlue("INSTRUCTIONS")}
As of today, these are the available ports:
${cities.map((c) => `city: # ${c.code}:${c.name}`).join("\n")}
And these are the available routes:
${routes.map((r) => `route: # ${r[0]}>${r[1]}`).join("\n")}
  `);
};

const getCityCode = async (cities: CityCode[], message: string) => {
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

interface INodeNeighborCost {
  [key: string]: number;
}
interface IGraph {
  start: INodeNeighborCost;
  [key: string]: INodeNeighborCost;
  finish: INodeNeighborCost;
}

// Each key has an object for its value, which represents the immediate neighbors and the cost of reaching that neighbor.
const getCostOfReachingDestination = (
  routes: Route[],
  origin: CityCode,
  destination: CityCode,
  homeCity: CityCode
): INodeNeighborCost => {
  return routes
    .filter((r) => r[0] === origin)
    .map((r) => ({ [r[1]]: homeCity === r[1] ? 1 : 2 })) // 2 hours if not home city
    .reduce((map, obj) => {
      // takes [{CI: 1}, {K:2}, {TO:2}] converts it to {CI: 1, K:2, TO:2}
      const cost = obj[Object.keys(obj)[0]];
      if (Object.keys(obj)[0] === destination) map["finish"] = cost;
      else map[Object.keys(obj)[0]] = cost;
      return map;
    }, {});
};

const createGraph = (
  origin: CityCode,
  homeCity: CityCode,
  destination: CityCode,
  routes: Route[],
  cities: City[]
): IGraph => {
  // get cost of start node
  const start: INodeNeighborCost = getCostOfReachingDestination(
    routes,
    origin,
    destination,
    homeCity
  );

  // set graph
  const graph = { start, finish: {} };
  // get cost of intermediate nodes
  const intermediateCities = cities.filter(
    (c) => c.code !== origin && c.code !== destination
  ); // skip start and finish
  for (const city of intermediateCities) {
    const nodeCost = getCostOfReachingDestination(
      routes,
      city.code,
      destination,
      homeCity
    );
    const costObj = { [city.code]: nodeCost };
    Object.assign(graph, costObj);
  }

  return graph;
};

const lowestCostNode = (costs: INodeNeighborCost, processed: string[]) => {
  return Object.keys(costs).reduce((lowest, node) => {
    if (lowest === "" || costs[node] < costs[lowest]) {
      if (!processed.includes(node)) {
        lowest = node;
      }
    }
    return lowest;
  }, "");
};

// function that returns the minimum cost and path to reach Finish
const dijkstra = (graph: IGraph) => {
  // track lowest cost to reach each node
  const costs: {
    finish: number;
  } & INodeNeighborCost = Object.assign({ finish: Infinity }, graph.start);

  // track paths
  const parents = { finish: null };
  for (let child in graph.start) {
    parents[child] = "start";
  }

  // track nodes that have already been processed
  const processed: string[] = [];

  let node = lowestCostNode(costs, processed);

  while (node) {
    let cost = costs[node];
    let children = graph[node];
    for (let n in children) {
      let newCost = cost + children[n];
      if (!costs[n]) {
        costs[n] = newCost;
        parents[n] = node;
      }
      if (costs[n] > newCost) {
        costs[n] = newCost;
        parents[n] = node;
      }
    }
    processed.push(node);
    node = lowestCostNode(costs, processed);
  }

  let optimalPath = ["finish"];
  let parent = parents.finish;
  while (parent) {
    optimalPath.push(parent);
    parent = parents[parent];
  }
  optimalPath.reverse();

  const results = {
    distance: costs.finish,
    path: optimalPath,
  };

  return results;
};

const completion = (isCorrect: boolean, message = "") => {
  if (isCorrect) {
    console.clear();
    console.log(`
${chalk.bgGreen("Success! A route was found")}
${message}
    `);
  } else {
    console.log(`
${chalk.bgRed("NO route was found within the time limit specified")}
${message}
        `);
  }
};

const handleAnswer = async (
  homeCity: CityCode,
  origin: CityCode,
  destination: CityCode,
  timeLimit: number,
  routes: Route[],
  cities: City[]
) => {
  const spinner = createSpinner("Checking answer...").start();

  const graph = createGraph(origin, homeCity, destination, routes, cities);
  const solution = dijkstra(graph);

  // If route time is less than time limit then route found within time limit
  const solutionMessage = `
  Shortest Route: ${solution.path
    .join(" to ")
    .replace("start", origin)
    .replace("finish", destination)}
  Travel duration: ${solution.distance} hours
  `;

  spinner.stop();

  if (solution.distance <= timeLimit) await completion(true, solutionMessage);
  // No route found within time limit
  else await completion(false, solutionMessage);
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

  const destination = await getCityCode(
    cities.filter((c) => c.code !== origin).map((c) => c.code), // filter out origin city
    "Arrive in?"
  );
  const timeLimit = await timeLimitQuestion();
  await handleAnswer(homeCity, origin, destination, timeLimit, routes, cities);
};

await main();
