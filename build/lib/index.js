import chalkAnimation from "chalk-animation";
import chalk from "chalk";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";
const welcome = async (cities, routes) => {
    const rainbowTitle = chalkAnimation.rainbow("Welcome to Earth in a parallel universe\n");
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
const getCityCode = async (cities, message) => {
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
// interface INodeCosts {
//   start: INodeNeighborCost;
//   [key: string]: INodeNeighborCost;
//   finish: INodeNeighborCost;
// }
// Each key has an object for its value, which represents the immediate neighbors and the cost of reaching that neighbor.
const getCostOfReachingDestination = (routes, origin, destination, homeCity) => {
    return routes
        .filter((r) => r[0] === origin)
        .map((r) => ({ [r[1]]: homeCity === r[1] ? 1 : 2 })) // 2 hours if not home city
        .reduce((map, obj) => {
        // takes [{CI: 1}, {K:2}, {TO:2}] converts it to {CI: 1, K:2, TO:2}
        const cost = obj[Object.keys(obj)[0]];
        if (Object.keys(obj)[0] === destination)
            map["finish"] = cost;
        else
            map[Object.keys(obj)[0]] = cost;
        return map;
    }, {});
};
const createGraph = (origin, homeCity, destination, routes, cities) => {
    // get cost of start node
    const start = getCostOfReachingDestination(routes, origin, destination, homeCity);
    // set graph
    const graph = { start };
    // get cost of intermediate nodes
    const intermediateCities = cities.filter((c) => c.code !== origin && c.code !== destination); // skip start and finish
    for (const city of intermediateCities) {
        const nodeCost = getCostOfReachingDestination(routes, city.code, destination, homeCity);
        const costObj = { [city.code]: nodeCost };
        Object.assign(graph, costObj);
    }
    Object.assign(graph, { finish: {} });
    return graph;
};
const handleAnswer = async (homeCity, origin, destination, _timeLimit, routes, cities) => {
    const spinner = createSpinner("Checking answer...").start();
    //   await sleep();
    spinner.stop();
    // TODO: if origin === destination then return or throw;
    const graph = createGraph(origin, homeCity, destination, routes, cities);
    console.log("TIME GRAPH", graph);
    // If route time is less than time limit then route found within time limit
    //   if (timeTravelled <= timeLimit) await completion(true);
    //   // No route found within time limit
    //   else await completion(false);
};
const main = async () => {
    const cities = [
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
    const routes = [
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
    const homeCity = await getCityCode(cities.map((c) => c.code), "Your home city?");
    const origin = await getCityCode(cities.map((c) => c.code), "Leaving from?");
    // TODO: validate that you cannot travel to departure city
    const destination = await getCityCode(cities.map((c) => c.code), "Arrive in?");
    const timeLimit = await timeLimitQuestion();
    console.log("TBDT", homeCity, origin, destination, timeLimit);
    await handleAnswer(homeCity, origin, destination, timeLimit, routes, cities);
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
//# sourceMappingURL=index.js.map