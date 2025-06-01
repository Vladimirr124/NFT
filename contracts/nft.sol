// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SupetUniqueToken is ERC721, Ownable {
    uint256 private _nextTokenId;
    uint256 private _price;
    uint256 private _maxSupply;

    constructor(address initialOwner, uint256 price, uint256 maxSupply)
        ERC721("SupetUniqueToken", "SUT")
        Ownable(initialOwner)
    {
        _price = price;
        _maxSupply = maxSupply;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://www.miladymaker.net/milady/json/8918";
    }

    function safeMint(address to) public onlyOwner returns (uint256) {
        require(super.balanceOf(to) < 1, "Address already owns a token");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

        function buy(address to) public payable {
        require( _nextTokenId < _maxSupply, "Max supply reached");
        require(msg.value >= _price, "Insufficient payment");
        require(super.balanceOf(to) < 1, "Address already owns a token");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "No balance to withdraw");
        payable(owner()).transfer(address(this).balance);
    }
}
