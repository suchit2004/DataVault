import { PrismaClient } from "../src/generated/client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const url = `file:${dbPath}`;
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

const brokers = [
  {
    name: "Spokeo",
    url: "https://www.spokeo.com",
    optOutUrl: "https://www.spokeo.com/optout",
    optOutMethod: "form",
    jurisdiction: "CCPA",
    tier: 1,
    category: "People Search"
  },
  {
    name: "Whitepages",
    url: "https://www.whitepages.com",
    optOutUrl: "https://www.whitepages.com/suppression-request",
    optOutMethod: "form",
    jurisdiction: "CCPA",
    tier: 1,
    category: "People Search"
  },
  {
    name: "BeenVerified",
    url: "https://www.beenverified.com",
    optOutUrl: "https://www.beenverified.com/f/optout/search",
    optOutMethod: "form",
    jurisdiction: "CCPA",
    tier: 1,
    category: "People Search"
  },
  {
    name: "Intelius",
    url: "https://www.intelius.com",
    optOutUrl: "https://www.intelius.com/opt-out",
    optOutMethod: "form",
    jurisdiction: "CCPA",
    tier: 1,
    category: "People Search"
  },
  {
    name: "Radaris",
    url: "https://radaris.com",
    optOutUrl: "https://radaris.com/page/opt-out",
    optOutMethod: "form",
    jurisdiction: "CCPA",
    tier: 1,
    category: "People Search"
  },
  {
    name: "Acxiom",
    url: "https://www.acxiom.com",
    optOutUrl: "https://www.acxiom.com/privacy/opt-out-form/",
    optOutMethod: "form",
    jurisdiction: "GLOBAL",
    tier: 2,
    category: "Marketing"
  },
  {
    name: "Experian",
    url: "https://www.experian.com",
    optOutUrl: "https://www.experian.com/privacy/opt-out",
    optOutMethod: "email",
    jurisdiction: "GLOBAL",
    tier: 2,
    category: "Financial"
  },
  {
    name: "Equifax",
    url: "https://www.equifax.com",
    optOutUrl: "https://www.equifax.com/privacy/opt-out",
    optOutMethod: "email",
    jurisdiction: "GLOBAL",
    tier: 2,
    category: "Financial"
  },
  {
    name: "TransUnion",
    url: "https://www.transunion.com",
    optOutUrl: "https://www.transunion.com/privacy/opt-out",
    optOutMethod: "email",
    jurisdiction: "GLOBAL",
    tier: 2,
    category: "Financial"
  },
  {
    name: "LexisNexis",
    url: "https://www.lexisnexis.com",
    optOutUrl: "https://optout.lexisnexis.com",
    optOutMethod: "form",
    jurisdiction: "GLOBAL",
    tier: 3,
    category: "Risk/Legal"
  }
];

async function main() {
  console.log("Seeding data brokers...");
  for (const broker of brokers) {
    const existing = await prisma.broker.findFirst({
      where: { name: broker.name }
    });
    if (!existing) {
      await prisma.broker.create({ data: broker });
      console.log(`Created broker: ${broker.name}`);
    } else {
      console.log(`Broker ${broker.name} already exists`);
    }
  }
  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
