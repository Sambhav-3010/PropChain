// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract LandRegistration1155 is ERC1155, AccessControl {
    /* ─────────────── roles ─────────────── */
    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");
    bytes32 public constant BUYER_ROLE  = keccak256("BUYER_ROLE");

    /* ─────────────── fraud detection ─────────────── */
    uint256 public constant FRAUD_THRESHOLD = 10;

    // Track transactions between specific buyer-seller pairs
    mapping(bytes32 => uint256) public transactionCount;
    mapping(bytes32 => bool) public flaggedPairs;
    mapping(bytes32 => uint256[]) public transactionHistory;

    /* ─────────────── Auto-role tracking ─────────────── */
    mapping(address => bool) public hasReceivedAutoRoles; // Track who got auto roles

    /* ───────────── data model ───────────── */
    struct Land {
        uint256 id;
        string  propertyAddress;
        uint256 totalLandArea;
        uint256 postalCode;
        string  propertyName;
        bool    isShared;
        uint256 totalShares;
        uint256 pricePerShare;
        uint256 availableShares;
        address originalOwner;
        bool    forSale;
        uint256 wholePrice;
    }

    uint256 private _tokenIdCounter = 1;
    mapping(uint256 => Land) public lands;
    mapping(bytes32 => bool) private propertySeen;

    /* ───────────── events ───────────── */
    event LandRegistered(uint256 indexed landId, address indexed owner);
    event LandFractionalised(uint256 indexed landId, uint256 shares, uint256 pricePerShare);
    event SharesPurchased(uint256 indexed landId, address indexed buyer, uint256 amount);
    event WholeListed(uint256 indexed landId, uint256 priceWei);
    event WholeDelisted(uint256 indexed landId);
    event WholeSold(uint256 indexed landId, address indexed buyer, uint256 priceWei);
    
    /* ─────────────── fraud detection events ─────────────── */
    event SuspiciousActivity(address indexed buyer, address indexed seller, uint256 transactionCount, uint256 indexed landId);
    event PairFlagged(address indexed buyer, address indexed seller, uint256 totalTransactions);

    /* ─────────────── Auto-role events ─────────────── */
    event AutoRolesGranted(address indexed user);

    /* ────────── constructor ─────────── */
    constructor(string memory defaultURI) ERC1155(defaultURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /* ───── supportsInterface override ──── */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /* ─────────────── Auto-role granting function ─────────────── */
    
    /// Users call this when they first interact with the platform
    function requestAutoRoles() external {
        // Don't grant roles to admin or if already granted
        require(!hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Admin doesn't need auto roles");
        require(!hasReceivedAutoRoles[msg.sender], "Roles already granted");
        
        // Grant both buyer and seller roles automatically
        _grantRole(BUYER_ROLE, msg.sender);
        _grantRole(SELLER_ROLE, msg.sender);
        
        // Mark as having received auto roles
        hasReceivedAutoRoles[msg.sender] = true;
        
        emit AutoRolesGranted(msg.sender);
    }

    /// Auto-grant roles modifier - grants roles if user doesn't have them
    modifier autoGrantRoles() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender) && 
            !hasReceivedAutoRoles[msg.sender]) {
            _grantRole(BUYER_ROLE, msg.sender);
            _grantRole(SELLER_ROLE, msg.sender);
            hasReceivedAutoRoles[msg.sender] = true;
            emit AutoRolesGranted(msg.sender);
        }
        _;
    }

    /* ─────────────── fraud detection helper functions ─────────────── */
    
    function _getPairHash(address buyer, address seller) internal pure returns (bytes32) {
        if (buyer < seller) {
            return keccak256(abi.encodePacked(buyer, seller));
        } else {
            return keccak256(abi.encodePacked(seller, buyer));
        }
    }

    function _checkFraudulentActivity(address buyer, address seller, uint256 landId) internal {
        bytes32 pairHash = _getPairHash(buyer, seller);
        
        transactionCount[pairHash]++;
        transactionHistory[pairHash].push(landId);
        
        uint256 count = transactionCount[pairHash];
        
        if (count >= FRAUD_THRESHOLD - 1) {
            emit SuspiciousActivity(buyer, seller, count, landId);
        }
        
        if (count >= FRAUD_THRESHOLD && !flaggedPairs[pairHash]) {
            flaggedPairs[pairHash] = true;
            emit PairFlagged(buyer, seller, count);
        }
    }

    function isPairFlagged(address buyer, address seller) external view returns (bool) {
        bytes32 pairHash = _getPairHash(buyer, seller);
        return flaggedPairs[pairHash];
    }

    function getTransactionCount(address buyer, address seller) external view returns (uint256) {
        bytes32 pairHash = _getPairHash(buyer, seller);
        return transactionCount[pairHash];
    }

    function getTransactionHistory(address buyer, address seller) 
        external 
        view 
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (uint256[] memory) 
    {
        bytes32 pairHash = _getPairHash(buyer, seller);
        return transactionHistory[pairHash];
    }

    function setFlaggedPair(address buyer, address seller, bool flagged) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        bytes32 pairHash = _getPairHash(buyer, seller);
        flaggedPairs[pairHash] = flagged;
        
        if (flagged) {
            emit PairFlagged(buyer, seller, transactionCount[pairHash]);
        }
    }

    modifier notFlagged(address buyer, address seller) {
        bytes32 pairHash = _getPairHash(buyer, seller);
        require(!flaggedPairs[pairHash], "Transaction blocked: flagged pair");
        _;
    }

    /* ───── modifiers ───── */
    modifier onlySeller() {
        require(hasRole(SELLER_ROLE, msg.sender), "not seller");
        _;
    }
    modifier onlyAuthorized() {
        require(
            hasRole(BUYER_ROLE, msg.sender) ||
            hasRole(SELLER_ROLE, msg.sender) ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "not authorized"
        );
        _;
    }
    modifier landExists(uint256 id) {
        require(lands[id].id != 0, "land does not exist");
        _;
    }

    /* ───── register land ───── */
    function registerLand(
        string calldata addr,
        uint256 area,
        uint256 postal,
        string calldata name
    ) external autoGrantRoles  returns (uint256 id) {

        bytes32 hash = keccak256(abi.encodePacked(addr, area, postal, name));
        require(!propertySeen[hash], "property already registered");

        id = _tokenIdCounter++;
        lands[id] = Land({
            id: id,
            propertyAddress: addr,
            totalLandArea: area,
            postalCode: postal,
            propertyName: name,
            isShared: false,
            totalShares: 1,
            pricePerShare: 0,
            availableShares: 0,
            originalOwner: msg.sender,
            forSale: false,
            wholePrice: 0
        });
        propertySeen[hash] = true;

        _mint(msg.sender, id, 1, "");
        emit LandRegistered(id, msg.sender);
    }

    /* ───── whole-parcel trading ───── */
    function listWhole(uint256 id, uint256 priceWei) external landExists(id) autoGrantRoles {
        Land storage l = lands[id];
        require(!l.isShared, "already shared");
        require(balanceOf(msg.sender, id) == 1, "not owner");
        require(priceWei > 0, "price=0");

        l.forSale = true;
        l.wholePrice = priceWei;
        emit WholeListed(id, priceWei);
    }

    function delistWhole(uint256 id) external landExists(id) autoGrantRoles {
        Land storage l = lands[id];
        require(l.forSale, "not listed");
        require(
            balanceOf(msg.sender, id) == 1 || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "not owner / admin"
        );

        l.forSale = false;
        l.wholePrice = 0;
        emit WholeDelisted(id);
    }

    function buyWhole(uint256 id)
        external
        payable
        autoGrantRoles
        onlyAuthorized
        landExists(id)
        notFlagged(msg.sender, lands[id].originalOwner)
    {
        Land storage l = lands[id];
        require(!l.isShared, "shared land");
        require(l.forSale, "not for sale");
        require(msg.value == l.wholePrice, "wrong ETH amount");

        address seller = l.originalOwner;

        _safeTransferFrom(seller, msg.sender, id, 1, "");

        l.forSale = false;
        l.wholePrice = 0;
        l.originalOwner = msg.sender;

        (bool ok, ) = payable(seller).call{value: msg.value}("");
        require(ok, "ETH transfer failed");

        _checkFraudulentActivity(msg.sender, seller, id);

        emit WholeSold(id, msg.sender, msg.value);
    }

    /* ───── fractionalisation ───── */
    function fractionalise(uint256 id, uint256 shares, uint256 pricePerShare)
        external
        landExists(id)
        autoGrantRoles
    {
        Land storage l = lands[id];
        require(!l.isShared, "already shared");
        require(balanceOf(msg.sender, id) == 1, "not owner");
        require(shares > 1, "shares<=1");
        require(pricePerShare > 0, "price/share=0");

        _burn(msg.sender, id, 1);

        l.isShared = true;
        l.totalShares = shares;
        l.pricePerShare = pricePerShare;
        l.availableShares = shares;

        _mint(msg.sender, id, shares, "");
        emit LandFractionalised(id, shares, pricePerShare);
    }

    /* ───── buy shares ───── */
    function buyShares(uint256 id, uint256 amount)
        external
        payable
        autoGrantRoles
        onlyAuthorized
        landExists(id)
        notFlagged(msg.sender, lands[id].originalOwner)
    {
        Land storage l = lands[id];
        require(l.isShared && l.availableShares >= amount, "not enough shares");

        uint256 cost = amount * l.pricePerShare;
        require(msg.value == cost, "wrong ETH");

        address seller = l.originalOwner;

        (bool ok, ) = payable(seller).call{value: cost}("");
        require(ok, "ETH fail");

        _safeTransferFrom(seller, msg.sender, id, amount, "");

        l.availableShares -= amount;

        _checkFraudulentActivity(msg.sender, seller, id);

        emit SharesPurchased(id, msg.sender, amount);
    }

    /* ───── secondary share transfer ───── */
    function transferShares(address to, uint256 id, uint256 amount) 
        external 
        autoGrantRoles
        notFlagged(msg.sender, to)
    {
        require(lands[id].isShared, "land not shared");
        _safeTransferFrom(msg.sender, to, id, amount, "");
    }

    /* ───── defragment ───── */
    function defragmentLand(uint256 id) external landExists(id) autoGrantRoles {
        Land storage l = lands[id];
        require(l.isShared, "not shared");
        require(balanceOf(msg.sender, id) == l.totalShares, "need all shares");

        _burn(msg.sender, id, l.totalShares);

        l.isShared = false;
        l.totalShares = 1;
        l.pricePerShare = 0;
        l.availableShares = 0;
        l.originalOwner = msg.sender;

        _mint(msg.sender, id, 1, "");
    }

    /* ───── view helpers ───── */
    function ownershipPercentage(address account, uint256 id)
        external
        view
        landExists(id)
        returns (uint256)
    {
        Land memory l = lands[id];
        uint256 bal = balanceOf(account, id);
        return (bal * 100) / l.totalShares;
    }

    function getLandDetails(uint256 id)
        external
        view

        landExists(id)
        returns (
            Land memory details,
            address currentOwner,
            bool isShared,
            uint256 totalShares,
            uint256 availableShares,
            uint256 pricePerShare
        )
    {
        Land memory land = lands[id];
        return (
            land,
            land.originalOwner,
            land.isShared,
            land.totalShares,
            land.availableShares,
            land.pricePerShare
        );
    }

    /* ─────────────── NEW: PUBLIC MARKETPLACE FUNCTIONS ─────────────── */
    
    /// PUBLIC function for marketplace viewing - no authentication required
    /// This allows anyone to browse properties without connecting wallet
    function getMarketplaceDetails(uint256 id)
        external
        view
        landExists(id)
        returns (
            string memory propertyAddress,
            uint256 totalLandArea,
            string memory propertyName,
            bool forSale,
            uint256 wholePrice,
            bool isShared,
            uint256 totalShares,
            uint256 availableShares,
            uint256 pricePerShare
        )
    {
        Land memory land = lands[id];
        return (
            land.propertyAddress,
            land.totalLandArea,
            land.propertyName,
            land.forSale,
            land.wholePrice,
            land.isShared,
            land.totalShares,
            land.availableShares,
            land.pricePerShare
        );
    }

    /// Get all property IDs for marketplace browsing
    function getAllPropertyIds() 
        external 
        view 
        returns (uint256[] memory propertyIds) 
    {
        uint256 totalProperties = _tokenIdCounter - 1;
        uint256[] memory ids = new uint256[](totalProperties);
        
        for (uint256 i = 1; i <= totalProperties; i++) {
            ids[i-1] = i;
        }
        
        return ids;
    }

    //get properties owned by a user
    function getLandsByOwner(address owner) 
        external 
        view 
        returns (uint256[] memory ownedIds) 
    {
        uint256 totalProperties = _tokenIdCounter - 1;
        uint256[] memory tempIds = new uint256[](totalProperties);
        uint256 ownedCount = 0;
        
        // First pass: count and collect owned properties
        for (uint256 i = 1; i <= totalProperties; i++) {
            if (balanceOf(owner, i) > 0) {
                tempIds[ownedCount] = i;
                ownedCount++;
            }
        }
        
        // Create correctly sized array
        ownedIds = new uint256[](ownedCount);
        for (uint256 i = 0; i < ownedCount; i++) {
            ownedIds[i] = tempIds[i];
        }
        
        
        return ownedIds;
    }

    /// Get only properties that are for sale (marketplace filter)
    function getPropertiesForSale() 
        external 
        view 
        returns (uint256[] memory forSaleIds) 
    {
        uint256 totalProperties = _tokenIdCounter - 1;
        uint256[] memory tempIds = new uint256[](totalProperties);
        uint256 forSaleCount = 0;
        
        // First pass: count and collect for-sale properties
        for (uint256 i = 1; i <= totalProperties; i++) {
            if (lands[i].forSale) {
                tempIds[forSaleCount] = i;
                forSaleCount++;
            }
        }
        
        // Create correctly sized array
        forSaleIds = new uint256[](forSaleCount);
        for (uint256 i = 0; i < forSaleCount; i++) {
            forSaleIds[i] = tempIds[i];
        }
        
        return forSaleIds;
    }

    /// Get total number of registered properties
    function getTotalProperties() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    /* ─────────────── Helper functions ─────────────── */
    
    /// Check if user has received auto roles
    function hasAutoRoles(address user) external view returns (bool) {
        return hasReceivedAutoRoles[user];
    }

    /// Get user's current roles
    function getUserRoles(address user) external view returns (bool isBuyer, bool isSeller, bool isAdmin) {
        return (
            hasRole(BUYER_ROLE, user),
            hasRole(SELLER_ROLE, user),
            hasRole(DEFAULT_ADMIN_ROLE, user)
        );
    }
}