// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.3/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.3/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.3/contracts/access/Ownable.sol";

contract SomniaPersonaNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    struct Persona {
        string name;
        string specialization;
        uint256 mintedAt;
        address creator;
    }

    mapping(uint256 => Persona) public personas;
    mapping(address => uint256[]) public userPersonas;

    event PersonaMinted(address indexed owner, uint256 indexed tokenId, string name, string specialization);
    event PersonaUpdated(uint256 indexed tokenId, string newURI);

    constructor() ERC721("RivalismeUniverse Persona", "RVPERSONA") {
        _tokenIdCounter = 0;
    }

    function mintPersona(
        address to,
        string memory name,
        string memory specialization,
        string memory uri
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(specialization).length > 0, "Specialization cannot be empty");
        require(bytes(uri).length > 0, "URI cannot be empty");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        personas[tokenId] = Persona({
            name: name,
            specialization: specialization,
            mintedAt: block.timestamp,
            creator: msg.sender
        });

        userPersonas[to].push(tokenId);

        emit PersonaMinted(to, tokenId, name, specialization);

        return tokenId;
    }

    function mintMyPersona(
        string memory name,
        string memory specialization,
        string memory uri
    ) public returns (uint256) {
        return mintPersona(msg.sender, name, specialization, uri);
    }

    function getPersonasByOwner(address owner)
        public
        view
        returns (uint256[] memory)
    {
        return userPersonas[owner];
    }

    function getPersona(uint256 tokenId)
        public
        view
        returns (
            string memory name,
            string memory specialization,
            uint256 mintedAt,
            address creator,
            address currentOwner
        )
    {
        require(_ownerOf(tokenId) != address(0), "Persona does not exist");

        Persona memory p = personas[tokenId];
        return (
            p.name,
            p.specialization,
            p.mintedAt,
            p.creator,
            ownerOf(tokenId)
        );
    }

    function updateTokenURI(uint256 tokenId, string memory newURI) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _setTokenURI(tokenId, newURI);
        emit PersonaUpdated(tokenId, newURI);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function personaExists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // Overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
