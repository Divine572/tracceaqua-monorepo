// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TracceAqua - Blockchain Seafood Traceability System
 * @dev Smart contract for tracking seafood supply chain and conservation records
 * @author TracceAqua Team
 */
contract TracceAqua is AccessControl, ReentrancyGuard, Pausable {

    // ===== ROLES =====
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RESEARCHER_ROLE = keccak256("RESEARCHER_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant FISHERMAN_ROLE = keccak256("FISHERMAN_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant TRADER_ROLE = keccak256("TRADER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    // ===== COUNTERS =====
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
        string status; // DRAFT, SUBMITTED, VERIFIED, REJECTED
        string ipfsHash; // Additional IPFS hash for extended data
    }

    struct SupplyChainRecord {
        uint256 id;
        string productId;
        string dataHash;
        address creator;
        uint256 timestamp;
        string currentStage;
        uint256 stageCount;
        bool verified;
        address verifier;
        uint256 verifiedAt;
        bool isPublic;
        string sourceType; // FARMED or WILD_CAPTURE
    }

    struct StageUpdate {
        string stage;
        address updatedBy;
        uint256 timestamp;
        string dataHash;
        string location;
        string notes;
        string[] fileHashes; // IPFS hashes of files for this stage
    }

    // ===== STATE VARIABLES =====
    mapping(string => ConservationRecord) public conservationRecords;
    mapping(string => SupplyChainRecord) public supplyChainRecords;
    mapping(string => bool) public conservationExists;
    mapping(string => bool) public supplyChainExists;
    mapping(uint256 => string) public conservationIdToSamplingId;
    mapping(uint256 => string) public supplyChainIdToProductId;
    mapping(address => uint256) public userRecordCount;
    
    // Supply chain stage history
    mapping(string => mapping(uint256 => StageUpdate)) public stageHistory;
    
    // User verification status
    mapping(address => bool) public verifiedUsers;
    
    // Contract metadata
    string public contractVersion = "1.0.0";
    uint256 public deploymentTimestamp;

    // ===== EVENTS =====
    event ConservationRecordCreated(
        uint256 indexed recordId,
        string indexed samplingId,
        address indexed researcher,
        string dataHash,
        uint256 timestamp
    );

    event ConservationRecordUpdated(
        uint256 indexed recordId,
        string indexed samplingId,
        string newDataHash,
        uint256 timestamp
    );

    event ConservationRecordVerified(
        uint256 indexed recordId,
        string indexed samplingId,
        address indexed verifier,
        uint256 timestamp
    );

    event SupplyChainRecordCreated(
        uint256 indexed recordId,
        string indexed productId,
        address indexed creator,
        string dataHash,
        string initialStage,
        string sourceType,
        uint256 timestamp
    );

    event SupplyChainStageUpdated(
        uint256 indexed recordId,
        string indexed productId,
        address indexed updatedBy,
        string newStage,
        string location,
        uint256 timestamp
    );

    event SupplyChainRecordVerified(
        uint256 indexed recordId,
        string indexed productId,
        address indexed verifier,
        uint256 timestamp
    );

    event UserVerified(
        address indexed user,
        address indexed verifier,
        uint256 timestamp
    );

    event ContractPaused(address indexed admin, uint256 timestamp);
    event ContractUnpaused(address indexed admin, uint256 timestamp);

    // ===== MODIFIERS =====
    modifier validSamplingId(string memory _samplingId) {
        require(bytes(_samplingId).length > 0 && bytes(_samplingId).length <= 100, "TracceAqua: Invalid sampling ID");
        _;
    }

    modifier validProductId(string memory _productId) {
        require(bytes(_productId).length > 0 && bytes(_productId).length <= 100, "TracceAqua: Invalid product ID");
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

    modifier onlyRecordOwnerOrAdmin(string memory _samplingId) {
        ConservationRecord memory record = conservationRecords[_samplingId];
        require(
            record.researcher == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "TracceAqua: Not authorized to modify this record"
        );
        _;
    }

    modifier onlyProductOwnerOrAdmin(string memory _productId) {
        SupplyChainRecord memory record = supplyChainRecords[_productId];
        require(
            record.creator == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "TracceAqua: Not authorized to modify this product"
        );
        _;
    }

    // ===== CONSTRUCTOR =====
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Set up role hierarchy
        _setRoleAdmin(RESEARCHER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(FARMER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(FISHERMAN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(PROCESSOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(TRADER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(RETAILER_ROLE, ADMIN_ROLE);
        
        deploymentTimestamp = block.timestamp;
        verifiedUsers[msg.sender] = true;
    }

    // ===== CONSERVATION FUNCTIONS =====

    /**
     * @dev Create a new conservation record
     * @param _samplingId Unique sampling identifier
     * @param _dataHash IPFS hash of the conservation data
     * @param _ipfsHash Additional IPFS hash for extended data
     */
    function createConservationRecord(
        string memory _samplingId,
        string memory _dataHash,
        string memory _ipfsHash
    ) 
        external 
        onlyRole(RESEARCHER_ROLE)
        validSamplingId(_samplingId)
        nonReentrant
        whenNotPaused
    {
        require(!conservationExists[_samplingId], "TracceAqua: Sampling ID already exists");
        require(bytes(_dataHash).length > 0, "TracceAqua: Invalid data hash");

        _conservationRecordCounter++;
        uint256 recordId = _conservationRecordCounter;

        ConservationRecord storage newRecord = conservationRecords[_samplingId];
        newRecord.id = recordId;
        newRecord.samplingId = _samplingId;
        newRecord.dataHash = _dataHash;
        newRecord.researcher = msg.sender;
        newRecord.timestamp = block.timestamp;
        newRecord.verified = false;
        newRecord.verifier = address(0);
        newRecord.verifiedAt = 0;
        newRecord.status = "SUBMITTED";
        newRecord.ipfsHash = _ipfsHash;

        conservationExists[_samplingId] = true;
        conservationIdToSamplingId[recordId] = _samplingId;
        userRecordCount[msg.sender]++;

        emit ConservationRecordCreated(recordId, _samplingId, msg.sender, _dataHash, block.timestamp);
    }

    /**
     * @dev Update an existing conservation record
     * @param _samplingId Sampling identifier
     * @param _dataHash New IPFS hash of the updated data
     * @param _ipfsHash New additional IPFS hash
     */
    function updateConservationRecord(
        string memory _samplingId,
        string memory _dataHash,
        string memory _ipfsHash
    )
        external
        conservationRecordExists(_samplingId)
        onlyRecordOwnerOrAdmin(_samplingId)
        nonReentrant
        whenNotPaused
    {
        ConservationRecord storage record = conservationRecords[_samplingId];
        require(!record.verified, "TracceAqua: Cannot update verified record");
        require(bytes(_dataHash).length > 0, "TracceAqua: Invalid data hash");

        record.dataHash = _dataHash;
        record.ipfsHash = _ipfsHash;
        record.timestamp = block.timestamp;

        emit ConservationRecordUpdated(record.id, _samplingId, _dataHash, block.timestamp);
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
        whenNotPaused
    {
        ConservationRecord storage record = conservationRecords[_samplingId];
        require(!record.verified, "TracceAqua: Record already verified");

        record.verified = true;
        record.verifier = msg.sender;
        record.verifiedAt = block.timestamp;
        record.status = "VERIFIED";

        emit ConservationRecordVerified(record.id, _samplingId, msg.sender, block.timestamp);
    }

    /**
     * @dev Reject a conservation record (Admin only)
     * @param _samplingId Sampling identifier
     */
    function rejectConservationRecord(string memory _samplingId)
        external
        onlyRole(ADMIN_ROLE)
        conservationRecordExists(_samplingId)
        nonReentrant
        whenNotPaused
    {
        ConservationRecord storage record = conservationRecords[_samplingId];
        require(!record.verified, "TracceAqua: Cannot reject verified record");

        record.status = "REJECTED";
        record.verifier = msg.sender;
        record.verifiedAt = block.timestamp;
    }

    // ===== SUPPLY CHAIN FUNCTIONS =====

    /**
     * @dev Create a new supply chain record
     * @param _productId Unique product identifier
     * @param _dataHash IPFS hash of the product data
     * @param _initialStage Initial stage in supply chain
     * @param _sourceType Source type (FARMED or WILD_CAPTURE)
     * @param _isPublic Whether the record is publicly traceable
     */
    function createSupplyChainRecord(
        string memory _productId,
        string memory _dataHash,
        string memory _initialStage,
        string memory _sourceType,
        bool _isPublic
    )
        external
        validProductId(_productId)
        nonReentrant
        whenNotPaused
    {
        require(!supplyChainExists[_productId], "TracceAqua: Product ID already exists");
        require(bytes(_dataHash).length > 0, "TracceAqua: Invalid data hash");
        require(bytes(_initialStage).length > 0, "TracceAqua: Invalid initial stage");
        require(_hasStagePermission(msg.sender, _initialStage), "TracceAqua: No permission for this stage");

        _supplyChainRecordCounter++;
        uint256 recordId = _supplyChainRecordCounter;

        SupplyChainRecord storage newRecord = supplyChainRecords[_productId];
        newRecord.id = recordId;
        newRecord.productId = _productId;
        newRecord.dataHash = _dataHash;
        newRecord.creator = msg.sender;
        newRecord.timestamp = block.timestamp;
        newRecord.currentStage = _initialStage;
        newRecord.stageCount = 1;
        newRecord.verified = false;
        newRecord.verifier = address(0);
        newRecord.verifiedAt = 0;
        newRecord.isPublic = _isPublic;
        newRecord.sourceType = _sourceType;

        // Add initial stage to history
        StageUpdate storage initialStage = stageHistory[_productId][0];
        initialStage.stage = _initialStage;
        initialStage.updatedBy = msg.sender;
        initialStage.timestamp = block.timestamp;
        initialStage.dataHash = _dataHash;
        initialStage.location = "";
        initialStage.notes = "Initial stage creation";

        supplyChainExists[_productId] = true;
        supplyChainIdToProductId[recordId] = _productId;
        userRecordCount[msg.sender]++;

        emit SupplyChainRecordCreated(recordId, _productId, msg.sender, _dataHash, _initialStage, _sourceType, block.timestamp);
    }

    /**
     * @dev Update supply chain stage
     * @param _productId Product identifier
     * @param _newStage New stage in supply chain
     * @param _dataHash IPFS hash of stage data
     * @param _location Location where stage occurred
     * @param _notes Notes about the stage update
     * @param _fileHashes Array of IPFS file hashes for this stage
     */
    function updateSupplyChainStage(
        string memory _productId,
        string memory _newStage,
        string memory _dataHash,
        string memory _location,
        string memory _notes,
        string[] memory _fileHashes
    )
        external
        supplyChainRecordExists(_productId)
        nonReentrant
        whenNotPaused
    {
        require(bytes(_newStage).length > 0, "TracceAqua: Invalid stage");
        require(_hasStagePermission(msg.sender, _newStage), "TracceAqua: No permission for this stage");

        SupplyChainRecord storage record = supplyChainRecords[_productId];
        require(!record.verified, "TracceAqua: Cannot update verified record");

        // Update current stage
        record.currentStage = _newStage;
        if (bytes(_dataHash).length > 0) {
            record.dataHash = _dataHash;
        }

        // Add to stage history
        StageUpdate storage newStageUpdate = stageHistory[_productId][record.stageCount];
        newStageUpdate.stage = _newStage;
        newStageUpdate.updatedBy = msg.sender;
        newStageUpdate.timestamp = block.timestamp;
        newStageUpdate.dataHash = _dataHash;
        newStageUpdate.location = _location;
        newStageUpdate.notes = _notes;
        newStageUpdate.fileHashes = _fileHashes;

        record.stageCount++;

        emit SupplyChainStageUpdated(record.id, _productId, msg.sender, _newStage, _location, block.timestamp);
    }

    /**
     * @dev Verify a supply chain record (Admin only)
     * @param _productId Product identifier
     */
    function verifySupplyChainRecord(string memory _productId)
        external
        onlyRole(ADMIN_ROLE)
        supplyChainRecordExists(_productId)
        nonReentrant
        whenNotPaused
    {
        SupplyChainRecord storage record = supplyChainRecords[_productId];
        require(!record.verified, "TracceAqua: Record already verified");

        record.verified = true;
        record.verifier = msg.sender;
        record.verifiedAt = block.timestamp;

        emit SupplyChainRecordVerified(record.id, _productId, msg.sender, block.timestamp);
    }

    /**
     * @dev Update public visibility of a supply chain record
     * @param _productId Product identifier
     * @param _isPublic New public visibility status
     */
    function updateProductVisibility(string memory _productId, bool _isPublic)
        external
        supplyChainRecordExists(_productId)
        onlyProductOwnerOrAdmin(_productId)
        nonReentrant
        whenNotPaused
    {
        supplyChainRecords[_productId].isPublic = _isPublic;
    }

    // ===== VIEW FUNCTIONS =====

    /**
     * @dev Get conservation record details
     * @param _samplingId Sampling identifier
     * @return Conservation record data
     */
    function getConservationRecord(string memory _samplingId)
        external
        view
        returns (ConservationRecord memory)
    {
        require(conservationExists[_samplingId], "TracceAqua: Record does not exist");
        return conservationRecords[_samplingId];
    }

    /**
     * @dev Get supply chain record details
     * @param _productId Product identifier
     * @return Supply chain record data
     */
    function getSupplyChainRecord(string memory _productId)
        external
        view
        returns (SupplyChainRecord memory)
    {
        require(supplyChainExists[_productId], "TracceAqua: Record does not exist");
        return supplyChainRecords[_productId];
    }

    /**
     * @dev Get stage history for a product
     * @param _productId Product identifier
     * @param _stageIndex Stage index to retrieve
     * @return Stage update data
     */
    function getStageHistory(string memory _productId, uint256 _stageIndex)
        external
        view
        returns (StageUpdate memory)
    {
        require(supplyChainExists[_productId], "TracceAqua: Record does not exist");
        SupplyChainRecord memory record = supplyChainRecords[_productId];
        require(_stageIndex < record.stageCount, "TracceAqua: Invalid stage index");
        
        return stageHistory[_productId][_stageIndex];
    }

    /**
     * @dev Get all stage history for a product
     * @param _productId Product identifier
     * @return Array of stage updates
     */
    function getAllStageHistory(string memory _productId)
        external
        view
        returns (StageUpdate[] memory)
    {
        require(supplyChainExists[_productId], "TracceAqua: Record does not exist");
        SupplyChainRecord memory record = supplyChainRecords[_productId];
        
        StageUpdate[] memory stages = new StageUpdate[](record.stageCount);
        for (uint256 i = 0; i < record.stageCount; i++) {
            stages[i] = stageHistory[_productId][i];
        }
        
        return stages;
    }

    /**
     * @dev Get total record counts
     * @return conservationCount The total number of conservation records
     * @return supplyChainCount The total number of supply chain records
     */
    function getRecordCounts()
        external
        view
        returns (uint256 conservationCount, uint256 supplyChainCount)
    {
        return (_conservationRecordCounter, _supplyChainRecordCounter);
    }

    /**
     * @dev Get user's record count
     * @param _user User address
     * @return Number of records created by user
     */
    function getUserRecordCount(address _user) external view returns (uint256) {
        return userRecordCount[_user];
    }

    /**
     * @dev Check if user is verified
     * @param _user User address
     * @return Whether user is verified
     */
    function isUserVerified(address _user) external view returns (bool) {
        return verifiedUsers[_user];
    }

    /**
     * @dev Get current conservation record counter
     * @return Current conservation record count
     */
    function getCurrentConservationCounter() external view returns (uint256) {
        return _conservationRecordCounter;
    }

    /**
     * @dev Get current supply chain record counter
     * @return Current supply chain record count
     */
    function getCurrentSupplyChainCounter() external view returns (uint256) {
        return _supplyChainRecordCounter;
    }

    /**
     * @dev Get contract metadata
     * @return version and deployment timestamp
     */
    function getContractInfo() external view returns (string memory version, uint256 deployedAt) {
        return (contractVersion, deploymentTimestamp);
    }

    // ===== ADMIN FUNCTIONS =====

    /**
     * @dev Grant role to user (Admin only)
     * @param _user User address
     * @param _role Role to grant
     */
    function grantUserRole(address _user, bytes32 _role)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_user != address(0), "TracceAqua: Invalid user address");
        grantRole(_role, _user);
    }

    /**
     * @dev Revoke role from user (Admin only)
     * @param _user User address
     * @param _role Role to revoke
     */
    function revokeUserRole(address _user, bytes32 _role)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_user != address(0), "TracceAqua: Invalid user address");
        revokeRole(_role, _user);
    }

    /**
     * @dev Verify a user (Admin only)
     * @param _user User address to verify
     */
    function verifyUser(address _user)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_user != address(0), "TracceAqua: Invalid user address");
        verifiedUsers[_user] = true;
        emit UserVerified(_user, msg.sender, block.timestamp);
    }

    /**
     * @dev Unverify a user (Admin only)
     * @param _user User address to unverify
     */
    function unverifyUser(address _user)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_user != address(0), "TracceAqua: Invalid user address");
        verifiedUsers[_user] = false;
    }

    /**
     * @dev Pause contract (Admin only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit ContractPaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Unpause contract (Admin only)
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Emergency function to update contract version (Admin only)
     * @param _newVersion New version string
     */
    function updateContractVersion(string memory _newVersion)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(bytes(_newVersion).length > 0, "TracceAqua: Invalid version");
        contractVersion = _newVersion;
    }

    // ===== INTERNAL FUNCTIONS =====

    /**
     * @dev Check if user has permission for a specific stage
     * @param _user User address
     * @param _stage Stage name
     * @return Whether user has permission
     */
    function _hasStagePermission(address _user, string memory _stage) internal view returns (bool) {
        bytes32 stageHash = keccak256(abi.encodePacked(_stage));
        
        // Hatchery, Grow-out, and Harvest stages for farmers
        if (stageHash == keccak256(abi.encodePacked("HATCHERY")) || 
            stageHash == keccak256(abi.encodePacked("GROW_OUT")) ||
            stageHash == keccak256(abi.encodePacked("HARVEST"))) {
            return hasRole(FARMER_ROLE, _user) || hasRole(ADMIN_ROLE, _user);
        }
        
        // Fishing stage for fishermen
        if (stageHash == keccak256(abi.encodePacked("FISHING"))) {
            return hasRole(FISHERMAN_ROLE, _user) || hasRole(ADMIN_ROLE, _user);
        }
        
        // Processing stage for processors
        if (stageHash == keccak256(abi.encodePacked("PROCESSING"))) {
            return hasRole(PROCESSOR_ROLE, _user) || hasRole(ADMIN_ROLE, _user);
        }
        
        // Distribution stage for traders
        if (stageHash == keccak256(abi.encodePacked("DISTRIBUTION"))) {
            return hasRole(TRADER_ROLE, _user) || hasRole(ADMIN_ROLE, _user);
        }
        
        // Retail stage for retailers
        if (stageHash == keccak256(abi.encodePacked("RETAIL"))) {
            return hasRole(RETAILER_ROLE, _user) || hasRole(ADMIN_ROLE, _user);
        }
        
        // Admins can access any stage
        return hasRole(ADMIN_ROLE, _user);
    }

    // ===== PUBLIC GETTERS FOR ROLES =====
    
    function getAdminRole() external pure returns (bytes32) {
        return ADMIN_ROLE;
    }
    
    function getResearcherRole() external pure returns (bytes32) {
        return RESEARCHER_ROLE;
    }
    
    function getFarmerRole() external pure returns (bytes32) {
        return FARMER_ROLE;
    }
    
    function getFishermanRole() external pure returns (bytes32) {
        return FISHERMAN_ROLE;
    }
    
    function getProcessorRole() external pure returns (bytes32) {
        return PROCESSOR_ROLE;
    }
    
    function getTraderRole() external pure returns (bytes32) {
        return TRADER_ROLE;
    }
    
    function getRetailerRole() external pure returns (bytes32) {
        return RETAILER_ROLE;
    }

    // ===== BATCH OPERATIONS =====

    /**
     * @dev Create multiple conservation records in batch (Admin only)
     * @param _samplingIds Array of sampling IDs
     * @param _dataHashes Array of data hashes
     * @param _researchers Array of researcher addresses
     */
    function batchCreateConservationRecords(
        string[] memory _samplingIds,
        string[] memory _dataHashes,
        address[] memory _researchers
    )
        external
        onlyRole(ADMIN_ROLE)
        nonReentrant
        whenNotPaused
    {
        require(_samplingIds.length == _dataHashes.length && _dataHashes.length == _researchers.length, 
                "TracceAqua: Array length mismatch");
        require(_samplingIds.length <= 50, "TracceAqua: Batch size too large");

        for (uint256 i = 0; i < _samplingIds.length; i++) {
            require(!conservationExists[_samplingIds[i]], "TracceAqua: Sampling ID already exists");
            require(bytes(_dataHashes[i]).length > 0, "TracceAqua: Invalid data hash");

            _conservationRecordCounter++;
            uint256 recordId = _conservationRecordCounter;

            ConservationRecord storage newRecord = conservationRecords[_samplingIds[i]];
            newRecord.id = recordId;
            newRecord.samplingId = _samplingIds[i];
            newRecord.dataHash = _dataHashes[i];
            newRecord.researcher = _researchers[i];
            newRecord.timestamp = block.timestamp;
            newRecord.verified = false;
            newRecord.status = "SUBMITTED";

            conservationExists[_samplingIds[i]] = true;
            conservationIdToSamplingId[recordId] = _samplingIds[i];
            userRecordCount[_researchers[i]]++;

            emit ConservationRecordCreated(recordId, _samplingIds[i], _researchers[i], _dataHashes[i], block.timestamp);
        }
    }

    /**
     * @dev Verify multiple conservation records in batch (Admin only)
     * @param _samplingIds Array of sampling IDs to verify
     */
    function batchVerifyConservationRecords(string[] memory _samplingIds)
        external
        onlyRole(ADMIN_ROLE)
        nonReentrant
        whenNotPaused
    {
        require(_samplingIds.length <= 50, "TracceAqua: Batch size too large");

        for (uint256 i = 0; i < _samplingIds.length; i++) {
            require(conservationExists[_samplingIds[i]], "TracceAqua: Record does not exist");
            
            ConservationRecord storage record = conservationRecords[_samplingIds[i]];
            if (!record.verified) {
                record.verified = true;
                record.verifier = msg.sender;
                record.verifiedAt = block.timestamp;
                record.status = "VERIFIED";

                emit ConservationRecordVerified(record.id, _samplingIds[i], msg.sender, block.timestamp);
            }
        }
    }
}