import crypto from "crypto";
import { prisma } from "./db";

export function calculateBlockHash(block) {
  const dataString = `${block.id}-${block.researcherId}-${block.datasetQueried}-${new Date(block.timestamp).toISOString()}-${block.previousHash}`;
  return crypto.createHash("sha256").update(dataString).digest("hex");
}

export async function addLedgerEntry(researcherId, datasetQueried) {
  // Find the last block
  const lastBlock = await prisma.safeShareAuditLedger.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  });

  const previousHash = lastBlock ? lastBlock.hash : "0000000000000000000000000000000000000000000000000000000000000000";
  const id = crypto.randomUUID();
  const timestamp = new Date();

  // Create block object for hashing
  const tempBlock = {
    id,
    researcherId,
    datasetQueried,
    timestamp,
    previousHash,
  };

  const hash = calculateBlockHash(tempBlock);

  const newBlock = await prisma.safeShareAuditLedger.create({
    data: {
      id,
      researcherId,
      datasetQueried,
      timestamp,
      previousHash,
      hash,
    },
  });

  return newBlock;
}

export async function verifyLedgerIntegrity() {
  const blocks = await prisma.safeShareAuditLedger.findMany({
    orderBy: {
      timestamp: "asc",
    },
  });

  if (blocks.length === 0) {
    return { isValid: true, compromisedBlockId: null };
  }

  let expectedPreviousHash = "0000000000000000000000000000000000000000000000000000000000000000";

  for (const block of blocks) {
    // Check if the previous hash is as expected
    if (block.previousHash !== expectedPreviousHash) {
      return { isValid: false, compromisedBlockId: block.id, reason: `Link mismatch: expected ${expectedPreviousHash}, got ${block.previousHash}` };
    }

    // Recalculate hash
    const calculated = calculateBlockHash(block);
    if (block.hash !== calculated) {
      return { isValid: false, compromisedBlockId: block.id, reason: `Hash mismatch: database has ${block.hash}, calculated ${calculated}` };
    }

    expectedPreviousHash = block.hash;
  }

  return { isValid: true, compromisedBlockId: null };
}
