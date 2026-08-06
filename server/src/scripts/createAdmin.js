import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { connectDatabase, disconnectDatabase } from "../db/mongoose.js";
import { userRepository } from "../repositories/user.repository.js";
import { hashPassword } from "../utils/password.js";
import { logger } from "../utils/logger.js";

const rl = readline.createInterface({ input, output });

async function promptRequired(label) {
  const value = (await rl.question(label)).trim();

  if (!value) {
    throw new Error(`${label.replace(":", "")} is required`);
  }

  return value;
}

async function main() {
  await connectDatabase();

  const name = await promptRequired("Name: ");
  const email = await promptRequired("Email: ");
  const password = await promptRequired("Password: ");

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  await userRepository.create({
    name,
    email,
    password: await hashPassword(password),
    role: "admin",
    isActive: true,
  });

  logger.info("Admin user created");
}

main()
  .catch((error) => {
    logger.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await disconnectDatabase();
  });

