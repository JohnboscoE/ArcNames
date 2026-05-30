// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IUSDC {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract ArcNames is ERC721, Ownable {
    address public immutable usdc;
    address public immutable platform;
    uint256 public constant YEARLY_FEE = 5e6;
    uint256 private _nextTokenId;

    mapping(string => address) public nameToOwner;
    mapping(string => uint256) public nameExpiry;
    mapping(string => uint256) public nameToTokenId;
    mapping(uint256 => string) public tokenIdToName;
    mapping(address => string) public primaryName;
    string[] public allNames;

    event NameRegistered(string indexed name, address indexed owner, uint256 expiry, uint256 tokenId);
    event NameRenewed(string indexed name, uint256 newExpiry);
    event PrimaryNameSet(address indexed owner, string name);
    event NameTransferred(string indexed name, address indexed from, address indexed to);

    constructor(address _usdc, address _platform)
        ERC721("ArcNames", "ARCN") Ownable(_platform) {
        usdc     = _usdc;
        platform = _platform;
    }

    function _validateName(string calldata name) internal pure {
        bytes memory b = bytes(name);
        require(b.length >= 3,  "Name too short (min 3 chars)");
        require(b.length <= 32, "Name too long (max 32 chars)");
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 char = b[i];
            require(
                (char >= 0x61 && char <= 0x7A) ||
                (char >= 0x30 && char <= 0x39) ||
                char == 0x2D,
                "Invalid character - only a-z, 0-9, hyphen allowed"
            );
        }
    }

    function register(string calldata name, uint256 numYears) external {
        require(numYears >= 1 && numYears <= 10, "Years must be 1-10");
        _validateName(name);
        require(
            nameToOwner[name] == address(0) ||
            block.timestamp > nameExpiry[name],
            "Name already taken"
        );
        uint256 totalFee = YEARLY_FEE * numYears;
        IUSDC(usdc).transferFrom(msg.sender, platform, totalFee);
        if (nameToOwner[name] != address(0)) {
            _burn(nameToTokenId[name]);
        }
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        uint256 expiry = block.timestamp + (numYears * 365 days);
        nameToOwner[name]      = msg.sender;
        nameExpiry[name]       = expiry;
        nameToTokenId[name]    = tokenId;
        tokenIdToName[tokenId] = name;
        if (bytes(primaryName[msg.sender]).length == 0) {
            primaryName[msg.sender] = name;
        }
        allNames.push(name);
        emit NameRegistered(name, msg.sender, expiry, tokenId);
    }

    function renew(string calldata name, uint256 numYears) external {
        require(numYears >= 1 && numYears <= 10, "Years must be 1-10");
        require(nameToOwner[name] == msg.sender, "Not owner");
        require(block.timestamp <= nameExpiry[name], "Name expired");
        IUSDC(usdc).transferFrom(msg.sender, platform, YEARLY_FEE * numYears);
        nameExpiry[name] += numYears * 365 days;
        emit NameRenewed(name, nameExpiry[name]);
    }

    function setPrimaryName(string calldata name) external {
        require(nameToOwner[name] == msg.sender, "Not owner");
        require(block.timestamp <= nameExpiry[name], "Name expired");
        primaryName[msg.sender] = name;
        emit PrimaryNameSet(msg.sender, name);
    }

    function resolve(string calldata name) external view returns (address) {
        require(nameToOwner[name] != address(0), "Name not found");
        require(block.timestamp <= nameExpiry[name], "Name expired");
        return nameToOwner[name];
    }

    function reverseLookup(address wallet) external view returns (string memory) {
        return primaryName[wallet];
    }

    function isAvailable(string calldata name) external view returns (bool) {
        return nameToOwner[name] == address(0) || block.timestamp > nameExpiry[name];
    }

    function nameInfo(string calldata name) external view returns (
        address owner, uint256 expiry, uint256 tokenId, bool available
    ) {
        owner     = nameToOwner[name];
        expiry    = nameExpiry[name];
        tokenId   = nameToTokenId[name];
        available = owner == address(0) || block.timestamp > expiry;
    }

    function totalNames() external view returns (uint256) {
        return allNames.length;
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        super.transferFrom(from, to, tokenId);
        string memory name = tokenIdToName[tokenId];
        nameToOwner[name]  = to;
        if (keccak256(bytes(primaryName[from])) == keccak256(bytes(name))) {
            delete primaryName[from];
        }
        emit NameTransferred(name, from, to);
    }
}
