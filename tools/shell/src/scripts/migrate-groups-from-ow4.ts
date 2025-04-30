import fs from "node:fs";
import path from "node:path";
import { exit } from "node:process";
import { Command } from 'commander';
import { prisma } from "../services";

function printEnvironment() {
  console.log('\nEnvironment Variables:');
  console.log('---------------------');
  console.dir(env, { depth: null })
  console.log('---------------------');
}

async function dumpData() {
  const PAGE_LIMIT = 20
  async function dumpGroups() {
    // Sanity configuration
    const result = [];
    let page = 1;
    const getGroupUrl = (page: number) =>
      `https://old.online.ntnu.no/api/v1/group/online-groups/?format=json&page=${page}`;

    while (true) {
      const response = await fetch(getGroupUrl(page));
      const data = await response.json();
      if (data.next == null) {
        break;
      }
      page++;
      result.push(...data.results);

      if(page > PAGE_LIMIT) {
        console.error("Page limit reached in dumpGroups")
        exit(1)
      }
    }

    return result;
  }

    async function dumpHobbys() {
      const result = [];
      let page = 1;
      const getHobbyUrl = (page: number) =>
        `https://old.online.ntnu.no/api/v1/hobbys/?format=json&page=${page}`;

      while (true) {
        const response = await fetch(getHobbyUrl(page));
        const data = await response.json();
        if (data.next == null) {
          break;
        }
        page++;
        result.push(...data.results);

        if(page > PAGE_LIMIT) {
          console.error("Page limit reached in dumpHobbys")
          exit(1)
        }
      }
      return result;
    }

  const groups = await dumpGroups();
  const hobbies = await dumpHobbys();

  const pathOfThisScript = import.meta.dirname
  fs.writeFileSync(path.resolve(pathOfThisScript, "./groups.json"), JSON.stringify(groups, null, 2));
  fs.writeFileSync(path.resolve(pathOfThisScript, "./hobbys.json"), JSON.stringify(hobbies, null, 2));
}

// @ts-ignore does not exist before running dumpData
import groups from "./groups.json" assert { type: "json" };

// @ts-ignore does not exist before running dumpData
import hobbies from "./hobbys.json" assert { type: "json" };
import { env } from "../env";

async function insertDump() {
  const committees = groups.filter(
    (item) => item.group_type == "committee"
  );
  const nodeCommittees = groups.filter(
    (item) => item.group_type == "node_committee"
  );
  const interestGroups = hobbies
  const other = groups.filter((item) => item.group_type == "other");

  console.log("\nCOMMITEES: ");
  committees.forEach((item) => console.log(item.name_short));

  console.log("\nNODE COMMITTEES: ");
  nodeCommittees.forEach((item) => console.log(item.name_short));

  console.log("\nOTHER: ");
  other.forEach((item) => console.log(item.name_short));

  console.log("\nINTEREST GROUPS: ");
  interestGroups.forEach((item) => console.log(item.title));

  console.log("\n\nInserting interest groups:")
  for (const item of interestGroups) {
    console.log(`Inserting ${item.title}`)
    await prisma.interestGroup.create({
      data: {
        name: item.title,
        description: item.description,
        image: item.image?.original
      },
    })
  }

  console.log("\n\nInserting committees:")
  for (const item of committees) {
    console.log(`Inserting ${item.name_short}`)
    await prisma.group.create({
      data: {
        name: item.name_short,
        description: item.description_short,
        type: "COMMITTEE",
        email: item.email,
        image: item.image?.original
      },
    })
  }

  console.log("\n\nInserting node committees:")
  for (const item of nodeCommittees) {
    console.log(`Inserting ${item.name_short}`)
    await prisma.group.create({
      data: {
        name: item.name_short,
        description: item.description_short,
        type: "NODECOMMITTEE",
        email: item.email,
        image: item.image?.original
      },
    })
  }
}

const program = new Command();

program
  .name('migrate-groups')
  .description('CLI tool for migrating groups from OW4')
  .addHelpText('beforeAll', () => {
    printEnvironment();
    return '';
  });

program
  .command('1')
  .description('Dump data from OW4 to JSON files')
  .action(async () => {
    try {
      await dumpData();
      console.log('Data successfully dumped to groups.json and hobbys.json');
    } catch (error) {
      console.error('Error dumping data:', error);
      process.exit(1);
    }
  });

program
  .command('2')
  .description('Insert dumped data into the database')
  .action(async () => {
    try {
      await insertDump();
      console.log('Data successfully inserted into database');
    } catch (error) {
      console.error('Error inserting data:', error);
      process.exit(1);
    }
  });

program
  .command('3')
  .description('Delete all groups and interest groups from the database')
  .action(async () => {
    try {
      await prisma.group.deleteMany();
      await prisma.interestGroup.deleteMany();
      console.log('Successfully deleted all groups and interest groups');
    } catch (error) {
      console.error('Error deleting data:', error);
      process.exit(1);
    }
  });

program
  .command('4')
  .description('Run the complete migration process (dump and insert)')
  .action(async () => {
    try {
      await dumpData();
      console.log('Data successfully dumped');
      await insertDump();
      console.log('Data successfully inserted');
    } catch (error) {
      console.error('Error during migration:', error);
      process.exit(1);
    }
  });

program
  .command('5')
  .description('Show groups and interest groups in database')
  .action(async () => {
    const groups = await prisma.group.findMany();
    const interestGroups = await prisma.interestGroup.findMany();
    console.log("\nGroups: \n", groups);
    console.log("\nInterest groups: \n", interestGroups);
  });

program.parse();
