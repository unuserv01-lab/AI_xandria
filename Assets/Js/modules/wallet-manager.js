// assets/js/modules/wallet-manager.js
async function mintPersonaNFT(personaId) {
    // 1. Get persona data from database via API
    const persona = await fetch(`/api/persona/${personaId}`).then(r => r.json());
    
    // 2. Connect to Somnia smart contract
    const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
    );
    
    // 3. Mint NFT
    const tx = await contract.mintMyPersona(
        persona.name,
        persona.description,
        persona.metadataUri  // ipfs://...
    );
    
    // 4. Wait for confirmation
    const receipt = await tx.wait();
    
    // 5. Update database with token ID
    await fetch(`/api/persona/${personaId}/mint`, {
        method: 'POST',
        body: JSON.stringify({
            tokenId: receipt.events[0].args.tokenId,
            txHash: tx.hash
        })
    });
    
    return receipt;
}
