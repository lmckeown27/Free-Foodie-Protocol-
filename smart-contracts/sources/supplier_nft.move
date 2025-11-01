module ffq::supplier_nft {
    use std::string::{Self, String};
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_token::token::{Self, TokenDataId};
    
    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const ESUPPLIER_STORE_EXISTS: u64 = 2;
    
    /// Supplier NFT collection name
    const COLLECTION_NAME: vector<u8> = b"Free Foodie Quest - Suppliers";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Supplier NFTs tracking food donations and compliance";
    const COLLECTION_URI: vector<u8> = b"https://freefoodiequest.io/supplier-nft";
    
    /// Supplier NFT store
    struct SupplierNFTStore has key {
        /// Event handle
        mint_events: EventHandle<MintEvent>,
        /// Total supplier NFTs minted
        total_minted: u64,
        /// Signer capability
        signer_cap: account::SignerCapability,
    }
    
    /// Mint event
    struct MintEvent has drop, store {
        supplier_address: address,
        token_id: TokenDataId,
        item_name: String,
        quantity: u64,
        donation_type: String,
        timestamp: u64,
    }
    
    /// Initialize supplier NFT module
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<SupplierNFTStore>(account_addr), ESUPPLIER_STORE_EXISTS);
        
        let (resource_signer, signer_cap) = account::create_resource_account(account, b"supplier_nft");
        
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
        
        move_to(account, SupplierNFTStore {
            mint_events: account::new_event_handle<MintEvent>(account),
            total_minted: 0,
            signer_cap,
        });
    }
    
    /// Mint supplier NFT for donation tracking
    public entry fun mint_supplier_nft(
        account: &signer,
        supplier_address: address,
        item_name: String,
        quantity: u64,
        donation_type: String,
        compliance_notes: String,
    ) acquires SupplierNFTStore {
        let account_addr = signer::address_of(account);
        let store = borrow_global_mut<SupplierNFTStore>(account_addr);
        
        let resource_signer = account::create_signer_with_capability(&store.signer_cap);
        
        store.total_minted = store.total_minted + 1;
        let token_name = string::utf8(b"Supplier Donation #");
        string::append(&mut token_name, num_to_string(store.total_minted));
        
        let description = string::utf8(b"Donation: ");
        string::append(&mut description, num_to_string(quantity));
        string::append(&mut description, string::utf8(b"x "));
        string::append(&mut description, item_name);
        string::append(&mut description, string::utf8(b" | Type: "));
        string::append(&mut description, donation_type);
        string::append(&mut description, string::utf8(b" | "));
        string::append(&mut description, compliance_notes);
        
        let uri = string::utf8(b"https://freefoodiequest.io/nft/supplier/");
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
                string::utf8(b"supplier_address"),
                string::utf8(b"item_name"),
                string::utf8(b"quantity"),
                string::utf8(b"donation_type"),
                string::utf8(b"compliance_notes")
            ],
            vector<vector<u8>>[
                bcs::to_bytes(&supplier_address),
                bcs::to_bytes(&item_name),
                bcs::to_bytes(&quantity),
                bcs::to_bytes(&donation_type),
                bcs::to_bytes(&compliance_notes)
            ],
            vector<String>[
                string::utf8(b"address"),
                string::utf8(b"String"),
                string::utf8(b"u64"),
                string::utf8(b"String"),
                string::utf8(b"String")
            ],
        );
        
        let token_id = token::mint_token(&resource_signer, token_data_id, 1);
        token::direct_transfer(&resource_signer, &resource_signer, token_id, 1);
        
        event::emit_event(&mut store.mint_events, MintEvent {
            supplier_address,
            token_id: token_data_id,
            item_name,
            quantity,
            donation_type,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Get total supplier NFTs minted
    public fun get_total_minted(bni_address: address): u64 acquires SupplierNFTStore {
        let store = borrow_global<SupplierNFTStore>(bni_address);
        store.total_minted
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

