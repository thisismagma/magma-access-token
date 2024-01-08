// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MagmaAccessToken is ERC1155 {
    address public tokenAdministrator;

    constructor(string memory _uri, address _tokenAdministrator) ERC1155(_uri) {
        tokenAdministrator = _tokenAdministrator;
    }

    function setTokenAdministrator(address _newTokenAdministrator) public {
        require(msg.sender == tokenAdministrator, "sender must be tokenAdministrator");
        tokenAdministrator = _newTokenAdministrator;
    }

    function mint(address _to, uint256 _id, uint256 _amount, bytes memory _data) public {
        require(msg.sender == tokenAdministrator, "sender must be tokenAdministrator");
        _mint(_to, _id, _amount, _data);
    }

    function setUri(string calldata _newUri) public {
        require(msg.sender == tokenAdministrator, "sender must be tokenAdministrator");
        _setURI(_newUri);
    }
}
