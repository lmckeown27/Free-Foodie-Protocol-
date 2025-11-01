module ffq::allocation_nft {
    use std::string::{Self, String};
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_token::token::{Self, TokenDataId};
    
    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EALLOCATION_STORE_EXISTS: u64 = 2;
    const EALLOCATION_NOT_FOUND: u64 = 3;
    const EALREADY_REDEEMED: u64 = 4;
    
    /// Allocation NFT collection name
    const COLLECTION_NAME: vector<u8> = b"Free Foodie Quest - Allocations";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Allocation NFTs representing food claim rights";
    const COLLECTION_URI: vector<u8> = b"https://freefoodiequest.io/allocation-nft";
    
    /// Allocation NFT resource
    struct AllocationNFTStore has key {
        /// Event handles
        mint_events: EventHandle<MintEvent>,
        redeem_events: EventHandle<RedeemEvent>,
        /// Total allocations minted
        total_minted: u64,
        /// Total allocations redeemed
        total_redeemed: u64,
        /// Signer capability
        signer_cap: account::SignerCapability,
    }
    
    /// Allocation metadata
    struct AllocationMetadata has store, drop {
        student_address: address,
        item_name: String,
        quantity: u64,
        poas_score: u64, // Multiplied by 100 for precision (e.g., 95.5 = 9550)
        is_redeemed: bool,
    }
    
    /// Mint event
    struct MintEvent has drop, store {
        student_address: address,
        token_id: TokenDataId,
        item_name: String,
        quantity: u64,
        poas_score: u64,
        timestamp: u64,
    }
    
    /// Redeem event
    struct RedeemEvent has drop, store {
        student_address: address,
        token_id: TokenDataId,
        timestamp: u64,
    }
    
    /// Initialize allocation NFT module
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<AllocationNFTStore>(account_addr), EALLOCATION_STORE_EXISTS);
        
        let (resource_signer, signer_cap) = account::create_resource_account(account, b"allocation_nft");
        
        let collection_name = string::utf8(COLLECTION_NAME);
        let description = string::utf8(COLLECTION_DESCRIPTION);
        let uri = string::utf8(COLLECTION_URI);
        
        token::create_collection(
            &resource_signer,
            collection_name,
            description,
            uri,
            0, // Unlimited
            vector<bool>[false, false, false]
        );
        
        move_to(account, AllocationNFTStore {
            mint_events: account::new_event_handle<MintEvent>(account),
            redeem_events: account::new_event_handle<RedeemEvent>(account),
            total_minted: 0,
            total_redeemed: 0,
            signer_cap,
        });
    }
    
    /// Mint allocation NFT
    public entry fun mint_allocation_nft(
        account: &signer,
        student_address: address,
        item_name: String,
        quantity: u64,
        poas_score: u64,
    ) acquires AllocationNFTStore {
        let account_addr = signer::address_of(account);
        let store = borrow_global_mut<AllocationNFTStore>(account_addr);
        
        let resource_signer = account::create_signer_with_capability(&store.signer_cap);
        
        store.total_minted = store.total_minted + 1;
        let token_name = string::utf8(b"Allocation #");
        string::append(&mut token_name, num_to_string(store.total_minted));
        
        let description = string::utf8(b"Allocation for ");
        string::append(&mut description, num_to_string(quantity));
        string::append(&mut description, string::utf8(b"x "));
        string::append(&mut description, item_name);
        string::append(&mut description, string::utf8(b" | POAS: "));
        string::append(&mut description, num_to_string(poas_score / 100));
        
        let uri = string::utf8(b"https://freefoodiequest.io/nft/allocation/");
        string::append(&mut uri, num_to_string(store.total_minted));
        
        let collection_name = string::utf8(COLLECTION_NAME);
        let token_data_id = token::create_tokendata(
            &resource_signer,
            collection_name,
            token_name,
            description,
            1,
            uri,
            account_addr,
            0,
            0,
            token::create_token_mutability_config(&vector<bool>[false, false, false, false, false]),
            vector<String>[
                string::utf8(b"student_address"),
                string::utf8(b"item_name"),
                string::utf8(b"quantity"),
                string::utf8(b"poas_score"),
                string::utf8(b"is_redeemed")
            ],
            vector<vector<u8>>[
                bcs::to_bytes(&student_address),
                bcs::to_bytes(&item_name),
                bcs::to_bytes(&quantity),
                bcs::to_bytes(&poas_score),
                bcs::to_bytes(&false)
            ],
            vector<String>[
                string::utf8(b"address"),
                string::utf8(b"String"),
                string::utf8(b"u64"),
                string::utf8(b"u64"),
                string::utf8(b"bool")
            ],
        );
        
        let token_id = token::mint_token(&resource_signer, token_data_id, 1);
        token::direct_transfer(&resource_signer, &resource_signer, token_id, 1);
        
        event::emit_event(&mut store.mint_events, MintEvent {
            student_address,
            token_id: token_data_id,
            item_name,
            quantity,
            poas_score,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Redeem allocation NFT (burn or mark as redeemed)
    public entry fun redeem_allocation_nft(
        account: &signer,
        token_id: TokenDataId,
        student_address: address,
    ) acquires AllocationNFTStore {
        let account_addr = signer::address_of(account);
        let store = borrow_global_mut<AllocationNFTStore>(account_addr);
        
        // In a full implementation, would check token properties and burn/update
        // For now, just emit event and increment counter
        store.total_redeemed = store.total_redeemed + 1;
        
        event::emit_event(&mut store.redeem_events, RedeemEvent {
            student_address,
            token_id,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Get statistics
    public fun get_stats(bni_address: address): (u64, u64) acquires AllocationNFTStore {
        let store = borrow_global<AllocationNFTStore>(bni_address);
        (store.total_minted, store.total_redeemed)
    }
    
    /// Helper: Convert number to string
    fun num_to_string(num: u64): String {
        if (num == 0) {
            return string::utf8(b"0")
        };
        
        let result = vector::empty<u8>();
        let temp = num;
        
        while (temp > 0) {
            let digit = ((temp % 10) as u8) + 48;
            vector::push_back(&mut result, digit);
            temp = temp / 10;
        };
        
        vector::reverse(&mut result);
        string::utf8(result)
    }
}

