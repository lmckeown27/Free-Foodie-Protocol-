# Petra Wallet Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you set up Petra Wallet and start using the Free Foodie Quest platform.

---

## Step 1: Install Petra Wallet

### Browser Extension

1. Visit [https://petra.app/](https://petra.app/)
2. Click "Download" and select your browser:
   - Chrome
   - Brave
   - Edge
   - Firefox (coming soon)
3. Click "Add to Browser"
4. Pin the extension to your toolbar

### Create a New Wallet

1. Click the Petra extension icon
2. Select "Create a new wallet"
3. **Write down your 12-word seed phrase** (KEEP THIS SAFE!)
4. Verify your seed phrase
5. Create a password
6. Click "Create Wallet"

**⚠️ IMPORTANT:** Never share your seed phrase with anyone!

---

## Step 2: Get Devnet APT

You need APT tokens to pay for gas fees on the Aptos blockchain.

### Using Aptos Faucet

1. Open Petra wallet
2. Click the network dropdown (top right)
3. Select "Devnet"
4. Copy your wallet address (click the address to copy)
5. Visit [https://aptoslabs.com/testnet-faucet](https://aptoslabs.com/testnet-faucet)
6. Paste your address
7. Click "Faucet" or "Get APT"
8. Wait ~10 seconds
9. Check your Petra wallet - you should see 1 APT

**Note:** You can request more APT anytime from the faucet.

---

## Step 3: Connect to FFQ

1. Start the FFQ frontend:
   ```bash
   cd frontend
   npm start
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Click "Get Started" on the landing page

4. Select your role:
   - **Student** (to vote and receive allocations)
   - **Supplier** (to donate food)
   - **Pantry Worker** (to manage operations)

5. Look for the **"Connect Petra Wallet"** button in the top right

6. Click it → Petra popup appears → Click "Connect"

7. You're connected! Your wallet address will display as `0x1234...5678`

---

## Step 4: Test Wallet Integration

### As a Student

1. Go to the **Voting** page
2. Select an item (e.g., "Apples")
3. Choose priority (1-5)
4. Click "Vote"
5. **Petra popup appears** → Review transaction → Click "Approve"
6. Wait for confirmation (~5-10 seconds)
7. Success! You've minted a Governance NFT

**What happened on-chain:**
- Governance NFT minted to your wallet
- Transaction recorded on Aptos blockchain
- Your voting power increased

### As a Supplier

1. Go to **Supplier Dashboard**
2. Click "Add New Donation"
3. Fill in donation details:
   - Item name: "Fresh Apples"
   - Quantity: 50
   - Type: Produce
   - Expiration date
4. Click "Submit"
5. **Petra popup** → Approve transaction
6. Success! Supplier NFT minted

**What happened on-chain:**
- Supplier NFT minted to your wallet
- Donation recorded immutably
- VLCP compliance logged

### As a Pantry Worker

1. Go to **Pantry Worker Dashboard**
2. View pending allocations
3. Click "Approve Allocation" for a student
4. **Petra popup** → Approve transaction
5. Success! Allocation NFT minted for student

**What happened on-chain:**
- Allocation NFT minted to student's wallet
- Student can now redeem for food
- POAS score recorded

---

## Step 5: View Your NFTs

### In Petra Wallet

1. Open Petra
2. Click "NFTs" tab
3. See your FFQ NFTs:
   - 🗳️ Governance NFTs (from voting)
   - 🎟️ Allocation NFTs (food claim tickets)
   - 📦 Supplier NFTs (donation badges)

### On Aptos Explorer

1. Click any transaction hash link in FFQ
2. View full transaction details
3. See gas fees, timestamp, status
4. Verify on-chain data

---

## Troubleshooting

### "Petra wallet not detected"

**Fix:**
1. Make sure Petra extension is installed
2. Refresh the FFQ page
3. Try again

### "Insufficient funds for gas"

**Fix:**
1. Visit [Aptos Faucet](https://aptoslabs.com/testnet-faucet)
2. Request more devnet APT
3. Wait for confirmation
4. Retry transaction

### "Transaction pending too long"

**Fix:**
- Devnet can be slow sometimes
- Check [Aptos Explorer](https://explorer.aptoslabs.com/?network=devnet)
- Search your transaction hash
- If successful, you're good (ignore timeout message)

### "Network mismatch"

**Fix:**
1. Open Petra wallet
2. Click network dropdown (top right)
3. Select "Devnet"
4. Refresh FFQ page

---

## Understanding Transaction Flow

```
┌──────────────┐
│ User Action  │  (Vote, Donate, Approve)
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ FFQ Frontend     │  (Construct transaction payload)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Petra Wallet     │  (Sign transaction)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Aptos Blockchain │  (Execute smart contract)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Confirmation     │  (NFT minted, state updated)
└──────────────────┘
```

---

## Gas Fees Explained

### What is Gas?

Gas is the fee paid to execute transactions on the Aptos blockchain.

### How Much Does It Cost?

On **Devnet**:
- Minting NFT: ~0.0001 APT ($0 in devnet)
- Transferring NFT: ~0.00005 APT
- Batch operations: ~0.0005 APT

On **Mainnet** (future):
- Prices will be similar
- APT has real value
- FFQ may subsidize gas for students

### Why Do I Need APT?

Every transaction on Aptos requires APT to pay validators who process the transaction.

---

## Security Tips

### ✅ DO:

- Keep your seed phrase in a safe place (offline)
- Verify transaction details before signing
- Only connect to trusted dapps
- Use Petra's password protection
- Check transaction history regularly

### ❌ DON'T:

- Share your seed phrase with anyone
- Take screenshots of your seed phrase
- Connect to suspicious websites
- Approve transactions you don't understand
- Use mainnet wallet for testing

---

## Next Steps

### Learn More

- 📖 Read [Full Integration Guide](./PETRA_WALLET_INTEGRATION.md)
- 🔧 Check [API Reference](./PETRA_WALLET_INTEGRATION.md#api-reference)
- 🏗️ Review [Smart Contracts](../smart-contracts/)

### Try Advanced Features (Coming Soon)

- Multi-sig approvals (Petra Vault)
- NFT gallery view
- Transaction history
- Batch operations

---

## Support Resources

- **Petra Docs:** [petra.app/docs](https://petra.app/docs)
- **Aptos Docs:** [aptos.dev](https://aptos.dev)
- **FFQ GitHub:** [github.com/lmckeown27/Free-Foodie-Protocol](https://github.com/lmckeown27/Free-Foodie-Protocol)
- **Aptos Discord:** [discord.gg/aptoslabs](https://discord.gg/aptoslabs)

---

## FAQ

**Q: Is this real money?**  
A: No! Devnet APT has no value. It's for testing only.

**Q: Can I use the same wallet for mainnet later?**  
A: You CAN, but it's recommended to create a new wallet for mainnet.

**Q: What if I lose my seed phrase?**  
A: Your wallet is PERMANENTLY LOST. Always back up your seed phrase.

**Q: How many transactions can I do?**  
A: Unlimited! Request more APT from the faucet as needed.

**Q: Does FFQ have access to my wallet?**  
A: NO. Only YOU can sign transactions. FFQ only requests signatures.

**Q: Can I use a different wallet (Martian, Pontem)?**  
A: Yes! FFQ supports multiple Aptos wallets, but Petra is recommended.

---

**Happy Testing! 🎉**

For questions or issues, check the [Full Integration Guide](./PETRA_WALLET_INTEGRATION.md) or open a GitHub issue.

