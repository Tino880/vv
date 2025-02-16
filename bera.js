import axios from 'axios';
import fs from 'fs/promises';
import readline from 'readline';
import { Web3 } from 'web3';
import chalk from 'chalk';

const web3 = new Web3();

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Generate Ethereum wallet
function generateEthWallet() {
    const account = web3.eth.accounts.create();
    return {
        address: account.address,
        privateKey: account.privateKey
    };
}

// Register single account to Bera API
async function registerAccount(refCode) {
    const url = 'https://api.berahoneycomb.xyz/referral';
    const wallet = generateEthWallet();

    const registrationData = {
        wallet: wallet.address,
        ref: refCode
    };

    try {
        console.log(chalk.yellow(`\n⏳ Registering wallet: ${wallet.address}`));
        const response = await axios.post(url, registrationData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (response.status === 200) {
            const registrationInfo = {
                wallet_address: wallet.address,
                private_key: wallet.privateKey,
                timestamp: new Date().toISOString()
            };

            await fs.appendFile(
                'successful_registrations.txt',
                JSON.stringify(registrationInfo) + '\n'
            );

            console.log(chalk.green(`✅ Successfully registered: ${wallet.address}`));
            return true;
        } else {
            console.log(chalk.red(`❌ Registration failed with status code: ${response.status}`));
            return false;
        }
    } catch (error) {
        console.log(chalk.red(`❌ Error during registration: ${error.message}`));
        return false;
    }
}

// Main function
async function main() {
    try {
        console.log(chalk.cyan('\n🚀 Bera Honeycomb Auto Registration Bot 🚀'));
        
        let refCode = await question(chalk.green('\n📋 Enter your referral code: '));
        while (!refCode.trim()) {
            console.log(chalk.red('❌ Referral code cannot be empty. Please try again.'));
            refCode = await question(chalk.green('📋 Enter your referral code: '));
        }

        let numAccounts;
        while (true) {
            const input = await question(chalk.green('🔢 Enter number of accounts to register: '));
            numAccounts = parseInt(input);
            if (!isNaN(numAccounts) && numAccounts > 0) break;
            console.log(chalk.red('❌ Please enter a valid number greater than 0.'));
        }

        console.log(chalk.cyan('\n🚀 Starting registration process...'));
        console.log(chalk.cyan(`📊 Target: ${numAccounts} accounts using referral code: ${refCode}`));
        console.log(chalk.cyan('-------------------------------------------'));

        let successful = 0;
        for (let i = 0; i < numAccounts; i++) {
            console.log(chalk.yellow(`\n⏳ Attempting registration ${i + 1}/${numAccounts}`));
            if (await registerAccount(refCode)) {
                successful++;
            }
        }

        console.log(chalk.green('\n=== Registration Summary ==='));
        console.log(chalk.cyan('-------------------------------------------'));
        console.log(chalk.green(`✅ Successfully registered: ${successful}/${numAccounts} accounts`));
        console.log(chalk.cyan(`📁 Details saved to: successful_registrations.txt`));
        console.log(chalk.cyan('-------------------------------------------'));

    } catch (error) {
        console.log(chalk.red(`\n❌ An unexpected error occurred: ${error.message}`));
    } finally {
        console.log(chalk.green('\n✨ Thank you for using the Bera Auto Register Bot!'));
        rl.close();
    }
}

// Start the program
main();
