
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TracceAqua
 * @dev Blockchain-based seafood traceability system
 * @author TracceAqua Team
 */
contract TracceAqua is AccessControl, ReentrancyGuard {
    // ===== ROLES =====
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RESEARCHER_ROLE = keccak256("RESEARCHER_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant FISHERMAN_ROLE = keccak256("FISHERMAN_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant TRADER_ROLE = keccak256("TRADER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    // ===== MANUAL COUNTERS =====
    uint256 private _conservationRecordCounter;
    uint256 private _supplyChainRecordCounter;

    // ===== STRUCTS =====

    struct ConservationRecord {
        uint256 id;
        string samplingId;
        string dataHash;
        address researcher;
        uint256 timestamp;
        bool verified;
        address verifier;
        uint256 verifiedAt;
        string status; // DRAFT, SUBMITTED, VERIFIED, PUBLISHED
    }

    struct SupplyChainRecord {
        uint256 id;
        string productId;
        string dataHash;
        address creator;
        uint256 timestamp;
        string sourceType; // FARMED, WILD_CAPTURE
        string currentStage;
        address[] stakeholders;
        bool isActive;
        bool isPublic;
    }

    struct StageUpdate {
        address updatedBy;
        string stage;
        string dataHash;
        uint256 timestamp;
        string notes;
    }

    // ===== MAPPINGS =====
    mapping(string => ConservationRecord) public conservationRecords;
    mapping(string => bool) public conservationExists;
    mapping(uint256 => string) public conservationIdToSamplingId;

    mapping(string => SupplyChainRecord) public supplyChainRecords;
    mapping(string => bool) public supplyChainExists;
    mapping(uint256 => string) public supplyChainIdToProductId;
    mapping(string => StageUpdate[]) public productStageHistory;

    mapping(address => bool) public authorizedUsers;
    mapping(address => uint256) public userRecordCount;

    // ===== EVENTS =====

    // Conservation Events
    event ConservationRecordCreated(
        uint256 indexed id,
        string indexed samplingId,
        address indexed researcher,
        string dataHash
    );

    event ConservationRecordUpdated(
        string indexed samplingId,
        address indexed researcher,
        string dataHash
    );

    event ConservationRecordVerified(
        string indexed samplingId,
        address indexed verifier,
        uint256 verifiedAt
    );

    // Supply Chain Events
    event SupplyChainRecordCreated(
        uint256 indexed id,
        string indexed productId,
        address indexed creator,
        string sourceType
    );

    event SupplyChainStageUpdated(
        string indexed productId,
        address indexed updatedBy,
        string stage,
        string dataHash
    );

    event StakeholderAdded(
        string indexed productId,
        address indexed stakeholder,
        string role
    );

    // Access Control Events
    event UserAuthorized(address indexed user, address indexed admin);
    event UserDeauthorized(address indexed user, address indexed admin);

    // ===== MODIFIERS =====
    modifier onlyAuthorized() {
        require(
            authorizedUsers[msg.sender] || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "TracceAqua: Not authorized"
        );
        _;
    }

    modifier validSamplingId(string memory _samplingId) {
        require(bytes(_samplingId).length > 0, "TracceAqua: Invalid sampling ID");
        _;
    }

    modifier validProductId(string memory _productId) {
        require(bytes(_productId).length > 0, "TracceAqua: Invalid product ID");
        _;
    }

    modifier conservationRecordExists(string memory _samplingId) {
        require(conservationExists[_samplingId], "TracceAqua: Conservation record does not exist");
        _;
    }

    modifier supplyChainRecordExists(string memory _productId) {
        require(supplyChainExists[_productId], "TracceAqua: Supply chain record does not exist");
        _;
    }

    // ===== CONSTRUCTOR =====
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        authorizedUsers[msg.sender] = true;
        
        // Initialize counters
        _conservationRecordCounter = 0;
        _supplyChainRecordCounter = 0;
    }

    // ===== MANUAL COUNTER FUNCTIONS =====
    
    /**
     * @dev Increment conservation record counter and return new value
     */
    function _incrementConservationCounter() private returns (uint256) {
        _conservationRecordCounter += 1;
        return _conservationRecordCounter;
    }

    /**
     * @dev Increment supply chain record counter and return new value
     */
    function _incrementSupplyChainCounter() private returns (uint256) {
        _supplyChainRecordCounter += 1;
        return _supplyChainRecordCounter;
    }

    /**
     * @dev Get current conservation record counter
     */
    function getCurrentConservationCounter() external view returns (uint256) {
        return _conservationRecordCounter;
    }

    /**
     * @dev Get current supply chain record counter
     */
    function getCurrentSupplyChainCounter() external view returns (uint256) {
        return _supplyChainRecordCounter;
    }

    // ===== CONSERVATION FUNCTIONS =====

    /**
     * @dev Create a new conservation record
     * @param _samplingId Unique sampling identifier
     * @param _dataHash IPFS hash of the conservation data
     */
    function createConservationRecord(
        string memory _samplingId,
        string memory _dataHash
    ) 
        external 
        onlyRole(RESEARCHER_ROLE)
        validSamplingId(_samplingId)
        nonReentrant
    {
        require(!conservationExists[_samplingId], "TracceAqua: Sampling ID already exists");
        require(bytes(_dataHash).length > 0, "TracceAqua: Invalid data hash");

        uint256 recordId = _incrementConservationCounter();

        ConservationRecord memory newRecord = ConservationRecord({
            id: recordId,
            samplingId: _samplingId,
            dataHash: _dataHash,
            researcher: msg.sender,
            timestamp: block.timestamp,
            verified: false,
            verifier: address(0),
            verifiedAt: 0,
            status: "SUBMITTED"
        });

        conservationRecords[_samplingId] = newRecord;
        conservationExists[_samplingId] = true;
        conservationIdToSamplingId[recordId] = _samplingId;
        userRecordCount[msg.sender]++;

        emit ConservationRecordCreated(recordId, _samplingId, msg.sender, _dataHash);
    }

    /**
     * @dev Update an existing conservation record
     * @param _samplingId Sampling identifier
     * @param _dataHash New IPFS hash of the updated data
     */
    function updateConservationRecord(
        string memory _samplingId,
        string memory _dataHash
    )
        external
        conservationRecordExists(_samplingId)
        nonReentrant
    {
        ConservationRecord storage record = conservationRecords[_samplingId];
        
        require(
            record.researcher == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "TracceAqua: Not authorized to update this record"
        );
        
        require(!record.verified, "TracceAqua: Cannot update verified record");
        require(bytes(_dataHash).length > 0, "TracceAqua: Invalid data hash");

        record.dataHash = _dataHash;

        emit ConservationRecordUpdated(_samplingId, msg.sender, _dataHash);
    }

    /**
     * @dev Verify a conservation record (Admin only)
     * @param _samplingId Sampling identifier
     */
    function verifyConservationRecord(string memory _samplingId)
        external
        onlyRole(ADMIN_ROLE)
        conservationRecordExists(_samplingId)
        nonReentrant
    {
        ConservationRecord storage record = conservationRecords[_samplingId];
        require(!record.verified, "TracceAqua: Record already verified");

        record.verified = true;
        record.verifier = msg.sender;
        record.verifiedAt = block.timestamp;
        record.status = "VERIFIED";

        emit ConservationRecordVerified(_samplingId, msg.sender, block.timestamp);
    }

    // ===== SUPPLY CHAIN FUNCTIONS =====

    /**
     * @dev Create a new supply chain record
     * @param _productId Unique product identifier
     * @param _dataHash IPFS hash of the initial product data
     * @param _sourceType Product source type (FARMED or WILD_CAPTURE)
     * @param _initialStage Initial stage of the product
     */
    function createSupplyChainRecord(
        string memory _productId,
        string memory _dataHash,
        string memory _sourceType,
        string memory _initialStage
    )
        external
        onlyAuthorized
        validProductId(_productId)
        nonReentrant
    {
        require(!supplyChainExists[_productId], "TracceAqua: Product ID already exists");
        require(bytes(_dataHash).length > 0, "TracceAqua: Invalid data hash");
        require(bytes(_sourceType).length > 0, "TracceAqua: Invalid source type");
        require(bytes(_initialStage).length > 0, "TracceAqua: Invalid initial stage");

        uint256 recordId = _incrementSupplyChainCounter();

        // Create stakeholders array with initial stakeholder
        address[] memory initialStakeholders = new address[](1);
        initialStakeholders[0] = msg.sender;

        SupplyChainRecord memory newRecord = SupplyChainRecord({
            id: recordId,
            productId: _productId,
            dataHash: _dataHash,
            creator: msg.sender,
            timestamp: block.timestamp,
            sourceType: _sourceType,
            currentStage: _initialStage,
            stakeholders: initialStakeholders,
            isActive: true,
            isPublic: true
        });

        supplyChainRecords[_productId] = newRecord;
        supplyChainExists[_productId] = true;
        supplyChainIdToProductId[recordId] = _productId;
        userRecordCount[msg.sender]++;

        // Add initial stage to history
        productStageHistory[_productId].push(StageUpdate({
            updatedBy: msg.sender,
            stage: _initialStage,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            notes: "Initial record creation"
        }));

        emit SupplyChainRecordCreated(recordId, _productId, msg.sender, _sourceType);
    }

    /**
     * @dev Update supply chain stage
     * @param _productId Product identifier
     * @param _stage New stage name
     * @param _dataHash IPFS hash of the stage data
     * @param _notes Optional notes for the stage update
     */
    function updateSupplyChainStage(
        string memory _productId,
        string memory _stage,
        string memory _dataHash,
        string memory _notes
    )
        external
        onlyAuthorized
        supplyChainRecordExists(_productId)
        nonReentrant
    {
        require(bytes(_stage).length > 0, "TracceAqua: Invalid stage");
        require(bytes(_dataHash).length > 0, "TracceAqua: Invalid data hash");

        SupplyChainRecord storage record = supplyChainRecords[_productId];
        require(record.isActive, "TracceAqua: Product record is not active");

        // Update current stage
        record.currentStage = _stage;
        record.dataHash = _dataHash;

        // Add stakeholder if not already present
        bool isStakeholder = false;
        for (uint i = 0; i < record.stakeholders.length; i++) {
            if (record.stakeholders[i] == msg.sender) {
                isStakeholder = true;
                break;
            }
        }

        if (!isStakeholder) {
            record.stakeholders.push(msg.sender);
        }

        // Add to stage history
        productStageHistory[_productId].push(StageUpdate({
            updatedBy: msg.sender,
            stage: _stage,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            notes: _notes
        }));

        emit SupplyChainStageUpdated(_productId, msg.sender, _stage, _dataHash);
    }

    /**
     * @dev Add stakeholder to supply chain record
     * @param _productId Product identifier
     * @param _stakeholder Address of the stakeholder to add
     * @param _role Role of the stakeholder
     */
    function addStakeholder(
        string memory _productId,
        address _stakeholder,
        string memory _role
    )
        external
        onlyRole(ADMIN_ROLE)
        supplyChainRecordExists(_productId)
        nonReentrant
    {
        require(_stakeholder != address(0), "TracceAqua: Invalid stakeholder address");
        require(bytes(_role).length > 0, "TracceAqua: Invalid role");

        SupplyChainRecord storage record = supplyChainRecords[_productId];
        
        // Check if stakeholder already exists
        for (uint i = 0; i < record.stakeholders.length; i++) {
            require(record.stakeholders[i] != _stakeholder, "TracceAqua: Stakeholder already exists");
        }

        record.stakeholders.push(_stakeholder);

        emit StakeholderAdded(_productId, _stakeholder, _role);
    }

    /**
     * @dev Set product visibility
     * @param _productId Product identifier
     * @param _isPublic Whether the product should be publicly traceable
     */
    function setProductVisibility(
        string memory _productId,
        bool _isPublic
    )
        external
        supplyChainRecordExists(_productId)
        nonReentrant
    {
        SupplyChainRecord storage record = supplyChainRecords[_productId];
        
        require(
            record.creator == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "TracceAqua: Not authorized to change visibility"
        );

        record.isPublic = _isPublic;
    }

    // ===== ACCESS CONTROL FUNCTIONS =====

    /**
     * @dev Grant role to user (Admin only)
     * @param role Role to grant
     * @param account Account to grant role to
     */
    function grantUserRole(bytes32 role, address account) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(account != address(0), "TracceAqua: Invalid account");
        _grantRole(role, account);
        authorizedUsers[account] = true;
        
        emit UserAuthorized(account, msg.sender);
    }

    /**
     * @dev Revoke role from user (Admin only)
     * @param role Role to revoke
     * @param account Account to revoke role from
     */
    function revokeUserRole(bytes32 role, address account) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(account != address(0), "TracceAqua: Invalid account");
        _revokeRole(role, account);
        
        // Check if user still has any roles
        if (!hasAnyRole(account)) {
            authorizedUsers[account] = false;
        }

        emit UserDeauthorized(account, msg.sender);
    }

    /**
     * @dev Authorize user (Admin only)
     * @param user User address to authorize
     */
    function authorizeUser(address user) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(user != address(0), "TracceAqua: Invalid user address");
        authorizedUsers[user] = true;
        
        emit UserAuthorized(user, msg.sender);
    }

    /**
     * @dev Deauthorize user (Admin only)
     * @param user User address to deauthorize
     */
    function deauthorizeUser(address user) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(user != address(0), "TracceAqua: Invalid user address");
        authorizedUsers[user] = false;
        
        emit UserDeauthorized(user, msg.sender);
    }

    // ===== VIEW FUNCTIONS =====

    /**
     * @dev Get conservation record
     * @param _samplingId Sampling identifier
     */
    function getConservationRecord(string memory _samplingId)
        external
        view
        conservationRecordExists(_samplingId)
        returns (ConservationRecord memory)
    {
        return conservationRecords[_samplingId];
    }

    /**
     * @dev Get supply chain record
     * @param _productId Product identifier
     */
    function getSupplyChainRecord(string memory _productId)
        external
        view
        supplyChainRecordExists(_productId)
        returns (SupplyChainRecord memory)
    {
        SupplyChainRecord memory record = supplyChainRecords[_productId];
        require(record.isPublic || msg.sender == record.creator || hasRole(ADMIN_ROLE, msg.sender),
                "TracceAqua: Product not publicly accessible");
        
        return record;
    }

    /**
     * @dev Get product stage history
     * @param _productId Product identifier
     */
    function getProductStageHistory(string memory _productId)
        external
        view
        supplyChainRecordExists(_productId)
        returns (StageUpdate[] memory)
    {
        SupplyChainRecord memory record = supplyChainRecords[_productId];
        require(record.isPublic || msg.sender == record.creator || hasRole(ADMIN_ROLE, msg.sender),
                "TracceAqua: Product not publicly accessible");
                
        return productStageHistory[_productId];
    }

    /**
     * @dev Get product stakeholders
     * @param _productId Product identifier
     */
    function getProductStakeholders(string memory _productId)
        external
        view
        supplyChainRecordExists(_productId)
        returns (address[] memory)
    {
        return supplyChainRecords[_productId].stakeholders;
    }

    /**
     * @dev Get total conservation records count
     */
    function getTotalConservationRecords() external view returns (uint256) {
        return _conservationRecordCounter;
    }

    /**
     * @dev Get total supply chain records count
     */
    function getTotalSupplyChainRecords() external view returns (uint256) {
        return _supplyChainRecordCounter;
    }

    /**
     * @dev Get user record count
     * @param user User address
     */
    function getUserRecordCount(address user) external view returns (uint256) {
        return userRecordCount[user];
    }

    /**
     * @dev Check if user is authorized
     * @param user User address
     */
    function isUserAuthorized(address user) external view returns (bool) {
        return authorizedUsers[user] || hasRole(DEFAULT_ADMIN_ROLE, user);
    }

    /**
     * @dev Check if user has any role
     * @param account Account to check
     */
    function hasAnyRole(address account) public view returns (bool) {
        return (
            hasRole(DEFAULT_ADMIN_ROLE, account) ||
            hasRole(ADMIN_ROLE, account) ||
            hasRole(RESEARCHER_ROLE, account) ||
            hasRole(FARMER_ROLE, account) ||
            hasRole(FISHERMAN_ROLE, account) ||
            hasRole(PROCESSOR_ROLE, account) ||
            hasRole(TRADER_ROLE, account) ||
            hasRole(RETAILER_ROLE, account)
        );
    }

    // ===== UTILITY FUNCTIONS =====

    /**
     * @dev Get contract version
     */
    function getVersion() external pure returns (string memory) {
        return "1.0.0";
    }

    /**
     * @dev Get contract name
     */
    function getName() external pure returns (string memory) {
        return "TracceAqua";
    }

    // ===== EMERGENCY FUNCTIONS =====

    /**
     * @dev Emergency pause for supply chain record (Admin only)
     * @param _productId Product identifier
     */
    function pauseSupplyChainRecord(string memory _productId)
        external
        onlyRole(ADMIN_ROLE)
        supplyChainRecordExists(_productId)
    {
        supplyChainRecords[_productId].isActive = false;
    }

    /**
     * @dev Emergency unpause for supply chain record (Admin only)
     * @param _productId Product identifier
     */
    function unpauseSupplyChainRecord(string memory _productId)
        external
        onlyRole(ADMIN_ROLE)
        supplyChainRecordExists(_productId)
    {
        supplyChainRecords[_productId].isActive = true;
    }
}