module ffq::governance_nft {
    use std::string::{Self, String};
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_token::token::{Self, TokenDataId};
    
    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EINVALID_STUDENT: u64 = 2;
    const EGOVERNANCE_STORE_EXISTS: u64 = 3;
    
    /// Governance NFT collection name
    const COLLECTION_NAME: vector<u8> = b"Free Foodie Quest - Governance";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Governance NFTs for voting on food items";
    const COLLECTION_URI: vector<u8> = b"https://freefoodiequest.io/governance-nft";
    
    /// Governance NFT resource stored under BNI custodial account
    struct GovernanceNFTStore has key {
        /// Event handle for minting events
        mint_events: EventHandle<MintEvent>,
        /// Total governance NFTs minted
        total_minted: u64,
        /// Signer capability for token operations
        signer_cap: account::SignerCapability,
    }
    
    /// Mint event
    struct MintEvent has drop, store {
        student_address: address,
        token_id: TokenDataId,
        item_type: String,
        timestamp: u64,
    }
    
    /// Initialize the governance NFT module (called by BNI custodial wallet)
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        // Ensure not already initialized
        assert!(!exists<GovernanceNFTStore>(account_addr), EGOVERNANCE_STORE_EXISTS);
        
        // Create resource account for storing NFTs
        let (resource_signer, signer_cap) = account::create_resource_account(account, b"governance_nft");
        
        // Create the collection
        let collection_name = string::utf8(COLLECTION_NAME);
        let description = string::utf8(COLLECTION_DESCRIPTION);
        let uri = string::utf8(COLLECTION_URI);
        let maximum_supply = 0; // Unlimited supply
        let mutate_setting = vector<bool>[false, false, false]; // [description, uri, maximum]
        
        token::create_collection(
            &resource_signer,
            collection_name,
            description,
            uri,
            maximum_supply,
            mutate_setting
        );
        
        // Store governance NFT store
        move_to(account, GovernanceNFTStore {
            mint_events: account::new_event_handle<MintEvent>(account),
            total_minted: 0,
            signer_cap,
        });
    }
    
    /// Mint a governance NFT for a student (called by BNI custodial wallet after vote)
    public entry fun mint_governance_nft(
        account: &signer,
        student_address: address,
        item_type: String,
        item_name: String,
    ) acquires GovernanceNFTStore {
        let account_addr = signer::address_of(account);
        let store = borrow_global_mut<GovernanceNFTStore>(account_addr);
        
        // Create resource signer
        let resource_signer = account::create_signer_with_capability(&store.signer_cap);
        
        // Generate unique token name
        store.total_minted = store.total_minted + 1;
        let token_name = string::utf8(b"Governance Vote #");
        string::append(&mut token_name, num_to_string(store.total_minted));
        
        // Token description
        let description = string::utf8(b"Voted for ");
        string::append(&mut description, item_name);
        string::append(&mut description, string::utf8(b" ("));
        string::append(&mut description, item_type);
        string::append(&mut description, string::utf8(b")"));
        
        // Token URI
        let uri = string::utf8(b"https://freefoodiequest.io/nft/governance/");
        string::append(&mut uri, num_to_string(store.total_minted));
        
        let collection_name = string::utf8(COLLECTION_NAME);
        let token_data_id = token::create_tokendata(
            &resource_signer,
            collection_name,
            token_name,
            description,
            1, // Only 1 of each token
            uri,
            account_addr, // Royalty payee
            0, // Royalty denominator
            0, // Royalty numerator
            token::create_token_mutability_config(&vector<bool>[false, false, false, false, false]),
            vector<String>[], // Property keys
            vector<vector<u8>>[], // Property values
            vector<String>[], // Property types
        );
        
        // Mint token to student
        let token_id = token::mint_token(&resource_signer, token_data_id, 1);
        token::direct_transfer(&resource_signer, &resource_signer, token_id, 1);
        
        // Emit mint event
        event::emit_event(&mut store.mint_events, MintEvent {
            student_address,
            token_id: token_data_id,
            item_type,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Get total governance NFTs minted
    public fun get_total_minted(bni_address: address): u64 acquires GovernanceNFTStore {
        let store = borrow_global<GovernanceNFTStore>(bni_address);
        store.total_minted
    }
    
    /// Helper function to convert number to string (simplified)
    fun num_to_string(num: u64): String {
        if (num == 0) {
            return string::utf8(b"0")
        };
        
        let result = vector::empty<u8>();
        let temp = num;
        
        while (temp > 0) {
            let digit = ((temp % 10) as u8) + 48; // 48 is ASCII for '0'
            vector::push_back(&mut result, digit);
            temp = temp / 10;
        };
        
        vector::reverse(&mut result);
        string::utf8(result)
    }
}

